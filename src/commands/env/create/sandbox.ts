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
import { SandboxProgress, SandboxStatusData } from '../../../shared/sandboxProgress';
import { State } from '../../../shared/stagedProgress';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create.sandbox');

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
      description: messages.getMessage('flags.definitionFile.description'),
      exclusive: ['name', 'license-type'],
    }),
    'set-default': Flags.boolean({
      char: 's',
      summary: messages.getMessage('flags.setDefault.summary'),
    }),
    alias: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.alias.summary'),
      description: messages.getMessage('flags.alias.description'),
    }),
    wait: Flags.duration({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      min: 6,
      unit: 'minutes',
      defaultValue: 6,
    }),
    'poll-interval': Flags.duration({
      char: 'i',
      summary: messages.getMessage('flags.poll-interval.summary'),
      min: 15,
      unit: 'seconds',
      defaultValue: 30,
    }),
    // TODO: un-hide async flag when async support is available.
    async: Flags.boolean({
      summary: messages.getMessage('flags.async.summary'),
      hidden: true,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
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
      description: messages.getMessage('flags.targetOrg.description'),
    }),
    'no-prompt': Flags.boolean({
      summary: messages.getMessage('flags.noPrompt.summary'),
    }),
  };
  public static readonly state = 'beta';
  protected sandboxAuth?: SandboxUserAuthResponse;
  protected readonly lifecycleEventNames = ['postorgcreate'];
  private flags: {
    'definition-file': string;
    'set-default': boolean;
    alias: string;
    async: boolean;
    'poll-interval': Duration;
    wait: Duration;
    json: boolean;
    name: string;
    'license-type': SandboxLicenseType;
    'no-prompt': boolean;
    'target-org': Org;
  };

  private sandboxProgress: SandboxProgress;
  // TODO: uncomment when async/resume option are implemented
  // private latestSandboxProgressObj: SandboxProcessObject;

  public async run(): Promise<SandboxProcessObject> {
    this.flags = (await this.parse(CreateSandbox)).flags as CreateSandbox['flags'];
    this.debug('Create started with args %s ', this.flags);
    this.validateFlags();
    this.sandboxProgress = new SandboxProgress();
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
      this.info(messages.createWarning('warning.NoSandboxNameDefined', [sandboxReq.SandboxName]));
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
      // TODO: uncomment when async/resume option are implemented
      // this.latestSandboxProgressObj = results;
      if (!this.flags.async) {
        this.spinner.stop();
      }
      this.info(messages.getMessage('sandboxSuccess', [results.Id]));
      // TODO: uncomment when async/resume option are implemented
      // this.info(messages.getMessage('checkSandboxStatus', [results.Id, prodOrg ? prodOrg.getUsername() : '']));
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_STATUS, async (results: StatusEvent) => {
      // TODO: uncomment when async/resume option are implemented
      // this.latestSandboxProgressObj = results.sandboxProcessObj;
      const progress = this.sandboxProgress.getSandboxProgress(results);
      const currentStage = progress.status;
      this.updateStage(currentStage, State.inProgress);
      this.updateProgress(results);
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    lifecycle.on(SandboxEvents.EVENT_AUTH, async (results: SandboxUserAuthResponse) => {
      this.sandboxAuth = results;
    });

    lifecycle.on(SandboxEvents.EVENT_RESULT, async (results: ResultEvent) => {
      // TODO: uncomment when async/resume option are implemented
      // this.latestSandboxProgressObj = results.sandboxProcessObj;
      this.sandboxProgress.updateCurrentStage(State.completed);
      this.updateProgress(results);
      if (!this.flags.async) {
        this.progress.stop();
      }
      const { sandboxReadyForUse, data } = this.sandboxProgress.getLogSandboxProcessResult(results);
      this.info(sandboxReadyForUse);
      this.log();
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

    if (!this.flags.async) {
      this.spinner.start('Sandbox Create');
    }

    this.debug('Calling create with SandboxRequest: %s ', sandboxReq);

    try {
      return await prodOrg.createSandbox(sandboxReq, {
        wait: this.flags.wait,
        interval: this.flags['poll-interval'],
        async: this.flags.async,
      });
    } catch (err) {
      throw this.handleSandboxCreateErrors(this.flags['target-org'], err);
    }
  }

  private handleSandboxCreateErrors(prodOrg: Org, err: SfError): SfError {
    // TODO: uncomment when async/resume option are implemented
    // write the sandboxProgressObject to config keyed by sandboxProgressObject.Id
    let wrappedError = err;
    if (err?.message.includes('The client has timed out.')) {
      wrappedError = messages.createError(
        'error.DnsTimeout',
        [],
        // TODO: uncomment when async/resume option are implemented
        // [messages.getMessage('checkSandboxStatus', [this.latestSandboxProgressObj.Id, prodOrg.getUsername()])],
        [],
        68,
        err as Error
      );
    }
    if (!this.flags.async) {
      this.sandboxProgress.updateCurrentStage(State.failed);
      this.spinner.status = undefined;
      this.spinner.stop();
      this.log();
    }
    return wrappedError;
  }

  private updateProgress(event: ResultEvent | StatusEvent): void {
    if (!this.flags.async) {
      const sandboxProgress = this.sandboxProgress.getSandboxProgress(event);
      const sandboxData = {
        sandboxUsername: (event as ResultEvent).sandboxRes?.authUserName,
        sandboxProgress,
        sandboxProcessObj: event.sandboxProcessObj,
      } as SandboxStatusData;
      this.spinner.status = this.sandboxProgress.formatProgressStatus(sandboxData);
    }
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

  private validateFlags(): void {
    if (this.flags['poll-interval'].seconds > this.flags.wait.seconds) {
      throw messages.createError('error.pollIntervalGreaterThanWait', [
        this.flags['poll-interval'].seconds,
        this.flags.wait.seconds,
      ]);
    }
  }

  private updateStage(stage: string | undefined, state: State): void {
    if (stage) {
      this.sandboxProgress.transitionStages(stage, state);
    }
  }
}
