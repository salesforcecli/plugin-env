/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli, Table } from 'cli-ux';
import { AuthInfo, SfOrg, Messages, SfdxError } from '@salesforce/core';
import { OutputFlags } from '@oclif/core/lib/interfaces';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type SfOrgs = SfOrg[];

export default class EnvList extends Command {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    all: Flags.boolean({
      char: 'a',
      description: messages.getMessage('flags.all.summary'),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(cli.table.flags() as OutputFlags<any>),
  };

  public async run(): Promise<SfOrgs> {
    const { flags } = await this.parse(EnvList);

    let authorizations: SfOrg[];

    try {
      if (await AuthInfo.hasAuthentications()) {
        authorizations = await AuthInfo.listAllAuthorizations();
        const hasErrors = authorizations.some((auth) => !!auth.error);
        const columns = {
          alias: {
            get: (row) => row.alias ?? '',
          },
          username: {},
          orgId: {
            header: 'Org ID',
          },
          instanceUrl: {
            header: 'Instance URL',
          },
          oauthMethod: {
            header: 'OAuth Method',
          },
        } as Table.table.Columns<Partial<SfOrg>>;
        if (hasErrors) {
          columns.error = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            get: (row) => row.error ?? '',
          } as Table.table.Columns<Partial<SfOrg>>;
        }
        if (!flags.json) {
          cli.table(authorizations, columns, { title: 'Authenticated Envs', ...flags });
        }
      } else {
        throw messages.createError('error.NoAuthsAvailable');
      }
    } catch (error) {
      const err = error as SfdxError;
      cli.log(messages.getMessage('error.NoResultsFound'));
      cli.error(err);
    }

    return authorizations;
  }
}
