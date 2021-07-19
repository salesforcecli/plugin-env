/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli } from 'cli-ux';
import { AuthInfo, SfOrg, Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'display');

export default class EnvDisplay extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    environment: Flags.string({
      char: 'e',
      description: messages.getMessage('flags.environment.summary'),
    }),
  };

  // TODO: Change SfOrg type to a more generalized auth type once we have Functions envs integrated.

  public async run(): Promise<SfOrg> {
    const { flags } = await this.parse(EnvDisplay);

    let authorizations: SfOrg[];
    let foundAuthorization: SfOrg;

    try {
      if (await AuthInfo.hasAuthentications()) {
        authorizations = await AuthInfo.listAllAuthorizations();

        if (!flags.environment) {
          // TODO this should be retrieved from sf config once we have those commands. If not found, still throw.
          throw messages.createError('error.NoDefaultEnv');
        }

        foundAuthorization = authorizations.filter((auth) => auth.username === flags.environment)[0];
        if (!foundAuthorization) {
          foundAuthorization = authorizations.filter((auth) => auth.alias === flags.environment)[0];
        }

        if (foundAuthorization) {
          const columns = {
            key: {},
            value: {},
          };

          cli.table(
            Object.keys(foundAuthorization).map((key, i) => ({ key, value: Object.values(foundAuthorization)[i] })),
            columns
          );
        } else {
          throw new SfdxError(messages.getMessage('error.NoEnvFound', [flags.environment]));
        }
      } else {
        throw messages.createError('error.NoAuthsAvailable');
      }
    } catch (error) {
      const err = error as SfdxError;
      cli.log(messages.getMessage('error.NoResultsFound'));
      cli.error(err);
    }

    return foundAuthorization;
  }
}
