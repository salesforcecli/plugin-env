/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Messages, GlobalInfo } from '@salesforce/core';
import { secretTimeout } from '../../../../src/commands/env/create/scratch';
import { ScratchCreateResponse } from '../../../../src/types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-env', 'create_scratch', ['prompt.secret']);
describe('env create scratch NUTs', () => {
  let session: TestSession;
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'testProject',
      },
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('flag failures', () => {
    it('non-existent config file', () => {
      execCmd('env create scratch -f badfile.json', { ensureExitCode: 1 });
    });
    it('config file AND edition', () => {
      execCmd('env create scratch -f config/project-scratch-def.json --edition developer', { ensureExitCode: 1 });
    });
    it('wait zero', () => {
      execCmd('env create scratch -f config/project-scratch-def.json --wait 0', { ensureExitCode: 1 });
    });
    it('no edition or config', () => {
      execCmd('env create scratch', { ensureExitCode: 1 });
    });
    it('days out of bounds', () => {
      execCmd('env create scratch -f config/project-scratch-def.json -d 50', { ensureExitCode: 1 });
    });
    it('prompts for client secret if client id present and times out', () => {
      const error = execCmd('env create scratch --edition developer --client-id someConnectedApp', {
        ensureExitCode: 1,
      }).shellOutput;
      expect(error.stdout).to.include(messages.getMessage('prompt.secret'));
      expect(error.stderr).to.include(`Timed out after ${secretTimeout} ms.`);
    });
  });

  describe('successes', () => {
    const keys = ['username', 'orgId', 'scratchOrgInfo', 'authFields', 'warnings'];

    it('creates an org from edition flag only and sets tracking to true by default', async () => {
      const resp = execCmd<ScratchCreateResponse>('env create scratch --edition developer --json', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(keys);
      const globalInfo = await GlobalInfo.create();
      expect(globalInfo.orgs.get(resp.username)).to.have.property('tracksSource', true);
      GlobalInfo.clearInstance();
    });
    it('creates an org from config file flag only', () => {
      const resp = execCmd<ScratchCreateResponse>('env create scratch -f config/project-scratch-def.json --json', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(keys);
    });
    it('creates an org with tracking disabled ', async () => {
      const resp = execCmd<ScratchCreateResponse>('env create scratch --edition developer --no-track-source --json', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(keys);
      const globalInfo = await GlobalInfo.create();
      expect(globalInfo.orgs.get(resp.username)).to.have.property('tracksSource', false);
      GlobalInfo.clearInstance();
    });

    it('stores default in local sf config', async () => {
      const resp = execCmd<ScratchCreateResponse>('env create scratch --edition developer --json --set-default', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(keys);

      expect(
        JSON.parse(await fs.promises.readFile(path.join(session.project.dir, '.sf', 'config.json'), 'utf8'))
      ).to.have.property('target-org', resp.username);
    });
    it('stores alias in global sf.json', async () => {
      const testAlias = 'testAlias';
      const resp = execCmd<ScratchCreateResponse>(
        `env create scratch --edition developer --json --alias ${testAlias}`,
        {
          ensureExitCode: 0,
        }
      ).jsonOutput.result;
      expect(resp).to.have.all.keys(keys);
      const globalJson = JSON.parse(
        await fs.promises.readFile(path.join(session.dir, '.sf', 'sf.json'), 'utf8')
      ) as Record<string, unknown>;
      expect(globalJson.orgs).to.have.property(resp.username);
      expect(globalJson.aliases).to.have.property(testAlias, resp.username);
    });
  });
});
