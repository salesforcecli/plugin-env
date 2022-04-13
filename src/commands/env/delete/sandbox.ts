/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org, Messages } from '@salesforce/core';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import * as Interfaces from '@oclif/core/lib/interfaces';

type FlagsDef = {
  'target-org': Org;
  'no-prompt': boolean;
};

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'delete_sandbox');

export interface SandboxDeleteResponse {
  orgId: string;
  username: string;
}
export default class EnvDeleteSandbox extends SfCommand<SandboxDeleteResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static flags: Interfaces.FlagInput<any> = {
    'target-org': Flags.requiredOrg({
      summary: messages.getMessage('flags.target-org.summary'),
    }),
    'no-prompt': Flags.boolean({
      char: 'p',
      summary: messages.getMessage('flags.no-prompt.summary'),
    }),
  };

  public async run(): Promise<SandboxDeleteResponse> {
    const flags = (await this.parse(EnvDeleteSandbox)).flags as FlagsDef;
    const org = flags['target-org'];

    if (!(await org.isSandbox())) {
      throw messages.createError('error.isNotSandbox', [org.getUsername()]);
    }

    if (flags['no-prompt'] || (await this.confirm(messages.getMessage('prompt.confirm', [org.getUsername()])))) {
      try {
        await org.delete();
        this.logSuccess(messages.getMessage('success', [org.getUsername()]));
      } catch (e) {
        if (e instanceof Error && e.name === 'SandboxNotFound') {
          this.logSuccess(messages.getMessage('success.Idempotent', [org.getUsername()]));
        } else {
          throw e;
        }
      }

      return { username: org.getUsername(), orgId: org.getOrgId() };
    }
  }
}
