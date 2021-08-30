/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli } from 'cli-ux';
import { Messages, SfdxError } from '@salesforce/core';
import { SfHook, JsonObject } from '@salesforce/sf-plugins-core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'display');

export default class EnvDisplay extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    'target-env': Flags.string({
      char: 'e',
      description: messages.getMessage('flags.target-env.summary'),
    }),
  };

  public async run(): Promise<JsonObject> {
    const { flags } = await this.parse(EnvDisplay);
    // TODO: access this from ConfigAggregator once target-env config var is supported.
    const targetEnv = flags['target-env'];

    if (!targetEnv) throw messages.createError('error.NoDefaultEnv');

    let result: JsonObject = {};

    try {
      const results = await SfHook.run(this.config, 'sf:env:display', { targetEnv });
      result = results.successes.find((s) => !!s.result)?.result || null;

      if (!result) {
        throw messages.createError('error.NoEnvFound', [targetEnv]);
      }

      if (!this.jsonEnabled()) {
        const columns = { key: {}, value: {} };
        cli.table(
          Object.keys(result).map((key, i) => ({ key, value: Object.values(result)[i] ?? '' })),
          columns
        );
      }
    } catch (error) {
      const err = error as SfdxError;
      cli.log(messages.getMessage('error.NoResultsFound'));
      cli.error(err);
    }

    return result;
  }
}
