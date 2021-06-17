/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';

import { Command, Flags } from '@oclif/core';
import { cli, Table } from 'cli-ux';
import { AuthInfo, SfOrg, SfdxError } from '@salesforce/core';
import { FlagOutput } from '@oclif/core/lib/interfaces';

// TODO: add back once md messages are supported
// Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export default class EnvList extends Command {
  // TODO: add back once md messages are supported
  // public static readonly description = messages.getMessage('description');
  // public static readonly examples = messages.getMessage('examples').split(EOL);
  public static readonly description = 'list environments';
  public static readonly examples = 'sf env list\nsf env list --all'.split(EOL);
  public static flags = {
    all: Flags.boolean({
      char: 'a',
      description: "show all environments regardless of whether they're connected or not",
    }),
    ...(cli.table.flags() as FlagOutput),
  };

  public async run(): Promise<SfOrg[]> {
    const { flags } = await this.parse(EnvList);

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
        cli.styledHeader('Authenticated Envs');
        cli.table(authorizations, columns, flags);
      } else {
        throw new SfdxError('There are no authorizations available.');
      }
    } catch (error) {
      const err = error as SfdxError;
      // TODO: add back once md messages are supported
      // cli.log(messages.getMessage('noResultsFound'));
      cli.error(err);
    }

    return authorizations;
  }
}
