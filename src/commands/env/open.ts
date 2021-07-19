/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { URL } from 'url';
import { Command, Flags } from '@oclif/core';
import { Logger, Messages, Org, SfdxError } from '@salesforce/core';
import * as open from 'open';
import type { Options } from 'open';
import { isArray } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'open');

type Environment = { name: string; openUrl: string };

export type OpenResult = { url: string };

export default class EnvOpen extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static flags = {
    path: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.path.summary'),
    }),
    'url-only': Flags.boolean({
      char: 'r',
      summary: messages.getMessage('flags.url-only.summary'),
    }),
    'target-env': Flags.string({
      char: 'e',
      summary: messages.getMessage('flags.target-env.summary'),
      description: messages.getMessage('flags.target-env.description'),
    }),
    browser: Flags.string({
      summary: messages.getMessage('flags.browser.summary'),
      description: messages.getMessage('flags.browser.description'),
    }),
  };

  public async run(): Promise<OpenResult> {
    const { flags } = await this.parse(EnvOpen);
    const nameOrAlias = flags['target-env'];
    let url: string;

    if (!nameOrAlias) {
      // TODO this should be retrieved from sf config once we have those commands. If not found, still throw.
      throw messages.createError('error.NoDefaultEnv');
    }

    try {
      const org = await Org.create({ aliasOrUsername: nameOrAlias });
      const conn = org.getConnection();
      await org.refreshAuth();
      const authInfo = conn.getAuthInfo();
      url = authInfo.getOrgFrontDoorUrl();
    } catch (err) {
      if (err instanceof Error && err.name !== 'NamedOrgNotFoundError' && err.name !== 'AuthInfoCreationError') {
        throw err;
      }
      /* Expected - Do nothing */
    }

    if (!url) {
      let foundEnvs: Environment[] = [];
      const push = (envs: Environment | Environment[]): void => {
        foundEnvs = [...foundEnvs, ...(isArray(envs) ? envs : [envs])];
      };
      await this.config.runHook('environments-request', { push });

      const foundEnv = foundEnvs.find((env) => env.name === nameOrAlias);

      if (!foundEnv) {
        throw messages.createError('error.NoEnvFound', [nameOrAlias]);
      }

      url = foundEnv.openUrl;
    }

    if (url) {
      if (flags.path) {
        const fdUrl = new URL(url);
        fdUrl.searchParams.append('retURL', flags.path);
        url = fdUrl.toString();
      }
      if (flags['url-only']) {
        this.log(url);
      } else {
        const browser = flags.browser;
        const browserName = browser ? browser : 'the default browser';

        await this.open(url, browser);
        this.log(`Opening ${nameOrAlias} in ${browserName}.`);
      }
    } else {
      throw messages.createError('error.EnvironmentNotSupported', [nameOrAlias]);
    }
    return { url };
  }

  // TODO login and env open should probably share the same open code. Maybe we should use cli-ux.open?
  private async open(url: string, browser: string): Promise<void> {
    let options: Options;

    if (browser) {
      if (browser?.toLowerCase().includes('chrome')) {
        browser = open.apps.chrome as string;
      }

      if (browser?.toLowerCase().includes('firefox')) {
        browser = open.apps.firefox as string;
      }

      if (browser?.toLowerCase().includes('edge')) {
        browser = open.apps.edge as string;
      }
      options = { app: { name: browser } };
    }

    const chunks = [];
    const process = await open(url, options);

    return new Promise((resolve, reject) => {
      process.stderr.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

      const resolveOrReject = (code): void => {
        // stderr could contain warnings or random data, so we will only error if we know there is a valid error.
        const validErrors = [
          'Unable to find application named',
          'InvalidOperationException',
          'cannot find file',
          'cannot be run',
        ];
        const errorMessage = Buffer.concat(chunks).toString('utf8');

        if (code > 0 || validErrors.find((error) => errorMessage.includes(error))) {
          Logger.childFromRoot('open').debug(errorMessage);
          reject(messages.createError('error.ApplicationNotFound', [browser]));
        } else {
          resolve();
        }
      };

      // This never seems to fire.
      process.once('error', (err) => reject(new SfdxError(err.message, 'OpenError')));

      // These are sometimes not fired (non-deterministic) for whatever reason, especially on windows. We will just rely on known errors in stderr.
      // It could be because of See https://github.com/sindresorhus/open/issues/144 but hacking around the open library didn't
      // seem to fix it.
      // process.once('close', resolveOrReject);
      // process.once('exit', resolveOrReject);

      // Nothing is ever printed to stdout, but we really only care about stderr.
      process.stderr.once('close', resolveOrReject);
    });
  }
}
