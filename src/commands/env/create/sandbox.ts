/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { Flags } from '@oclif/core';
import { SfCommand } from '@salesforce/sf-plugins-core';
import {
  AuthInfo,
  Lifecycle,
  Messages,
  Org,
  ResultEvent,
  SandboxEvents,
  SandboxProcessObject,
  SandboxRequest,
  SandboxUserAuthResponse,
  SfError,
  StatusEvent,
} from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { Ux } from '@salesforce/sf-plugins-core/lib/ux';
import { getLogSandboxProcessResult, getSandboxProgress, SandboxProgress } from '../../../shared/sandboxReporter';
import { handleSideEffects, toKeyValuePairs } from '../../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create.sandbox');
const progressBarOptions = {
  title: 'Sandbox Create',
  format: '%s | {id} | {status} | {bar} | {percentComplete}%. {remainingWaitTimeHuman}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  linewrap: true,
};

export default class CreateSandbox extends SfCommand<SandboxProcessObject> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  public static flags = {
    // needs to change when new flags are available
    'definition-file': Flags.string({
      char: 'f',
      summary: messages.getMessage('flags.definitionFile.summary'),
    }),
    'set-default': Flags.boolean({
      char: 's',
      summary: messages.getMessage('flags.setDefault.summary'),
    }),
    alias: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.alias.summary'),
    }),
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      // min: 6,
      default: 6,
    }),
    'def-property': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.defProperty.summary'),
      multiple: true,
    }),
    'target-org': Flags.string({
      char: 'o',
      summary: messages.getMessage('flags.targetOrg.summary'),
    }),
  };

  protected readonly lifecycleEventNames = ['postorgcreate'];
  private sandboxAuth?: SandboxUserAuthResponse;
  private flags!: {
    'definition-file': string;
    'set-default': boolean;
    alias: string;
    wait: number;
    json: boolean;
    'def-property': string[];
    'target-org': string;
  };
  private sandboxDefinitionProperties: Record<string, string>;
  public async run(): Promise<SandboxProcessObject> {
    this.flags = (await this.parse(CreateSandbox)).flags;
    this.debug('Create started with args %s ', this.flags);

    this.validateSandboxFlags();
    const r = await this.createSandbox();
    return r;
  }

  private validateSandboxFlags(): void {
    if (this.flags['def-property']) {
      this.sandboxDefinitionProperties = toKeyValuePairs(this.flags['def-property']);
    }

    if (!this.flags['target-org']) {
      throw messages.createError('error.RequiresTargetOrg');
    }
  }

  private lowerToUpper(object: Record<string, unknown>): Record<string, unknown> {
    // the API has keys defined in capital camel case, while the definition schema has them as lower camel case
    // we need to convert lower camel case to upper before merging options, so they will override properly
    Object.keys(object).map((key) => {
      const upperCase = key.charAt(0).toUpperCase();
      if (key.charAt(0) !== upperCase) {
        const capitalKey = upperCase + key.slice(1);
        object[capitalKey] = object[key];
        delete object[key];
      }
    });
    return object;
  }

  private createSandboxRequest(): SandboxRequest {
    // no varargs - need to replace with multiple flag --def-property
    this.debug('Apply Definition Properties: %s ', this.sandboxDefinitionProperties);
    let sandboxDefFileContents = this.readJsonDefFile();
    let capitalizedDefProperties = {};

    if (sandboxDefFileContents) {
      sandboxDefFileContents = this.lowerToUpper(sandboxDefFileContents);
    }
    // use multiple flag
    if (this.flags['def-property']) {
      capitalizedDefProperties = this.lowerToUpper(this.sandboxDefinitionProperties);
    }
    // varargs override file input
    const sandboxReq: SandboxRequest = {
      SandboxName: undefined,
      ...sandboxDefFileContents,
      ...capitalizedDefProperties,
    };

    if (!sandboxReq.SandboxName) {
      // sandbox names are 10 chars or less, a radix of 36 = [a-z][0-9]
      // technically without querying the production org, the generated name could already exist, but the chances of that are lower than the perf penalty of querying and verifying
      sandboxReq.SandboxName = `sbx${Date.now().toString(36).slice(-7)}`;
      this.warn(`No SandboxName defined, generating new SandboxName: ${sandboxReq.SandboxName}`);
    }
    if (!sandboxReq.LicenseType) {
      throw messages.createError('missingLicenseType');
    }
    return sandboxReq;
  }

  private async createSandbox(): Promise<SandboxProcessObject> {
    const prodOrg = await Org.create({ aliasOrUsername: this.flags['target-org'] });
    const lifecycle = Lifecycle.getInstance();
    // register the sandbox event listeners before calling `prodOrg.createSandbox()`

    // `on` doesn't support synchronous methods
    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_ASYNC_RESULT, async (results: SandboxProcessObject) => {
      this.progress.stop();
      this.log(messages.getMessage('sandboxSuccess', [results.Id, results.SandboxName, this.flags['target-org']]));
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_STATUS, async (results: StatusEvent) => {
      this.updateProgress(getSandboxProgress(results));
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_AUTH, async (results: SandboxUserAuthResponse) => {
      this.sandboxAuth = results;
    });

    lifecycle.on(SandboxEvents.EVENT_RESULT, async (results: ResultEvent) => {
      const progress = getSandboxProgress({
        sandboxProcessObj: results.sandboxProcessObj,
        waitingOnAuth: false,
        retries: 0,
        interval: 0,
      });
      this.updateProgress(progress);
      const { sandboxReadyForUse, data } = getLogSandboxProcessResult(results);
      this.progress.stop();
      this.log(sandboxReadyForUse);
      const columns: Ux.Table.Columns<{ key: string; value: string }> = {
        key: { header: 'Field' },
        value: { header: 'Value' },
      };
      this.styledHeader('Sandbox Org Creation Status');
      this.table(data, columns, {});
      if (results.sandboxRes?.authUserName) {
        const authInfo = await AuthInfo.create({ username: results.sandboxRes?.authUserName });
        await handleSideEffects(authInfo, {
          alias: this.flags.alias,
          setDefault: this.flags['set-default'],
          setDefaultDevHub: undefined,
        });
      }
    });

    this.progress.start(
      100,
      {
        id: '',
        status: '',
        remainingWaitTime: 0,
        remainingWaitTimeHuman: 'unknown',
        percentComplete: 0,
      },
      progressBarOptions
    );

    const sandboxReq = this.createSandboxRequest();

    this.debug('Calling create with SandboxRequest: %s ', sandboxReq);
    const wait = Duration.minutes(this.flags.wait);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return prodOrg.createSandbox(sandboxReq, { wait });
    } catch (e) {
      this.progress.stop();
      // guaranteed to be SfError from core;
      const err = e as SfError;
      if (err?.message.includes('The org cannot be found')) {
        // there was most likely an issue with DNS when auth'ing to the new sandbox, but it was created.
        if (this.sandboxAuth) {
          const authInfo = await AuthInfo.create({ username: this.sandboxAuth.authUserName });
          await handleSideEffects(authInfo, {
            alias: this.flags.alias,
            setDefault: this.flags['set-default'],
            setDefaultDevHub: undefined,
          });
        }
        err.actions = [messages.getMessage('error.DnsTimeout'), messages.getMessage('error.PartialSuccess')];
        err.exitCode = 68;
        throw err;
      }
    }
  }

  private updateProgress(sandboxProgress: SandboxProgress): void {
    this.progress.update(sandboxProgress.percentComplete, {
      id: sandboxProgress.id,
      status: sandboxProgress.status,
      remainingWaitTime: sandboxProgress.remainingWaitTime,
      remainingWaitTimeHuman: sandboxProgress.remainingWaitTimeHuman,
      percentComplete: sandboxProgress.percentComplete,
    });
  }

  private readJsonDefFile(): Record<string, unknown> {
    // the -f option
    if (this.flags['definition-file']) {
      this.debug('Reading JSON DefFile %s ', this.flags['definition-file']);
      return JSON.parse(fs.readFileSync(this.flags['definition-file'], 'utf-8')) as Record<string, unknown>;
    }
  }
}
