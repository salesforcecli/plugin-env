/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { OrgConfigProperties } from '@salesforce/core';
import { expect } from 'chai';

describe('env list NUTs', () => {
  let session: TestSession;
  let usernameOrAlias: string;
  before(async () => {
    const executablePath = path.join(process.cwd(), 'bin', 'dev');
    session = await TestSession.create({
      setupCommands: [`${executablePath} config get ${OrgConfigProperties.TARGET_DEV_HUB} --json`],
    });
    usernameOrAlias = (session.setup[0] as { result: [{ value: string }] }).result[0].value;

    if (!usernameOrAlias) throw Error('no default username set');
  });

  after(async () => {
    await session?.clean();
  });

  it('should list dev hub', () => {
    const command = 'env list';
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
    expect(output).to.contain(usernameOrAlias);
  });
});
