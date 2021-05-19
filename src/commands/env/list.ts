/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';

import { Command, flags } from '@oclif/command';
import { cli, Table } from 'cli-ux';
import { AuthInfo, Authorization, SfdxError } from '@salesforce/core';

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
    all: flags.boolean({
      char: 'a',
      description: "show all environments regardless of whether they're connected or not",
    }),
    ...cli.table.flags(),
  };

  public flags: {
    all: boolean;
  };

  public async run(): Promise<Authorization[]> {
    this.flags = this.parse(EnvList).flags;

    let authorizations: Authorization[];

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
        } as Table.table.Columns<Partial<Authorization>>;
        if (hasErrors) {
          columns.error = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            get: (row) => row.error ?? '',
          } as Table.table.Columns<Partial<Authorization>>;
        }
        cli.styledHeader('Authenticated Envs');
        cli.table(authorizations, columns, this.flags);
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
