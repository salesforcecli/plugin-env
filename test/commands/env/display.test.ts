/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@oclif/test';
import { OrgAuthorization } from '@salesforce/core';
import { SfHook } from '@salesforce/sf-plugins-core';

const ORG = {
  orgId: '00Dxx12345678912345',
  accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
  instanceUrl: 'https://some.salesforce.com',
  oauthMethod: 'jwt',
  username: 'some-user@some.salesforce.com',
  aliases: ['MyOrg'],
  config: ['target-org'],
};

describe('display unit tests', () => {
  test
    .stub(SfHook, 'run', async () => ({ successes: [{ result: { data: ORG } }], failures: [] }))
    .stdout()
    .command(['env:display', '--target-env', ORG.username, '--json'])
    .it('should display requested username with json output', (ctx) => {
      const actual = JSON.parse(ctx.stdout) as { result: OrgAuthorization };
      expect(actual.result).to.be.deep.equal(ORG);
    });

  test
    .stub(SfHook, 'run', async () => ({ successes: [{ result: { data: ORG } }], failures: [] }))
    .stdout()
    .command(['env:display', '--target-env', ORG.username, '--json'])
    .it('should display requested username with human output', (ctx) => {
      expect(ctx.stdout).to.include(ORG.orgId);
      expect(ctx.stdout).to.include(ORG.username);
      expect(ctx.stdout).to.include(ORG.oauthMethod);
      expect(ctx.stdout).to.include(ORG.instanceUrl);
      expect(ctx.stdout).to.not.include('timestamp');
    });

  test
    .stub(SfHook, 'run', async () => ({ successes: [{ result: { data: ORG } }], failures: [] }))
    .stdout()
    .command(['env:display', '--target-env', ORG.aliases[0], '--json'])
    .it('should display requested alias with json output', (ctx) => {
      const actual = JSON.parse(ctx.stdout) as { result: OrgAuthorization };
      expect(actual.result).to.be.deep.equal(ORG);
    });

  test
    .stub(SfHook, 'run', async () => ({ successes: [{ result: { data: ORG } }], failures: [] }))
    .stdout()
    .command(['env:display', '--target-env', ORG.aliases[0], '--json'])
    .it('should display requested alias with human output', (ctx) => {
      expect(ctx.stdout).to.include(ORG.orgId);
      expect(ctx.stdout).to.include(ORG.username);
      expect(ctx.stdout).to.include(ORG.oauthMethod);
      expect(ctx.stdout).to.include(ORG.instanceUrl);
      expect(ctx.stdout).to.not.include('timestamp');
    });

  test
    .stdout()
    .stderr()
    .command(['env:display'])
    .catch((error) =>
      expect(error.message).to.to.include(
        'No default environment found. Use -e or --target-env to specify an environment to display.'
      )
    )
    .it('should throw error if --target-env is not specified');
});
