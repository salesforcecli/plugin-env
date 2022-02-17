/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@oclif/core';
import { Messages, Org } from '@salesforce/core';
import { SfCommand } from '@salesforce/sf-plugins-core';

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
  public static flags = {
    'target-env': Flags.string({
      char: 'e',
      description: messages.getMessage('flags.target-env.summary'),
    }),
    'no-prompt': Flags.boolean({
      char: 'p',
      description: messages.getMessage('flags.no-prompt.summary'),
    }),
  };

  public async run(): Promise<SandboxDeleteResponse> {
    const { flags } = await this.parse(EnvDeleteSandbox);
    const org = await Org.create({ aliasOrUsername: flags['target-env'] });

    if (flags['no-prompt'] || (await this.promptForConfirmation(org.getUsername()))) {
      try {
        await org.delete();
        this.log(messages.getMessage('success', [org.getUsername()]));
      } catch (e) {
        if (e instanceof Error && e.name === 'SandboxNotFound') {
          this.log(messages.getMessage('success.Idempotent', [org.getUsername()]));
        } else {
          throw e;
        }
      }

      return { username: org.getUsername(), orgId: org.getOrgId() };
    }
  }

  private async promptForConfirmation(username: string): Promise<boolean> {
    const { confirmed } = await this.prompt<{ confirmed: boolean }>([
      {
        name: 'confirmed',
        message: messages.getMessage('prompt.confirm', [username]),
        type: 'confirm',
      },
    ]);
    return confirmed;
  }
}
