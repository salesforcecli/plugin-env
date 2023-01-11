/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { Flags, SfCommand, JsonObject, SfHook, EnvList as Env } from '@salesforce/sf-plugins-core';
import { toKey, toValue } from '../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

const envTypeValues = Object.keys(Env.EnvType);
const envOrderBy = (a: Env.Table<JsonObject>, b: Env.Table<JsonObject>): number => {
  // both a && b are well known
  if (envTypeValues.includes(a.type) && envTypeValues.includes(a.type)) {
    if (a.type === Env.EnvType.salesforceOrgs && b.type !== Env.EnvType.salesforceOrgs) return -1;
    if (a.type !== Env.EnvType.salesforceOrgs && b.type === Env.EnvType.salesforceOrgs) return 1;
    if (a.type === Env.EnvType.scratchOrgs && b.type !== Env.EnvType.scratchOrgs) return -1;
    return 1;
  }
  // both a && b are user defined - use natural sort
  if (!envTypeValues.includes(a.type) && !envTypeValues.includes(a.type)) {
    return a.type.localeCompare(b.type);
  }
  // well known always come before user defined
  if (envTypeValues.includes(a.type)) return -1;
  return 1;
};

const buildColumns = (table: Env.Table<JsonObject>): Record<string, { header?: string }> =>
  table.data.flatMap(Object.keys).reduce((x, y) => {
    if (x[y]) return x;
    const columnEntry = {
      header: toKey(y, table.keys),
      get: (v: JsonObject): string | number | boolean => toValue(v[y]),
    };
    return { ...x, [y]: columnEntry };
  }, {});

export type Environments = {
  [type: string]: JsonObject[];
};

export default class EnvList extends SfCommand<Environments> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
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

    let final: Environments = {};

    const results = await SfHook.run(this.config, 'sf:env:list', { all: this.flags.all });
    const tables = results.successes
      .map((r) => r.result)
      .reduce((x, y) => x.concat(y), [])
      .filter((t) => t.data.length > 0)
      .sort(envOrderBy);

    if (tables.length === 0) {
      this.log(messages.getMessage('error.NoResultsFound'));
      return {};
    } else {
      for (const table of tables) {
        final = { ...final, ...{ [table.type]: table.data } };
        const columns = buildColumns(table);
        if (this.checkTableForNamedColumns(columns)) {
          this.table(table.data, columns, { ...tableOpts, title: table.title });
          this.log();
        } else {
          this.warn(
            messages.getMessage('warning.RequestedColumnsNotPresentInEnvironment', [tableOpts.columns, table.title])
          );
        }
      }
    }

    return final;
  }

  private checkTableForNamedColumns(columns: Record<string, { header?: string }>): boolean {
    return Object.entries(columns).some(([, value]) => {
      if (this.flags?.columns) {
        return this.flags?.columns.includes(value['header']);
      }
      return true;
    });
  }
}
