/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import {
  Messages,
  ScratchOrgRequest,
  ScratchOrgInfo,
  Lifecycle,
  AuthFields,
  ScratchOrgLifecycleEvent,
  scratchOrgLifecycleEventName,
  AuthInfo,
  Org,
} from '@salesforce/core';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import * as chalk from 'chalk';
import { buildStatus } from '../../../scratchOrgOutput';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create_scratch');

export interface ScratchCreateResponse {
  username?: string;
  scratchOrgInfo: ScratchOrgInfo;
  authFields?: AuthFields;
  warnings: string[];
  orgId: string;
}

export const postOrgCreateHookFields = [
  'accessToken',
  'clientId',
  'created',
  'createdOrgInstance',
  'devHubUsername',
  'expirationDate',
  'instanceUrl',
  'loginUrl',
  'orgId',
  'username',
] as const;

const isHookField = (key: string): key is typeof postOrgCreateHookFields[number] => {
  return postOrgCreateHookFields.includes(key as typeof postOrgCreateHookFields[number]);
};

export type PostOrgCreateHook = Pick<AuthFields, typeof postOrgCreateHookFields[number]>;

export default class EnvCreateScratch extends SfCommand<ScratchCreateResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    alias: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.alias.summary'),
      description: messages.getMessage('flags.alias.description'),
    }),
    'set-default': Flags.boolean({
      char: 'd',
      summary: messages.getMessage('flags.set-default.summary'),
    }),
    'definition-file': Flags.file({
      exists: true,
      char: 'f',
      summary: messages.getMessage('flags.definition-file.summary'),
      description: messages.getMessage('flags.definition-file.description'),
      exactlyOne: ['definition-file', 'edition'],
    }),
    'target-dev-hub': Flags.requiredHub({
      char: 'v',
      summary: messages.getMessage('flags.target-hub.summary'),
      description: messages.getMessage('flags.target-hub.description'),
    }),
    'no-ancestors': Flags.boolean({
      char: 'c',
      summary: messages.getMessage('flags.no-ancestors.summary'),
      helpGroup: 'Packaging',
    }),
    edition: Flags.string({
      char: 'e',
      summary: messages.getMessage('flags.edition.summary'),
      description: messages.getMessage('flags.edition.description'),
      options: [
        'developer',
        'enterprise',
        'group',
        'professional',
        'partner-developer',
        'partner-enterprise',
        'partner-group',
        'partner-professional',
      ],
      exactlyOne: ['definition-file', 'edition'],
    }),
    'no-namespace': Flags.boolean({
      char: 'm',
      summary: messages.getMessage('flags.no-namespace.summary'),
      helpGroup: 'Packaging',
    }),
    'duration-days': Flags.duration({
      unit: 'days',
      defaultValue: 7,
      min: 1,
      max: 30,
      char: 'y',
      summary: messages.getMessage('flags.duration-days.summary'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      defaultValue: 5,
      min: 2,
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
    }),
    'track-source': Flags.boolean({
      default: true,
      summary: messages.getMessage('flags.track-source.summary'),
      description: messages.getMessage('flags.track-source.description'),
      hidden: true, // for future use when AuthInfo supports this field
    }),
    'api-version': Flags.orgApiVersion(),
    'client-id': Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.client-id.summary'),
    }),
  };

  public async run(): Promise<ScratchCreateResponse> {
    const lifecycle = Lifecycle.getInstance();

    const { flags } = await this.parse(EnvCreateScratch);

    const createCommandOptions: ScratchOrgRequest = {
      clientSecret: flags['client-id'] ? await this.clientSecretPrompt() : undefined,
      connectedAppConsumerKey: flags['client-id'],
      durationDays: flags['duration-days'].days,
      nonamespace: flags['no-namespace'],
      noancestors: flags['no-ancestors'],
      wait: flags.wait,
      apiversion: flags['api-version'],
      definitionjson: flags['definition-file']
        ? await fs.promises.readFile(flags['definition-file'], 'utf-8')
        : JSON.stringify({ edition: flags.edition }),
    };

    let lastStatus: string;
    const baseUrl = flags['target-dev-hub'].getField(Org.Fields.INSTANCE_URL).toString();

    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on<ScratchOrgLifecycleEvent>(scratchOrgLifecycleEventName, async (data): Promise<void> => {
      lastStatus = buildStatus(data, baseUrl);
      this.spinner.status = lastStatus;
    });

    this.spinner.start('Scratch Org Process');
    const { username, scratchOrgInfo, authFields, warnings } = await flags['target-dev-hub'].scratchOrgCreate(
      createCommandOptions
    );
    this.spinner.stop(lastStatus);

    await this.maybeSetAliasAndDefault(username, flags['set-default'], flags.alias);
    await lifecycle.emit(
      'postorgcreate',
      Object.fromEntries(Object.entries(authFields).filter(([key]) => isHookField(key))) as PostOrgCreateHook
    );

    this.log(chalk.green(messages.getMessage('success')));
    return { username, scratchOrgInfo, authFields, warnings, orgId: scratchOrgInfo.Id };
  }

  private async clientSecretPrompt(): Promise<string> {
    const { secret } = await this.timedPrompt<{ secret: string }>([
      {
        name: 'secret',
        message: messages.getMessage('prompt.secret'),
        type: 'password',
      },
      60000,
    ]);
    return secret;
  }

  private async maybeSetAliasAndDefault(username: string, setDefault: boolean, alias?: string): Promise<void> {
    if (!setDefault && !alias) {
      return;
    }
    const authInfo = await AuthInfo.create({ username });
    return authInfo.handleAliasAndDefaultSettings({
      alias,
      setDefault,
      setDefaultDevHub: false,
    });
  }
}
