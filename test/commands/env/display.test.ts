/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, SfOrg } from '@salesforce/core';

const expectedSfOrgs: Array<Partial<SfOrg>> = [
  {
    orgId: '00Dxx12345678912345',
    accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
    instanceUrl: 'https://some.salesforce.com',
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
  },
  {
    orgId: '00Dxx54321987654321',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.salesforce.com',
    alias: 'someOtherAlias',
    oauthMethod: 'web',
    username: 'some-other-user@some.other.salesforce.com',
    error: 'some auth error',
  },
];

describe('display unit tests', () => {
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stdout()
    .command(['env:display', '--environment', expectedSfOrgs[0].username, '--json'])
    .it('should fetch requested username with json output', (ctx) => {
      const sfOrgs = JSON.parse(ctx.stdout) as Array<Partial<SfOrg>>;
      expect(sfOrgs).to.be.deep.equal(expectedSfOrgs[0]);
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stdout()
    .command(['env:display', '--environment', expectedSfOrgs[0].username])
    .it('should fetch requested username with human output', (ctx) => {
      const stdout = ctx.stdout;
      expectedSfOrgs.slice(0, 1).forEach((sfOrg) => {
        expect(stdout).to.not.include(sfOrg.alias);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.include(sfOrg.oauthMethod);
        expect(stdout).to.include(sfOrg.instanceUrl);
      });
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stdout()
    .command(['env:display', '--environment', expectedSfOrgs[1].alias])
    .it('should fetch requested alias with human output', (ctx) => {
      const stdout = ctx.stdout;
      expectedSfOrgs.slice(1).forEach((sfOrg) => {
        expect(stdout).to.include(sfOrg.alias);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.include(sfOrg.oauthMethod);
        expect(stdout).to.include(sfOrg.instanceUrl);
      });
    });
  // this test will start to fail when env plugin incorporates more than authorization environment
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stdout()
    .stderr()
    .command(['env:display'])
    .catch((error) =>
      expect(error.message).to.to.include(
        'No default environment found. Use -e or --environment to specify an environment to open.'
      )
    )
    .it('should throw error if --environment is not specified');
});
