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
import { ScratchOrgCache } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import { CachedOptions } from '@salesforce/core/lib/org/scratchOrgCache';
import { ScratchCreateResponse } from '../../../../src/types';

describe('env create scratch async/resume', () => {
  let session: TestSession;
  let cacheFilePath: string;
  let sfJsonPath: string;
  let soiId: string;
  let username: string;

  const asyncKeys = ['username', 'orgId', 'scratchOrgInfo', 'warnings'];
  const completeKeys = [...asyncKeys, 'authFields'];

  const readCacheFile = async (): Promise<Record<string, CachedOptions>> => {
    return JSON.parse(await fs.promises.readFile(cacheFilePath, 'utf8')) as unknown as Record<string, CachedOptions>;
  };

  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'testProject',
      },
    });
    cacheFilePath = path.join(session.dir, '.sf', ScratchOrgCache.getFileName());
    sfJsonPath = path.join(session.dir, '.sf', 'sf.json');
  });

  after(async () => {
    await session?.clean();
  });

  describe('just edition', () => {
    it('requests org', () => {
      const resp = execCmd<ScratchCreateResponse>('env create scratch --edition developer --json --async', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(asyncKeys);
      soiId = resp.scratchOrgInfo.Id;
      username = resp.username;
    });
    it('is present in cache', async () => {
      expect(fs.existsSync(cacheFilePath)).to.be.true;
      const cache = await readCacheFile();
      expect(cache[soiId]).to.include.keys(['hubBaseUrl', 'definitionjson', 'hubUsername']);
      expect(cache[soiId].definitionjson).to.deep.equal({ edition: 'developer' });
    });
    it('resumes org using id', () => {
      const resp = execCmd<ScratchCreateResponse>(`env resume scratch --job-id ${soiId} --json`, {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(completeKeys);
    });
    it('org is authenticated', async () => {
      const sfJson = JSON.parse(await fs.promises.readFile(sfJsonPath, 'utf8')) as unknown as { orgs: JsonMap };
      expect(sfJson.orgs[username]).to.include.keys(['orgId', 'devHubUsername', 'accessToken']);
    });
    it('is NOT present in cache', async () => {
      const cache = await readCacheFile();
      expect(cache).to.not.have.property(soiId);
    });
  });

  describe('alias, set-default, username, config file, use-most-recent', () => {
    const testAlias = 'testAlias';
    it('requests org', () => {
      const resp = execCmd<ScratchCreateResponse>(
        `env create scratch --json --async -f ${path.join(
          'config',
          'project-scratch-def.json'
        )} --set-default --alias ${testAlias}`,
        {
          ensureExitCode: 0,
        }
      ).jsonOutput.result;
      expect(resp).to.have.all.keys(asyncKeys);
      soiId = resp.scratchOrgInfo.Id;
      username = resp.username;
    });
    it('is present in cache', async () => {
      expect(fs.existsSync(cacheFilePath)).to.be.true;
      const cache = await readCacheFile();

      expect(cache[soiId]).to.include.keys(['hubBaseUrl', 'definitionjson', 'hubUsername']);
      expect(cache[soiId]).to.have.property('setDefault', true);
      expect(cache[soiId].definitionjson).to.deep.equal(
        JSON.parse(
          await fs.promises.readFile(path.join(session.project.dir, 'config', 'project-scratch-def.json'), 'utf8')
        ) as unknown as JsonMap
      );
    });
    it('resumes org using latest', () => {
      const resp = execCmd<ScratchCreateResponse>('env resume scratch --use-most-recent --json', {
        ensureExitCode: 0,
      }).jsonOutput.result;
      expect(resp).to.have.all.keys(completeKeys);
    });
    it('org is authenticated with alias and config', async () => {
      const sfJson = JSON.parse(await fs.promises.readFile(sfJsonPath, 'utf8')) as unknown as {
        orgs: JsonMap;
        aliases: JsonMap;
      };
      expect(sfJson.orgs[username]).to.include.keys(['orgId', 'devHubUsername', 'accessToken']);
      expect(sfJson.aliases[testAlias]).to.equal(username);

      const config = JSON.parse(
        await fs.promises.readFile(path.join(session.project.dir, '.sf', 'config.json'), 'utf8')
      ) as unknown as Record<string, string>;

      expect(config['target-org']).to.equal(testAlias);
    });
    it('is NOT present in cache', async () => {
      const cache = await readCacheFile();
      expect(cache).to.not.have.property(soiId);
    });
  });
});
