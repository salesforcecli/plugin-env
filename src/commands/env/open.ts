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

    try {
      const org = await Org.create({ aliasOrUsername: nameOrAlias });
      const conn = org.getConnection();
      await org.refreshAuth();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore in the next core version
      url = conn.options.authInfo.getOrgFrontDoorUrl(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    } catch (err) {
      /* Do nothing */
    }

    if (!url) {
      let foundEnvs: Environment[] = [];
      const push = (envs: Environment | Environment[]): void => {
        foundEnvs = [...foundEnvs, ...(isArray(envs) ? envs : [envs])];
      };
      await this.config.runHook('environments-request', { push });

      const foundEnv = foundEnvs.find((env) => env.name === nameOrAlias);

      if (!foundEnv) {
        throw new SfdxError(`No environment found for ${nameOrAlias}`);
      }

      url = foundEnv.openUrl;
    }

    if (url) {
      if (flags['url-only']) {
        this.log(url);
      } else {
        let browser = flags.browser;

        if (browser?.toLowerCase().includes('chrome')) {
          browser = open.apps.chrome as string;
        }

        if (browser?.toLowerCase().includes('firefox')) {
          browser = open.apps.firefox as string;
        }

        this.log(`Opening ${nameOrAlias} in ${browser ? browser : 'the default browser'}.`);
        await open(url, { app: { name: browser }, wait: false });
      }
    } else {
      throw new SfdxError(`The environment ${nameOrAlias} doesn't support bring opened`);
    }
  }
}
