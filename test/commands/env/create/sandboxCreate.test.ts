/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  AuthInfo,
  GlobalInfo,
  Lifecycle,
  Messages,
  Org,
  SandboxEvents,
  SandboxProcessObject,
  SandboxUserAuthResponse,
  SfError,
  SfInfo,
  SfInfoKeys,
  SfOrg,
  SfOrgs,
  SfProject,
} from '@salesforce/core';
import { Progress } from '@salesforce/sf-plugins-core';
import { Config as IConfig } from '@oclif/core/lib/interfaces';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { assert } from 'sinon';
import { Ux } from '@salesforce/sf-plugins-core/lib/ux';
import CreateSandbox from '../../../../src/commands/env/create/sandbox';
import { getSandboxProgress } from '../../../../src/shared/sandboxReporter';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'create.sandbox');

const sandboxProcessObj: SandboxProcessObject = {
  Id: '0GR4p000000U8EMXXX',
  Status: 'Completed',
  SandboxName: 'TestSandbox',
  SandboxInfoId: '0GQ4p000000U6sKXXX',
  LicenseType: 'DEVELOPER',
  CreatedDate: '2021-12-07T16:20:21.000+0000',
  CopyProgress: 100,
  SandboxOrganization: '00D2f0000008XXX',
  SourceId: '123',
  Description: 'sandbox description',
  ApexClassId: '123',
  EndDate: '2021-12-07T16:38:47.000+0000',
};

const fakeOrg: SfOrg = {
  orgId: '00Dsomefakeorg1',
  instanceUrl: 'https://some.fake.org',
  username: 'somefake.org',
};

const fakeSfInfo: SfInfo = {
  [SfInfoKeys.ORGS]: { [fakeOrg.username]: fakeOrg } as SfOrgs,
  [SfInfoKeys.TOKENS]: {},
  [SfInfoKeys.ALIASES]: { testProdOrg: fakeOrg.username },
};

