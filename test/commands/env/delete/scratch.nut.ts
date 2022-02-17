/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { ScratchDeleteResponse } from '../../../../src/commands/env/delete/scratch';

describe('env delete scratch NUTs', () => {
  const scratchOrgAlias = 'scratch-org';
  let session: TestSession;
  let scratchUsernames: string[];
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'testProject',
      },
      setupCommands: [
        `sfdx force:org:create -f config/project-scratch-def.json -d 1 -a ${scratchOrgAlias}`,
        'sfdx force:org:create -f config/project-scratch-def.json -d 1',
        'sfdx force:org:create -f config/project-scratch-def.json -d 1 -s',
      ],
    });
    scratchUsernames = (session.setup as Array<{ result: { username: string } }>).map((setup) => setup.result.username);
  });

  after(async () => {
    // don't try to run the clean command because the tests are deleting the orgs
    await fs.promises.rmdir(session.dir, { recursive: true });
  });

  it('should delete the 1st scratch org by alias', () => {
    const command = `env delete scratch --target-env ${scratchOrgAlias} --no-prompt --json`;
    const output = execCmd<ScratchDeleteResponse>(command, { ensureExitCode: 0 }).jsonOutput.result;
    expect(output.username).to.equal(scratchUsernames[0]);
  });

  it('should delete the 2nd scratch org by username', () => {
    const command = `env delete scratch --target-env ${scratchUsernames[1]} --no-prompt --json`;
    const output = execCmd<ScratchDeleteResponse>(command, { ensureExitCode: 0 }).jsonOutput.result;
    expect(output.username).to.equal(scratchUsernames[1]);
  });

  it('should delete the 3nd scratch org because it is the default', () => {
    const command = 'env delete scratch --no-prompt --json';
    const output = execCmd<ScratchDeleteResponse>(command, { ensureExitCode: 0 }).jsonOutput.result;
    expect(output.username).to.equal(scratchUsernames[2]);
  });
});
