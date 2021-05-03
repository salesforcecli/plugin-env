/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { test } from '@oclif/test';
import { expect } from 'chai';

describe('hello:org', () => {
  test
    .stdout()
    // Test needs to be updated to support spaced commands
    .command(['hello:org'])
    .it('runs hello:org', (ctx) => {
      expect(ctx.stdout).to.contain('Hello world!');
    });
});
