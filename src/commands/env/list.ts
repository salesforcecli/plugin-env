/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { SfCommand } from '@salesforce/command';
import { cli } from 'cli-ux';
import { Messages, SfdxError } from '@salesforce/core';
import { JsonObject, SfHook } from '@salesforce/sf-plugins-core';
import { toKey, toValue } from '../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type Environments = JsonObject[];

export default class EnvList extends SfCommand<Environments> {
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
    filter: string;
    json: boolean;
    'no-header': boolean;
    'no-truncate': boolean;
    output: string;
    sort: string;
  };

  public async run(): Promise<Environments> {
    this.flags = (await this.parse(EnvList)).flags;
    const tableOpts = {
      columns: this.flags.columns?.join(','),
      csv: this.flags.csv,
      filter: this.flags.filter,
      'no-header': this.flags['no-header'],
      'no-truncate': this.flags['no-truncate'],
      output: this.flags.output,
      sort: this.flags.sort,
    };

    const final: Environments = [];

    try {
      const results = await SfHook.run(this.config, 'sf:env:list', { all: this.flags.all });
      const tables = results.successes
        .map((r) => r.result)
        .reduce((x, y) => x.concat(y), [])
        .filter((t) => t.data.length > 0);

      for (const table of tables) {
        final.push(...table.data);
        if (!this.jsonEnabled()) {
          const columns = table.data.flatMap(Object.keys).reduce((x, y) => {
            if (x[y]) return x;
            const columnEntry = {
              header: toKey(y, table.keys),
              get: (v: JsonObject[keyof JsonObject]): string | number | boolean => toValue(v[y]),
            };
            return { ...x, [y]: columnEntry };
          }, {});

          cli.table(table.data, columns, { ...tableOpts, title: table.title });
          cli.log();
        }
      }
    } catch (error) {
      const err = error as SfdxError;
      cli.log(messages.getMessage('error.NoResultsFound'));
      cli.error(err);
    }

    return final;
  }
}
