/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { Lifecycle, Messages, SandboxEvents, SandboxProcessObject, StatusEvent } from '@salesforce/core';
import { expect } from 'chai';

Messages.importMessagesDirectory(__dirname);

describe('Sandbox Orgs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'sandboxCreate' },
    });
  });

  it('will create a sandbox, verify it can be opened, and then attempt to delete it', async () => {
    let result: SandboxProcessObject;
    try {
      Lifecycle.getInstance().on(SandboxEvents.EVENT_STATUS, async (results: StatusEvent) => {
        // eslint-disable-next-line no-console
        console.log('sandbox copy progress', results.sandboxProcessObj.CopyProgress);
      });
      const rawResult = execCmd(
        `env:create:sandbox -a mySandbox -s -l Developer -o ${process.env.TESTKIT_HUB_USERNAME} --no-prompt --json --async`,
        { timeout: 3600000 }
      );
      result = rawResult.jsonOutput.result as SandboxProcessObject;
      // autogenerated sandbox names start with 'sbx'
      expect(result).to.be.ok;
      // expect(result.CopyProgress, 'env:create:sandbox').to.equal(100);
      expect(result.SandboxName.startsWith('sbx'), 'env:create:sandbox').to.be.true;
      result = execCmd<SandboxProcessObject>(
        `env:resume:sandbox --name ${result.SandboxName} -a mySandbox -s -o ${process.env.TESTKIT_HUB_USERNAME} -w 60 --json`,
        { timeout: 3600000 }
      ).jsonOutput.result;
      expect(result).to.be.ok;
    } catch (e) {
      expect(false).to.be.true(JSON.stringify(e));
    }

    const sandboxUsername = `${process.env.TESTKIT_HUB_USERNAME}.${result.SandboxName}`;
    // even if a DNS issue occurred, the sandbox should still be present and available.
    const openResult = execCmd<{ url: string }>('env:open -e mySandbox --url-only --json', {
      ensureExitCode: 0,
    }).jsonOutput.result;
    expect(openResult, 'env:open').to.be.ok;
    expect(openResult.url, 'env:open').to.ok;

    const deleteResult = execCmd<{ username: string }>('env:delete:sandbox --target-org mySandbox --no-prompt --json', {
      ensureExitCode: 0,
    }).jsonOutput.result;
    expect(deleteResult, 'env:delete:sandbox').to.be.ok;
    expect(deleteResult.username, 'env:delete:sandbox').to.equal(sandboxUsername);
  });

  after(async () => {
    try {
      await session?.clean();
    } catch (e) {
      // do nothing, session?.clean() will try to remove files already removed by the org:delete and throw an error
      // it will also unwrap other stubbed methods
    }
  });
});