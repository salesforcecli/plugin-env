/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { SfCommand, SfHook, JsonObject, Flags } from '@salesforce/sf-plugins-core';
import { toKey, toValue } from '../../utils.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
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

    try {
      const results = await SfHook.run(this.config, 'sf:env:display', { targetEnv: flags['target-env'] as string });
      const result = results.successes.find((s) => !!s.result?.data)?.result ?? null;

      if (!result) {
        throw messages.createError('error.NoEnvFound', [flags['target-env']]);
      }

      const data = result.data;
      if (!data) {
        throw new Error();
      }
      const columns = { key: {}, value: {} };
      const tableData = Object.entries(data).map(([key, value]) => ({
        key: toKey(key, result.keys),
        value: toValue(value),
      }));
      this.logSensitive();
      this.table(tableData, columns);
      return data;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.log(messages.getMessage('error.NoResultsFound'));
      this.error(error);
    }
  }
}
