/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
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
import * as Interfaces from '@oclif/core/lib/interfaces';
import { getLogSandboxProcessResult, getSandboxProgress, SandboxProgress } from '../../../shared/sandboxReporter';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create.sandbox');
const progressBarOptions = {
  title: 'Sandbox Create',
  format: '%s | {id} | {status} | {bar} | {percentComplete}%. {remainingWaitTimeHuman}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  linewrap: true,
};

export enum SandboxLicenseType {
  developer = 'Developer',
  developerPro = 'Developer_Pro',
  partial = 'Partial',
  full = 'Full',
}

const getLicenseTypes = (): string[] => Object.values(SandboxLicenseType);

export default class CreateSandbox extends SfCommand<SandboxProcessObject> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static flags: Interfaces.FlagInput<any> = {
    // needs to change when new flags are available
    'definition-file': Flags.file({
      exists: true,
      char: 'f',
      summary: messages.getMessage('flags.definitionFile.summary'),
      exclusive: ['name', 'license-type'],
    }),
    'set-default': Flags.boolean({
      char: 's',
      summary: messages.getMessage('flags.setDefault.summary'),
    }),
    alias: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.alias.summary'),
    }),
    wait: Flags.duration({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      min: 6,
      unit: 'minutes',
      defaultValue: 6,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      exclusive: ['definition-file'],
      parse: (name: string): Promise<string> => {
        if (name.length > 10) {
          throw messages.createError('error.SandboxNameLength', [name]);
        }
        return Promise.resolve(name);
      },
    }),
    'license-type': Flags.enum({
      char: 'l',
      summary: messages.getMessage('flags.licenseType.summary'),
      exclusive: ['definition-file'],
      options: getLicenseTypes(),
      default: SandboxLicenseType.developer,
    }),
    'target-org': Flags.requiredOrg({
      char: 'o',
      summary: messages.getMessage('flags.targetOrg.summary'),
    }),
    'no-prompt': Flags.boolean({
      summary: messages.getMessage('flags.noPrompt.summary'),
    }),
  };

  protected readonly lifecycleEventNames = ['postorgcreate'];
  private sandboxAuth?: SandboxUserAuthResponse;
  private flags: {
    'definition-file': string;
    'set-default': boolean;
    alias: string;
    wait: Duration;
    json: boolean;
    name: string;
    'license-type': SandboxLicenseType;
    'no-prompt': boolean;
    'target-org': Org;
  };

  public async run(): Promise<SandboxProcessObject> {
    this.flags = (await this.parse(CreateSandbox)).flags as CreateSandbox['flags'];
    this.debug('Create started with args %s ', this.flags);

    return await this.createSandbox();
  }

  private lowerToUpper(object: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(object).map(([k, v]) => [`${k.charAt(0).toUpperCase()}${k.slice(1)}`, v]));
  }

  private createSandboxRequest(): SandboxRequest {
    let sandboxDefFileContents = this.readJsonDefFile() || {};

    if (sandboxDefFileContents) {
      sandboxDefFileContents = this.lowerToUpper(sandboxDefFileContents);
    }

    // build sandbox request from data provided
    const sandboxReq: SandboxRequest = {
      SandboxName: undefined,
      ...sandboxDefFileContents,
      ...Object.assign({}, this.flags.name ? { SandboxName: this.flags.name } : {}),
      ...Object.assign(
        {},
        sandboxDefFileContents['LicenseType']
          ? { LicenseType: sandboxDefFileContents['LicenseType'] as string }
          : { LicenseType: this.flags['license-type'] }
      ),
    };

    if (!sandboxReq.SandboxName) {
      // sandbox names are 10 chars or less, a radix of 36 = [a-z][0-9]
      // see https://help.salesforce.com/s/articleView?id=sf.data_sandbox_create.htm&type=5 for sandbox naming criteria
      // technically without querying the production org, the generated name could already exist,
      // but the chances of that are lower than the perf penalty of querying and verifying
      sandboxReq.SandboxName = `sbx${Date.now().toString(36).slice(-7)}`;
      this.warn(messages.createWarning('warning.NoSandboxNameDefined', [sandboxReq.SandboxName]));
    }

    return sandboxReq;
  }

  private async createSandbox(): Promise<SandboxProcessObject> {
    const prodOrg = this.flags['target-org'];
    const lifecycle = Lifecycle.getInstance();
    // register the sandbox event listeners before calling `prodOrg.createSandbox()`

    // `on` doesn't support synchronous methods
    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_ASYNC_RESULT, async (results: SandboxProcessObject) => {
      this.progress.stop();
      this.log(
        messages.getMessage('sandboxSuccess', [results.Id, results.SandboxName, prodOrg ? prodOrg.getUsername() : ''])
      );
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
        await authInfo.handleAliasAndDefaultSettings({
          alias: this.flags.alias,
          setDefault: this.flags['set-default'],
          setDefaultDevHub: undefined,
        });
      }
    });

    const sandboxReq = this.createSandboxRequest();

    await this.confirmSandboxReq(sandboxReq);

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

    this.debug('Calling create with SandboxRequest: %s ', sandboxReq);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return prodOrg.createSandbox(sandboxReq, { wait: this.flags.wait });
    } catch (e) {
      this.progress.stop();
      // guaranteed to be SfError from core;
      const err = e as SfError;
      if (err?.message.includes('The org cannot be found')) {
        // there was most likely an issue with DNS when auth'ing to the new sandbox, but it was created.
        if (this.sandboxAuth) {
          const authInfo = await AuthInfo.create({ username: this.sandboxAuth.authUserName });
          await authInfo.handleAliasAndDefaultSettings({
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

  private async confirmSandboxReq(sandboxReq: SandboxRequest): Promise<void> {
    if (this.flags['no-prompt'] || this.jsonEnabled()) return;

    const columns: Ux.Table.Columns<{ key: string; value: unknown }> = {
      key: { header: 'Field' },
      value: { header: 'Value' },
    };

    const data = Object.entries(sandboxReq).map(([key, value]) => ({ key, value }));
    this.styledHeader('Config Sandbox Request');
    this.table(data, columns, {});

    const configurationCorrect = await this.timedPrompt<{ continue: boolean }>(
      [
        {
          name: 'continue',
          type: 'confirm',
          message: messages.getMessage('isConfigurationOk'),
        },
      ],
      10_000
    );
    if (!configurationCorrect.continue) {
      throw messages.createError('error.UserNotSatisfiedWithSandboxConfig');
    }
  }
}
