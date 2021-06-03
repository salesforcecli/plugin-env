/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';

import { Command, flags } from '@oclif/command';
import { cli, Table } from 'cli-ux';
import { AuthInfo, SfOrg, Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type SfOrgs = SfOrg[];

export default class EnvList extends Command {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(EOL);
  public static flags = {
    all: flags.boolean({
      char: 'a',
      description: messages.getMessage('flags.all.summary'),
    }),
    ...cli.table.flags(),
  };

  public flags: {
    all: boolean;
  };

  public async run(): Promise<SfOrgs> {
    this.flags = this.parse(EnvList).flags;

    let authorizations: SfOrg[];

    try {
      if (await AuthInfo.hasAuthentications()) {
        authorizations = await AuthInfo.listAllAuthorizations();
        const hasErrors = authorizations.filter((auth) => !!auth.error).length > 0;
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
        cli.table(authorizations, columns, { title: 'Authenticated Envs', ...this.flags });
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