describe('org:create', () => {
  beforeEach(() => {
    GlobalInfo.clearInstance();
    stubMethod(sandbox, GlobalInfo.prototype, 'read').callsFake(async (): Promise<SfInfo> => {
      return fakeSfInfo;
    });
    stubMethod(sandbox, GlobalInfo.prototype, 'write').callsFake(async (): Promise<SfInfo> => {
      return fakeSfInfo;
    });
  });

  const sandbox = sinon.createSandbox();
  const oclifConfigStub = fromStub(stubInterface<IConfig>(sandbox));
  // stubs
  let resolveProjectConfigStub: sinon.SinonStub;
  let createSandboxStub: sinon.SinonStub;
  let uxLogStub: sinon.SinonStub;
  let uxTableStub: sinon.SinonStub;
  let uxStyledHeaderStub: sinon.SinonStub;
  let cmd: TestCreate;
  let progressUpdate: sinon.SinonStub;

  class TestCreate extends CreateSandbox {
    public async runIt() {
      await this.init();
      return this.run();
    }
    public setProject(project: SfProject) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.project = project;
    }
  }

  const createCommand = async (params: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cmd = new TestCreate(params, oclifConfigStub);
    stubMethod(sandbox, cmd, 'assignProject').callsFake(() => {
      const sfProjectStub = fromStub(
        stubInterface<SfProject>(sandbox, {
          resolveProjectConfig: resolveProjectConfigStub,
        })
      );
      cmd.setProject(sfProjectStub);
    });

    stubMethod(sandbox, TestCreate.prototype, 'warn');
    uxLogStub = stubMethod(sandbox, TestCreate.prototype, 'log');
    uxStyledHeaderStub = stubMethod(sandbox, Ux.prototype, 'styledHeader');
    uxTableStub = stubMethod(sandbox, TestCreate.prototype, 'table');
    progressUpdate = stubMethod(sandbox, Progress.prototype, 'update');
    stubMethod(sandbox, Progress.prototype, 'start');
    stubMethod(sandbox, Progress.prototype, 'stop');
    return cmd;
  };

  describe('sandbox', () => {
    it('properly overwrites options from defaults and --license-type', async () => {
      const command = await createCommand(['--license-type', 'Developer', '-o', 'testProdOrg', '--no-prompt']);

      stubMethod(sandbox, cmd, 'readJsonDefFile').returns({
        licenseType: 'Developer_Pro',
        sandboxName: 'sandboxName',
      });
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, fs, 'existsSync').returns(true);
      const prodOrg = stubMethod(sandbox, Org.prototype, 'createSandbox');
      await command.runIt();
      expect(prodOrg.firstCall.args[0]).to.deep.equal({
        SandboxName: 'sandboxName',
        LicenseType: 'Developer_Pro',
      });
    });

    it('properly overwrites options from defaults and definition file with mixed capitalization', async () => {
      const tmpDir = os.tmpdir();
      const defFile = path.join(tmpDir, 'mySandboxDef.json');
      fs.writeFileSync(
        defFile,
        JSON.stringify({
          licenseType: 'Developer_Pro',
          sandboxName: 'sandboxName',
        }),
        'utf8'
      );
      const command = await createCommand(['--definition-file', defFile, '-o', 'testProdOrg', '--no-prompt']);

      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      const prodOrg = stubMethod(sandbox, Org.prototype, 'createSandbox');
      await command.runIt();
      fs.unlinkSync(defFile);
      expect(prodOrg.firstCall.args[0]).to.deep.equal({
        SandboxName: 'sandboxName',
        LicenseType: 'Developer_Pro',
      });
    });

    it('will print the correct message for asyncResult lifecycle event', async () => {
      const command = await createCommand(['-o', 'testProdOrg', '--no-prompt']);

      stubMethod(sandbox, cmd, 'readJsonDefFile').returns({
        licenseType: 'licenseFromJon',
      });
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'getUsername').returns('testProdOrg');
      const createStub = stubMethod(sandbox, Org.prototype, 'createSandbox');

      await command.runIt();

      // no SandboxName defined, so we should generate one that starts with sbx
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(createStub.firstCall.args[0].SandboxName).includes('sbx');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(createStub.firstCall.args[0].SandboxName.length).equals(10);

      Lifecycle.getInstance().on(SandboxEvents.EVENT_ASYNC_RESULT, async (result) => {
        expect(result).to.deep.equal(sandboxProcessObj);
        expect(uxLogStub.firstCall.args[0]).to.equal(
          'The sandbox org creation process 0GR4p000000U8EMXXX is in progress. Run "sf env resume sandbox --job-id TestSandbox -o testProdOrg" to check for status. If the org is ready, checking the status also authorizes the org for use with Salesforce CLI.'
        );
      });

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_ASYNC_RESULT, sandboxProcessObj);
    });

    it('will print the correct message for status lifecycle event (30 seconds left)', async () => {
      const command = await createCommand(['-o', 'testProdOrg', '--no-prompt']);

      stubMethod(sandbox, cmd, 'readJsonDefFile').returns({
        licenseType: 'licenseFromJon',
        sandboxName: 'sandboxNameFromJson',
      });
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'createSandbox');
      await command.runIt();

      Lifecycle.getInstance().on(SandboxEvents.EVENT_STATUS, async () => {
        expect(progressUpdate.firstCall.args[0]).to.equal(100);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(progressUpdate.firstCall.args[1]['remainingWaitTime']).to.equal(30);
      });

      const data = {
        sandboxProcessObj,
        interval: 30,
        retries: 1,
        waitingOnAuth: false,
      };

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_STATUS, data);
    });

    it('will print the correct message for result lifecycle event and set alias/defaultusername', async () => {
      const command = await createCommand([
        '--alias',
        'sandboxAlias',
        '--set-default',
        '-o',
        'testProdOrg',
        '--no-prompt',
      ]);

      stubMethod(sandbox, cmd, 'readJsonDefFile').returns({
        licenseType: 'licenseFromJon',
      });
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, AuthInfo, 'create').resolves(AuthInfo.prototype);
      stubMethod(sandbox, AuthInfo.prototype, 'save').resolves(undefined);
      stubMethod(sandbox, Org.prototype, 'createSandbox');
      stubMethod(sandbox, fs, 'existsSync').returns(true);
      const setAliasStub = stubMethod(sandbox, AuthInfo.prototype, 'setAlias');
      const setAsDefaultStub = stubMethod(sandbox, AuthInfo.prototype, 'setAsDefault');
      await command.runIt();

      Lifecycle.getInstance().on(SandboxEvents.EVENT_RESULT, async (result) => {
        expect(result).to.deep.equal(data);
        expect(uxLogStub.firstCall.args[0]).to.equal('Sandbox TestSandbox(0GR4p000000U8EMXXX) is ready for use.');
        expect(uxStyledHeaderStub.firstCall.args[0]).to.equal('Sandbox Org Creation Status');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(uxTableStub.firstCall.args[0].length).to.equal(12);
        expect(uxTableStub.firstCall.args[0]).to.deep.equal([
          {
            key: 'Id',
            value: '0GR4p000000U8EMXXX',
          },
          {
            key: 'SandboxName',
            value: 'TestSandbox',
          },
          {
            key: 'Status',
            value: 'Completed',
          },
          {
            key: 'CopyProgress',
            value: 100,
          },
          {
            key: 'Description',
            value: 'sandbox description',
          },
          {
            key: 'LicenseType',
            value: 'DEVELOPER',
          },
          {
            key: 'SandboxInfoId',
            value: '0GQ4p000000U6sKXXX',
          },
          {
            key: 'SourceId',
            value: '123',
          },
          {
            key: 'SandboxOrg',
            value: '00D2f0000008XXX',
          },
          {
            key: 'Created Date',
            value: '2021-12-07T16:20:21.000+0000',
          },
          {
            key: 'ApexClassId',
            value: '123',
          },
          {
            key: 'Authorized Sandbox Username',
            value: 'newSandboxUsername',
          },
        ]);
        expect(setAliasStub.firstCall.args).to.deep.equal(['sandboxAlias']);
        expect(setAsDefaultStub.firstCall.args).to.deep.equal([{ org: true }]);
      });

      const sandboxRes: SandboxUserAuthResponse = {
        authCode: 'sandboxTestAuthCode',
        authUserName: 'newSandboxUsername',
        instanceUrl: 'https://login.salesforce.com',
        loginUrl: 'https://productionOrg--createdSandbox.salesforce.com/',
      };
      const data = { sandboxProcessObj, sandboxRes };

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_RESULT, data);
    });

    it('will wrap the partial success error correctly', async () => {
      const command = await createCommand(['-o', 'testProdOrg', '--no-prompt']);

      stubMethod(sandbox, cmd, 'readJsonDefFile').returns({
        licenseType: 'licenseFromJon',
        sandboxName: 'sandboxNameFromJson',
      });
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'createSandbox').throws({ message: 'The org cannot be found' });
      stubMethod(sandbox, fs, 'existsSync').returns(true);
      try {
        await command.runIt();
        assert.fail('the above should throw an error');
      } catch (e) {
        const error = e as SfError;
        expect(error.actions[0]).to.equal(messages.getMessage('error.DnsTimeout'));
        expect(error.actions[1]).to.equal(messages.getMessage('error.PartialSuccess'));
        expect(error.exitCode).to.equal(68);
      }

      Lifecycle.getInstance().on(SandboxEvents.EVENT_STATUS, async () => {
        expect(progressUpdate.firstCall.args[0]).to.equal(100);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(progressUpdate.firstCall.args[1]['remainingWaitTime']).to.equal(30);
      });

      const data = {
        sandboxProcessObj,
        interval: 30,
        retries: 1,
        waitingOnAuth: false,
      };

      await Lifecycle.getInstance().emit(SandboxEvents.EVENT_STATUS, data);
    });
  });

  afterEach(() => {
    sandbox.restore();
    createSandboxStub?.restore();
  });
});

