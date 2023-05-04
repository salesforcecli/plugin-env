/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
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
    this.warn(messages.getMessage('warning.orgsNoLongerSupported', [this.config.bin]));
    const { flags } = await this.parse(EnvDisplay);
    let data: JsonObject = {};

    try {
      const results = await SfHook.run(this.config, 'sf:env:display', { targetEnv: flags['target-env'] });
      const result = results.successes.find((s) => !!s.result?.data)?.result ?? null;

      if (!result) {
        throw messages.createError('error.NoEnvFound', [flags['target-env']]);
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
      if (!(error instanceof Error)) {
        throw error;
      }
      this.log(messages.getMessage('error.NoResultsFound'));
      this.error(error);
    }

    return data;
  }
}
