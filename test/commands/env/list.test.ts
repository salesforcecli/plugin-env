/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, SfOrg } from '@salesforce/core';

const expectedSfOrgs: SfOrg[] = [
  {
    orgId: '00Dxx12345678912345',
    accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
    instanceUrl: 'https://some.salesforce.com',
    alias: 'someAlias',
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

describe('list unit tests', () => {
  test
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<SfOrg[]> => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--json'])
    .it('should fetch active orgs with json output', (ctx) => {
      const sfOrgs = JSON.parse(ctx.stdout) as SfOrg[];
      expect(sfOrgs).to.be.deep.equal(expectedSfOrgs);
    });
  test
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<SfOrg[]> => expectedSfOrgs)
    .stdout()
    .command(['env:list'])
    .it('should fetch active orgs with human output', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.include(sfOrg.alias);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.include(sfOrg.oauthMethod);
        expect(stdout).to.include(sfOrg.instanceUrl);
      });
    });
  test
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<SfOrg[]> => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--columns', 'org Id,username'])
    .it('should fetch active orgs with human output and display selected columns', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.not.include(sfOrg.alias);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.not.include(sfOrg.oauthMethod);
        expect(stdout).to.not.include(sfOrg.instanceUrl);
      });
    });
  test
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<SfOrg[]> => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--filter', 'alias=someAlias'])
    .it('should fetch active orgs with human output and filtered data', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expect(stdout).to.include('someAlias');
      expect(stdout).to.not.include('someOtherAlias');
    });
  test
    .stub(AuthInfo, 'listAllAuthorizations', async (): Promise<SfOrg[]> => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--sort', '-alias'])
    .it('should fetch active orgs with human output and sorted results', (ctx) => {
      const stdout = ctx.stdout.replace(/\n/g, '');
      expect(stdout).to.be.ok;
      expect(stdout).to.match(/.*?someOtherAlias.*?someAlias.*/g);
    });
});