describe('sandbox progress', () => {
  it('will calculate the correct human readable message (1h 33min 00seconds seconds left)', async () => {
    const data = {
      // 186*30 = 5580 = 1 hour, 33 min, 0 seconds. so 186 attempts left, at a 30 second polling interval
      sandboxProcessObj,
      interval: 30,
      retries: 186,
      waitingOnAuth: false,
    };
    const res = getSandboxProgress(data);
    expect(res).to.have.property('id', 'TestSandbox(0GR4p000000U8EMXXX)');
    expect(res).to.have.property('status', 'Completed');
    expect(res).to.have.property('percentComplete', 100);
    expect(res).to.have.property('remainingWaitTimeHuman', '1 hour 33 minutes until timeout.');
  });

  it('will calculate the correct human readable message (5 min 30seconds seconds left)', async () => {
    const data = {
      sandboxProcessObj,
      interval: 30,
      retries: 11,
      waitingOnAuth: false,
    };
    const res = getSandboxProgress(data);
    expect(res).to.have.property('id', 'TestSandbox(0GR4p000000U8EMXXX)');
    expect(res).to.have.property('status', 'Completed');
    expect(res).to.have.property('percentComplete', 100);
    expect(res).to.have.property('remainingWaitTimeHuman', '5 minutes 30 seconds until timeout.');
  });
});
