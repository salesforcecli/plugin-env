/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli, Table } from 'cli-ux';
import { AuthInfo, OrgAuthorization, Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type Environments = OrgAuthorization[];

export default class EnvList extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    all: Flags.boolean({
      summary: messages.getMessage('flags.all.summary'),
      char: 'a',
    }),
    columns: Flags.string({
      summary: messages.getMessage('flags.columns.summary'),
      multiple: true,
    }),
    csv: Flags.boolean({
      summary: messages.getMessage('flags.csv.summary'),
    }),
    extended: Flags.boolean({
      char: 'x',
      summary: messages.getMessage('flags.extended.summary'),
      hidden: true,
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
  private flags!: {
    all: boolean;
    columns: string[];
    csv: boolean;
    extended: boolean;
    filter: string;
    json: boolean;
    'no-header': boolean;
    'no-truncate': boolean;
    output: string;
    sort: string;
  };

  public async run(): Promise<Environments> {
    this.flags = (await this.parse(EnvList)).flags;

    if (!(await AuthInfo.hasAuthentications())) throw messages.createError('error.NoAuthsAvailable');
    const envs = [] as Environments;
    try {
      const orgs = await this.handleSfOrgs();
      envs.push(...orgs);
    } catch (error) {
      const err = error as SfdxError;
      cli.log(messages.getMessage('error.NoResultsFound'));
      cli.error(err);
    }

    return envs;
  }

  private async handleSfOrgs(): Promise<OrgAuthorization[]> {
    let auths: OrgAuthorization[];

    if (this.flags.all) {
      auths = await AuthInfo.listAllAuthorizations();
    } else {
      // Only get active auths
      auths = await AuthInfo.listAllAuthorizations((auth) => auth.isExpired !== true);
    }

    const grouped = {
      nonScratchOrgs: [] as OrgAuthorization[],
      scratchOrgs: [] as OrgAuthorization[],
    };
    for (const auth of auths) {
      if (auth.isScratchOrg) {
        grouped.scratchOrgs = grouped.scratchOrgs.concat(auth);
      } else {
        grouped.nonScratchOrgs = grouped.nonScratchOrgs.concat(auth);
      }
    }

    const buildSfTable = (orgs: OrgAuthorization[], title: string): void => {
      if (!orgs.length) return;
      const hasErrors = orgs.some((auth) => !!auth.error);
      const columns = {
        aliases: {
          get: (row: { aliases?: string[] }) => (row.aliases ? row.aliases.join(', ') : ''),
        },
        username: {},
        orgId: { header: 'Org ID' },
        instanceUrl: { header: 'Instance URL' },
        oauthMethod: { header: 'Auth Method' },
        configs: {
          header: 'Config',
          get: (row: { configs?: string[] }) => (row.configs ? row.configs.join(', ') : ''),
        },
      } as Table.table.Columns<Partial<OrgAuthorization>>;
      if (hasErrors) {
        columns.error = {
          get: (row: { error?: string }) => row.error ?? '',
        } as Table.table.Columns<Partial<OrgAuthorization>>;
      }

      cli.table(orgs, columns, {
        title,
        extended: this.flags.extended,
        columns: this.flags.columns?.join(','),
        csv: this.flags.csv,
        filter: this.flags.filter,
        'no-header': this.flags['no-header'],
        'no-truncate': this.flags['no-truncate'],
        output: this.flags.output,
        sort: this.flags.sort,
      });
      this.log();
    };

    if (!this.flags.json) {
      buildSfTable(grouped.nonScratchOrgs, 'Salesforce Orgs');
      buildSfTable(grouped.scratchOrgs, 'Scratch Orgs');
    }

    return auths;
  }
}
