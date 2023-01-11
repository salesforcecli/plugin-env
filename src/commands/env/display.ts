/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfdxError } from '@salesforce/core';
import { SfCommand, SfHook, JsonObject, Flags } from '@salesforce/sf-plugins-core';
import { toKey, toValue } from '../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'display');

export default class EnvDisplay extends SfCommand<JsonObject> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    'target-env': Flags.string({
      char: 'e',
      summary: messages.getMessage('flags.target-env.summary'),
    }),
  };

  public async run(): Promise<JsonObject> {
    const { flags } = await this.parse(EnvDisplay);
    // TODO: access this from ConfigAggregator once target-env config var is supported.
    const targetEnv = flags['target-env'];

    if (!targetEnv) throw messages.createError('error.NoDefaultEnv');

    let data: JsonObject = {};

    try {
      const results = await SfHook.run(this.config, 'sf:env:display', { targetEnv });
      const result = results.successes.find((s) => !!s.result?.data)?.result || null;

      if (!result) {
        throw messages.createError('error.NoEnvFound', [targetEnv]);
      }

      data = result.data;

      const columns = { key: {}, value: {} };
      const tableData = Object.entries(data).map(([key, value]) => ({
        key: toKey(key, result.keys),
        value: toValue(value),
      }));
      this.logSensitive();
      this.table(tableData, columns);
    } catch (error) {
      const err = error as SfdxError;
      this.log(messages.getMessage('error.NoResultsFound'));
      this.error(err);
    }

    return data;
  }
}
