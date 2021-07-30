/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, SfOrg } from '@salesforce/core';

const expectedSfOrgs = [
  {
    orgId: '00Dxx12345678912345',
    accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
    instanceUrl: 'https://some.salesforce.com',
    aliases: ['someAlias'],
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
  },
  {
    orgId: '00Dxx54321987654321',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.salesforce.com',
    aliases: ['someOtherAlias'],
    oauthMethod: 'web',
    username: 'some-other-user@some.other.salesforce.com',
    devhubUsername: 'some-user@some.salesforce.com',
    error: 'some auth error',
  },
];

describe('list unit tests', () => {
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async () => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--json'])
    .it('should fetch active orgs with json output', (ctx) => {
      const sfOrgs = JSON.parse(ctx.stdout) as SfOrg[];
      expect(sfOrgs).to.be.deep.equal(expectedSfOrgs);
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async () => expectedSfOrgs)
    .stdout()
    .command(['env:list'])
    .it('should fetch active orgs with human output', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.include(sfOrg.aliases);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.include(sfOrg.oauthMethod);
        expect(stdout).to.include(sfOrg.instanceUrl);
      });
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async () => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--columns', 'org Id,username'])
    .it('should fetch active orgs with human output and display selected columns', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.not.include(sfOrg.aliases);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.not.include(sfOrg.oauthMethod);
        expect(stdout).to.not.include(sfOrg.instanceUrl);
      });
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async () => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--filter', 'aliases=someAlias'])
    .it('should fetch active orgs with human output and filtered data', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expect(stdout).to.include('someAlias');
      expect(stdout).to.not.include('someOtherAlias');
    });
  test
    .stub(AuthInfo, 'hasAuthentications', async (): Promise<boolean> => true)
    .stub(AuthInfo, 'listAllAuthorizations', async () => expectedSfOrgs)
    .stdout()
    .command(['env:list', '--sort', '-aliases'])
    .it('should fetch active orgs with human output and sorted results', (ctx) => {
      const stdout = ctx.stdout.replace(/\n/g, '');
      expect(stdout).to.be.ok;
      expect(stdout).to.match(/.*?someOtherAlias.*?someAlias.*/g);
    });
});
