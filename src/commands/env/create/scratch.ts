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
  Logger,
  Lifecycle,
  AuthFields,
  GlobalInfo,
  Config,
  OrgConfigProperties,
  ScratchOrgLifecycleEvent,
  scratchOrgLifecycleEventName,
} from '@salesforce/core';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-env', 'create_scratch', [
  'summary',
  'description',
  'examples',
  'flags.alias.description',
  'flags.target-hub.summary',
  'flags.set-default.description',
  'flags.edition.description',
  'flags.no-namespace.description',
  'flags.track-source.description',
  'flags.no-ancestors.description',
  'flags.wait.description',
  'flags.definition-file.description',
  'flags.client-id.description',
  'flags.duration-days.description',
  'prompt.secret',
]);

export interface ScratchCreateResponse {
  username?: string;
  scratchOrgInfo: ScratchOrgInfo;
  authFields?: AuthFields;
  warnings: string[];
  orgId: string;
}

const createResultFields = [
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

const isCreateResultKey = (key: string): key is typeof createResultFields[number] => {
  return createResultFields.includes(key as typeof createResultFields[number]);
};

export type OrgCreateResult = Pick<AuthFields, typeof createResultFields[number]>;

const editionOptions = [
  'developer',
  'enterprise',
  'group',
  'professional',
  'partner-developer',
  'partner-enterprise',
  'partner-group',
  'partner-professional',
];
export default class EnvCreateScratch extends SfCommand<ScratchCreateResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    alias: Flags.string({
      char: 'a',
      description: messages.getMessage('flags.alias.description'),
    }),
    'set-default': Flags.boolean({
      char: 'd',
      description: messages.getMessage('flags.set-default.description'),
    }),
    'definition-file': Flags.file({
      exists: true,
      char: 'f',
      description: messages.getMessage('flags.definition-file.description'),
      exactlyOne: ['definition-file', 'edition'],
    }),
    'target-dev-hub': Flags.requiredHub({
      description: messages.getMessage('flags.target-hub.summary'),
    }),
    'no-ancestors': Flags.boolean({
      char: 'c',
      description: messages.getMessage('flags.no-ancestors.description'),
    }),
    edition: Flags.string({
      char: 'e',
      description: messages.getMessage('flags.edition.description'),
      options: editionOptions,
      exactlyOne: ['definition-file', 'edition'],
    }),
    'no-namespace': Flags.boolean({
      char: 'm',
      description: messages.getMessage('flags.no-namespace.description'),
    }),
    'duration-days': Flags.duration({
      unit: 'days',
      defaultValue: 7,
      min: 1,
      max: 30,
      char: 'y',
      description: messages.getMessage('flags.duration-days.description'),
    }),
    wait: Flags.duration({
      unit: 'minutes',
      defaultValue: 5,
      min: 1,
      char: 'w',
      description: messages.getMessage('flags.wait.description'),
    }),
    'track-source': Flags.boolean({
      default: true,
      description: messages.getMessage('flags.track-source.description'),
    }),
    'api-version': Flags.orgApiVersion(),
    'client-id': Flags.string({
      char: 'i',
      description: messages.getMessage('flags.client-id.description'),
    }),
  };
  private logger: Logger;

  public async run(): Promise<ScratchCreateResponse> {
    const lifecycle = Lifecycle.getInstance();
    this.logger = await Logger.child('env create scratch');

    const { flags } = await this.parse(EnvCreateScratch);
    const hubOrg = flags['target-dev-hub'];

    const clientSecret = flags['client-id'] ? await this.clientSecretPrompt() : undefined;

    const createCommandOptions: ScratchOrgRequest = {
      connectedAppConsumerKey: flags['client-id'],
      durationDays: flags['duration-days'].days,
      nonamespace: flags['no-namespace'],
      noancestors: flags['no-ancestors'],
      wait: flags.wait,
      apiversion: flags['api-version'],
      definitionjson: flags['definition-file']
        ? await this.readJsonDefFile(flags['definition-file'])
        : JSON.stringify({ edition: flags.edition }),
      clientSecret,
    };
    this.spinner.start('');
    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(scratchOrgLifecycleEventName, async (data: ScratchOrgLifecycleEvent): Promise<void> => {
      this.spinner.status = `status: ${data.stage} | requestId: ${data.scratchOrgInfo?.Id ?? '...'} | orgId ${
        data.scratchOrgInfo?.ScratchOrg ?? '...'
      } | username ${data.scratchOrgInfo?.SignupUsername ?? '...'}`;
    });
    const { username, scratchOrgInfo, authFields, warnings } = await hubOrg.scratchOrgCreate(createCommandOptions);
    this.spinner.stop();
    this.log(`Successfully created scratch org ${scratchOrgInfo.ScratchOrg} with username ${username}`);

    await lifecycle.emit('scratchOrgInfo', scratchOrgInfo);

    const postOrgCreateHookInfo = Object.fromEntries(
      Object.entries(authFields).filter(([key]) => isCreateResultKey(key))
    );
    await Promise.all([
      lifecycle.emit('postorgcreate', postOrgCreateHookInfo),
      this.maybeSetAlias(username, flags.alias),
    ]);
    await this.maybeSetDefault(flags.alias, username, flags['set-default']);

    return { username, scratchOrgInfo, authFields, warnings, orgId: scratchOrgInfo.Id };
  }

  private async clientSecretPrompt(): Promise<string> {
    const { secret } = await this.prompt<{ secret: string }>([
      {
        name: 'secret',
        message: messages.getMessage('prompt.secret'),
        type: 'password',
      },
    ]);
    return secret;
  }

  private async readJsonDefFile(path: string): Promise<string> {
    // the -f option
    this.logger.debug('Reading JSON DefFile %s ', path);
    return fs.promises.readFile(path, 'utf-8');
  }

  private async maybeSetAlias(username: string, alias: string): Promise<void> {
    if (!alias) return;
    this.logger.debug(`Setting alias ${alias} to ${username}`);
    const globalInfo = await GlobalInfo.create();
    globalInfo.aliases.set(alias, username);
    await globalInfo.write();
    this.log(`...and set alias ${alias} to ${username}`);
  }

  private async maybeSetDefault(alias?: string, username?: string, defaultFlag?: boolean): Promise<void> {
    if (!defaultFlag) return;
    let config: Config;
    // if we fail to create the local config, default to the global config
    try {
      config = await Config.create({ isGlobal: false });
    } catch {
      config = await Config.create({ isGlobal: true });
    }

    // use alias if provided
    this.logger.debug(`Setting ${config.isGlobal() ? 'global' : ''} default to ${alias ?? username}`);

    config.set(OrgConfigProperties.TARGET_ORG, alias ?? username);
    await config.write();
    this.log(`...and set ${config.isGlobal() ? 'global ' : ''}default to ${alias ?? username}`);
  }
}
