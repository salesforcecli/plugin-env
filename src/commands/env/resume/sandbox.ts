/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@salesforce/sf-plugins-core';
import {
  GlobalInfo,
  Lifecycle,
  Messages,
  Org,
  ResultEvent,
  SandboxEvents,
  SandboxProcessObject,
  SandboxRequestCacheEntry,
  ResumeSandboxRequest,
  SandboxUserAuthResponse,
  SfError,
} from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import * as Interfaces from '@oclif/core/lib/interfaces';
import { SandboxCommandBase } from '../../../shared/sandboxCommandBase';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'resume.sandbox');

type FlagsDef = {
  'set-default': boolean;
  alias: string;
  'poll-interval': Duration;
  wait: Duration;
  json: boolean;
  name: string;
  'job-id': string;
  'target-org': Org;
  'use-most-recent': boolean;
};

export default class ResumeSandbox extends SandboxCommandBase<SandboxProcessObject> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static flags: Interfaces.FlagInput<any> = {
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
      min: 0,
      unit: 'minutes',
      defaultValue: 0,
    }),
    'poll-interval': Flags.duration({
      char: 'i',
      summary: messages.getMessage('flags.poll-interval.summary'),
      min: 15,
      unit: 'seconds',
      defaultValue: 30,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      parse: (name: string): Promise<string> => {
        if (name.length > 10) {
          throw messages.createError('error.SandboxNameLength', [name]);
        }
        return Promise.resolve(name);
      },
      exclusive: ['job-id'],
    }),
    'job-id': Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.id.summary'),
      description: messages.getMessage('flags.id.description'),
      exclusive: ['name'],
    }),
    'use-most-recent': Flags.boolean({
      char: 'l',
      summary: messages.getMessage('flags.use-most-recent.summary'),
      description: messages.getMessage('flags.use-most-recent.description'),
    }),
    'target-org': Flags.optionalOrg({
      char: 'o',
      summary: messages.getMessage('flags.targetOrg.summary'),
      description: messages.getMessage('flags.targetOrg.description'),
    }),
  };
  public static readonly state = 'beta';
  protected readonly lifecycleEventNames = ['postorgcreate'];
  private flags: FlagsDef;

  public async run(): Promise<SandboxProcessObject> {
    this.sandboxRequestConfig = await this.getSandboxRequestConfig();
    this.flags = (await this.parse(ResumeSandbox)).flags as FlagsDef;
    this.debug('Resume started with args %s ', this.flags);
    this.validateFlags();
    return await this.resumeSandbox();
  }

  private createResumeSandboxRequest(): ResumeSandboxRequest {
    if (this.flags['use-most-recent']) {
      const [, sandboxRequestData] = this.sandboxRequestConfig.getLatestEntry();
      if (sandboxRequestData) {
        return { SandboxName: sandboxRequestData.sandboxProcessObject?.SandboxName };
      }
    }
    // build resume sandbox request from data provided
    return {
      ...Object.assign({}, this.flags.name ? { SandboxName: this.flags.name } : {}),
      ...Object.assign({}, this.flags['job-id'] ? { SandboxProcessObjId: this.flags['job-id'] } : {}),
    };
  }

  private async resumeSandbox(): Promise<SandboxProcessObject> {
    this.sandboxRequestData = this.buildSandboxRequestCacheEntry();
    const prodOrgUsername: string = this.sandboxRequestData.prodOrgUsername || this.flags['target-org']?.getUsername();

    if (!this.sandboxRequestData.sandboxProcessObject.SandboxName) {
      if (!this.flags['name'] && !this.flags['job-id']) {
        throw messages.createError('error.NoSandboxNameOrJobId');
      }
    }
    const prodOrg = this.flags['target-org'] || (await Org.create({ aliasOrUsername: prodOrgUsername }));
    const lifecycle = Lifecycle.getInstance();

    this.registerLifecycleListeners(lifecycle, {
      isAsync: false,
      alias: this.flags.alias,
      setDefault: this.flags['set-default'],
      prodOrg,
    });

    if (
      await this.verifyIfAuthExists(
        prodOrg,
        this.sandboxRequestData.sandboxProcessObject.SandboxName,
        this.flags['job-id'],
        lifecycle
      )
    ) {
      return this.latestSandboxProgressObj;
    }

    const sandboxReq = this.createResumeSandboxRequest();

    if (this.flags.wait.seconds > 0) {
      this.spinner.start('Resume Create');
    }

    this.debug('Calling create with ResumeSandboxRequest: %s ', sandboxReq);

    try {
      return await prodOrg.resumeSandbox(sandboxReq, {
        wait: this.flags.wait,
        interval: this.flags['poll-interval'],
      });
    } catch (err) {
      this.spinner.stop();
      const error = err as SfError;
      if (this.pollingTimeOut) {
        void lifecycle.emit(SandboxEvents.EVENT_ASYNC_RESULT, undefined);
        throw messages.createError('error.ResumeTimeout', [this.flags.wait.minutes], [], 68, err);
      } else if (error.name === 'SandboxCreateNotCompletedError') {
        void lifecycle.emit(SandboxEvents.EVENT_ASYNC_RESULT, undefined);
      }
      throw err;
    }
  }

  private buildSandboxRequestCacheEntry(): SandboxRequestCacheEntry {
    let sandboxRequestCacheEntry = {
      alias: '',
      setDefault: false,
      prodOrgUsername: '',
      sandboxProcessObject: {},
      sandboxRequest: {},
    } as SandboxRequestCacheEntry;

    let name: string | undefined;
    let entry: SandboxRequestCacheEntry | undefined;

    if (this.flags['use-most-recent']) {
      [name, entry] = this.sandboxRequestConfig.getLatestEntry();
      if (!name) {
        throw messages.createError('error.LatestSandboxRequestNotFound');
      }
      sandboxRequestCacheEntry = entry;
    } else if (this.flags.name) {
      sandboxRequestCacheEntry.sandboxProcessObject.SandboxName = this.flags.name;
    } else if (this.flags['job-id']) {
      sandboxRequestCacheEntry.sandboxProcessObject.Id = this.flags['job-id'];
    }
    sandboxRequestCacheEntry.prodOrgUsername =
      sandboxRequestCacheEntry.prodOrgUsername || this.flags['target-org']?.getUsername();
    sandboxRequestCacheEntry.alias = sandboxRequestCacheEntry.alias || this.flags.alias;
    sandboxRequestCacheEntry.setDefault = sandboxRequestCacheEntry.setDefault || this.flags['set-default'];
    sandboxRequestCacheEntry.sandboxProcessObject.SandboxName =
      sandboxRequestCacheEntry.sandboxProcessObject.SandboxName || this.flags.name;
    return sandboxRequestCacheEntry;
  }

  private async verifyIfAuthExists(
    prodOrg: Org,
    sandboxName: string,
    jobId: string,
    lifecycle: Lifecycle
  ): Promise<boolean> {
    const sandboxProcessObject: SandboxProcessObject = await this.getSandboxProcessObject(prodOrg, sandboxName, jobId);
    const sandboxUsername = `${prodOrg.getUsername()}.${sandboxProcessObject.SandboxName}`;

    if ((await GlobalInfo.getInstance()).orgs.has(sandboxUsername)) {
      this.latestSandboxProgressObj = sandboxProcessObject;
      const resultEvent = {
        sandboxProcessObj: this.latestSandboxProgressObj,
        sandboxRes: { authUserName: sandboxUsername } as Partial<SandboxUserAuthResponse>,
      } as ResultEvent;
      await lifecycle.emit(SandboxEvents.EVENT_RESULT, resultEvent as Partial<ResultEvent>);
      return true;
    }
    return false;
  }

  private validateFlags(): void {
    this.flags.wait = this.flags.wait ?? Duration.minutes(0);
    this.flags['poll-interval'] = this.flags.wait.seconds === 0 ? Duration.seconds(0) : this.flags['poll-interval'];
    if (this.flags['poll-interval'].seconds > this.flags.wait.seconds) {
      throw messages.createError('error.pollIntervalGreaterThanWait', [
        this.flags['poll-interval'].seconds,
        this.flags.wait.seconds,
      ]);
    }
  }

  private async getSandboxProcessObject(
    prodOrg: Org,
    sandboxName?: string,
    jobId?: string
  ): Promise<SandboxProcessObject> {
    const where = sandboxName ? `SandboxName='${sandboxName}'` : `Id='${jobId}'`;
    const queryStr = `SELECT Id, Status, SandboxName, SandboxInfoId, LicenseType, CreatedDate, CopyProgress, SandboxOrganization, SourceId, Description, EndDate FROM SandboxProcess WHERE ${where} AND Status != 'D'`;
    try {
      return await prodOrg.getConnection().singleRecordQuery(queryStr, {
        tooling: true,
      });
    } catch (err) {
      throw messages.createError('error.NoSandboxRequestFound');
    }
  }
}
