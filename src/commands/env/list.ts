/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { cli, Table } from 'cli-ux';
import { AuthInfo, SfOrg, Messages, SfdxError } from '@salesforce/core';
import { OutputFlags } from '@oclif/core/lib/interfaces';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type SfOrgs = SfOrg[];
type IFlags = typeof Flags;
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
const massageFlagOptions = (
  flags,
  mapper = (k, v): [string, any] => {
    return [k, v];
  }
): IFlags => {
  return Object.entries(flags)
    .map(mapper)
    .reduce((outputFlags, [key, value]) => {
      Reflect.set(outputFlags, key, value);
      return outputFlags;
    }, {} as IFlags);
};

const tableFlags = massageFlagOptions(cli.table.flags() as any, ([key, value]) => {
  value['summary'] = messages.getMessage(`flags.${key as string}.summary`);
  return [key, value];
}) as OutputFlags<any>;
/* eslint-enable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

export default class EnvList extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...tableFlags,
  };

  public async run(): Promise<SfOrgs> {
    const { flags } = await this.parse(EnvList);

    let authorizations: SfOrg[];

    try {
      if (await AuthInfo.hasAuthentications()) {
        authorizations = await AuthInfo.listAllAuthorizations();
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
        } as Table.table.Columns<Partial<SfOrg>>;
        if (hasErrors) {
          columns.error = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            get: (row) => row.error ?? '',
          } as Table.table.Columns<Partial<SfOrg>>;
        }

        if (!flags.json) {
          cli.table(authorizations, columns, { ...flags });
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
