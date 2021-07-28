/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { SfdxPropertyKeys } from '@salesforce/core';
import { env } from '@salesforce/kit';
import { expect } from 'chai';

describe('env display NUTs', () => {
  let session: TestSession;
  let usernameOrAlias: string;
  before(async () => {
    env.setString('TESTKIT_EXECUTABLE_PATH', path.join(process.cwd(), 'bin', 'dev'));
    session = await TestSession.create({});

    const config = execCmd<Array<{ value: string }>>(`config get ${SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME} --json`, {
      cli: 'sf',
    }).jsonOutput;
    usernameOrAlias = config[0].value;

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
