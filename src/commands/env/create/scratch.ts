/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
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
} from '@salesforce/core';
import {
  SfCommand,
  requiredHubFlag,
  existingFile,
  buildDurationFlag,
  apiVersionFlag,
} from '@salesforce/sf-plugins-core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create_scratch');

export interface ScratchCreateResponse {
  username?: string;
  scratchOrgInfo: ScratchOrgInfo;
  authFields?: AuthFields;
  warnings: string[];
  orgId: string;
}

export type OrgCreateResult = Pick<
  AuthFields,
  | 'accessToken'
  | 'clientId'
  | 'created'
  | 'createdOrgInstance'
  | 'devHubUsername'
  | 'expirationDate'
  | 'instanceUrl'
  | 'loginUrl'
  | 'orgId'
  | 'username'
>;

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
      char: 'f',
      description: messages.getMessage('flags.alias.description'),
    }),
    'set-default': Flags.boolean({
      char: 'd',
      description: messages.getMessage('flags.set-default.description'),
    }),
    'definition-file': Flags.existingFile({
      char: 'f',
      description: messages.getMessage('flags.definition-file.description'),
    }),
    'target-dev-hub': requiredHubFlag({
      description: messages.getMessage('flags.target-org.summary'),
    }),
    'no-ancestors': Flags.boolean({
      char: 'c',
      description: messages.getMessage('flags.no-ancestors.description'),
    }),
    edition: Flags.string({
      char: 'e',
      description: messages.getMessage('flags.edition.description'),
      options: editionOptions,
      default: 'developer',
    }),
    'no-namespace': Flags.boolean({
      char: 'm',
      description: messages.getMessage('flags.no-namespace.description'),
    }),
    'duration-days': buildDurationFlag({
      unit: 'days',
      defaultValue: 7,
      min: 1,
      max: 30,
    })({
      char: 'd',
      description: messages.getMessage('flags.duration-days.description'),
    }),
    wait: buildDurationFlag({
      unit: 'minutes',
      defaultValue: 5,
      min: 1,
    })({
      char: 'w',
      description: messages.getMessage('flags.wait.description'),
    }),
    'track-source': Flags.boolean({
      default: true,
      description: messages.getMessage('flags.track-source.description'),
    }),
    'api-version': apiVersionFlag(),
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

    // TODO: if we don't have a definition file, we use the edition.
    const secret = flags['client-id'] ? await this.clientSecretPrompt() : undefined;

    const createCommandOptions: ScratchOrgRequest = {
      connectedAppConsumerKey: flags['client-id'],
      durationDays: flags['duration-days'].days,
      nonamespace: flags['no-namespace'],
      noancestors: flags['no-ancestors'],
      wait: flags.wait,
      apiversion: flags['api-version'],
      definitionfile: flags['definition-file'],
      clientSecret: secret,
    };
    const { username, scratchOrgInfo, authFields, warnings } = await hubOrg.scratchOrgCreate(createCommandOptions);

    await lifecycle.emit('scratchOrgInfo', scratchOrgInfo);

    // // emit postorgcreate event for hook
    // const postOrgCreateHookInfo: OrgCreateResult = [authFields].map((element) => ({
    //   accessToken: element.accessToken,
    //   clientId: element.clientId,
    //   created: element.created,
    //   createdOrgInstance: element.createdOrgInstance,
    //   devHubUsername: element.devHubUsername,
    //   expirationDate: element.expirationDate,
    //   instanceUrl: element.instanceUrl,
    //   loginUrl: element.loginUrl,
    //   orgId: element.orgId,
    //   username: element.username,
    // }))[0];

    await Promise.all([
      lifecycle.emit('postorgcreate', postOrgCreateHookInfo),
      this.maybeSetAlias(username, flags.alias),
      this.maybeSetDefault(flags.alias, username, flags['set-default']),
    ]);
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

  private async maybeSetAlias(username: string, alias: string): Promise<void> {
    if (!alias) return;
    const globalInfo = await GlobalInfo.create();
    globalInfo.aliases.set(alias, username);
    await globalInfo.write();
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
    config.set(OrgConfigProperties.TARGET_ORG, alias ?? username);
    await config.write();
  }
}

function extractFromObjEs2019<T, K extends keyof T>(obj: T, ...keys: K[]): { [P in K]: T[P] } {
  const entries = keys.map((key) => [key, obj[key]]);
  return Object.fromEntries(entries);
}
