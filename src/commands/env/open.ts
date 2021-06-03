/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';

import { Command, Flags } from '@oclif/core';
import { Messages, Org, SfdxError } from '@salesforce/core';
import * as open from 'open';
import type { Options } from 'open';
import { isArray } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'open');

type Environment = { name: string; openUrl: string };

export default class EnvOpen extends Command {
  // Use summary and description until a summary is supported in oclif
  public static readonly description = messages.getMessage('description') + EOL + messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static flags = {
    path: Flags.string({
      char: 'p',
      description: messages.getMessage('flags.path.summary'),
    }),
    'url-only': Flags.boolean({
      char: 'r',
      description: messages.getMessage('flags.url-only.summary'),
    }),
    'target-env': Flags.string({
      char: 'e',
      description: messages.getMessage('flags.target-env.summary'),
    }),
    browser: Flags.string({
      description: messages.getMessage('flags.browser.summary'),
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EnvOpen);
    const nameOrAlias = flags['target-env'];
    let url;

    if (!nameOrAlias) {
      // TODO this should be retrieved from sf config once we have those commands. If not found, still throw.
      throw messages.createError('error.NoDefaultEnv');
    }

    try {
      const org = await Org.create({ aliasOrUsername: nameOrAlias });
      const conn = org.getConnection();
      await org.refreshAuth();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore in the next core version
      url = conn.options.authInfo.getOrgFrontDoorUrl(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
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
      options = { app: { name: browser } };
    }

    const chunks = [];
    const process = await open(url, options);

    return new Promise((resolve, reject) => {
      process.stderr.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      process.once('error', (err) => reject(new SfdxError(err.message, 'OpenError')));
      process.once('close', (code) => {
        if (code > 0) {
          const errorMessage = Buffer.concat(chunks).toString('utf8');
          reject(new SfdxError(errorMessage, 'OpenError'));
        } else {
          resolve();
        }
      });
    });
  }
}
