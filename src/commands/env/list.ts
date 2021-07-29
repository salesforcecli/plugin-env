/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli, Table } from 'cli-ux';
import { AuthInfo, SfOrg, Messages, SfdxError, ConfigAggregator } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type SfOrgs = SfOrg[];

export default class EnvList extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    extended: Flags.boolean({
      char: 'x',
      summary: messages.getMessage('flags.extended.summary'),
      hidden: true,
    }),
    columns: Flags.string({
      summary: messages.getMessage('flags.columns.summary'),
      multiple: true,
    }),
    csv: Flags.boolean({
      summary: messages.getMessage('flags.csv.summary'),
    }),
    filter: Flags.string({
      summary: messages.getMessage('flags.filter.summary'),
    }),
    'no-header': Flags.boolean({
      summary: messages.getMessage('flags.no-header.summary'),
    }),
    'no-truncate': Flags.boolean({
      summary: messages.getMessage('flags.no-truncate.summary'),
    }),
    output: Flags.string({
      summary: messages.getMessage('flags.output.summary'),
      options: ['csv', 'json', 'yaml'],
    }),
    sort: Flags.string({
      summary: messages.getMessage('flags.sort.summary'),
    }),
  };

  public async run(): Promise<SfOrgs> {
    const { flags } = await this.parse(EnvList);

    let authorizations: Array<SfOrg & { configs?: string[] }>;
    const config = (await ConfigAggregator.create()).getConfigInfo();

    try {
      if (await AuthInfo.hasAuthentications()) {
        authorizations = await AuthInfo.listAllAuthorizations();
        for (const auth of authorizations) {
          auth.configs = config.filter((c) => c.value === auth.alias || c.value === auth.username).map((c) => c.key);
        }
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
          configs: {
            header: 'Config',
            get: (row: { configs?: string[] }) => (row.configs ? row.configs.join(', ') : ''),
          },
        } as Table.table.Columns<Partial<SfOrg>>;
        if (hasErrors) {
          columns.error = {
            get: (row: { error?: string }) => row.error ?? '',
          } as Table.table.Columns<Partial<SfOrg>>;
        }

        if (!flags.json) {
          cli.table(authorizations, columns, {
            title: 'Authenticated Envs',
            extended: flags.extended,
            columns: flags.columns?.join(','),
            csv: flags.csv,
            filter: flags.filter,
            'no-header': flags['no-header'],
            'no-truncate': flags['no-truncate'],
            output: flags.output,
            sort: flags.sort,
          });
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
