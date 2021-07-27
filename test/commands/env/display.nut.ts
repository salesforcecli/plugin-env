/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { ConfigAggregator, OrgConfigProperties } from '@salesforce/core';
import { expect } from 'chai';

describe('env display NUTs', () => {
  let session: TestSession;
  let usernameOrAlias: string;
  before(async () => {
    session = await TestSession.create({});

    usernameOrAlias = ConfigAggregator.getValue(OrgConfigProperties.TARGET_ORG).value as string;

    if (!usernameOrAlias) throw Error('no default username set');
  });

  after(async () => {
    await session?.clean();
  });

  it('should display dev hub', () => {
    const command = `env display --target-env ${usernameOrAlias}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain(usernameOrAlias);
  });
});
