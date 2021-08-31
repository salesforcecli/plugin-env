/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { OrgAuthorization } from '@salesforce/core';
import { SfHook } from '@salesforce/sf-plugins-core';
import { KEYS, SalesforceOrg } from '../../../src/hooks/envList';

const expectedSfOrgs: SalesforceOrg[] = [
  {
    orgId: '00Dxx12345678912345',
    instanceUrl: 'https://some.salesforce.com',
    aliases: ['someAlias'],
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
    configs: [],
  },
  {
    orgId: '00Dxx54321987654321',
    instanceUrl: 'https://some.other.salesforce.com',
    aliases: ['someOtherAlias'],
    oauthMethod: 'web',
    username: 'some-other-user@some.other.salesforce.com',
    error: 'some auth error',
    configs: [],
  },
];

const makeTableObj = (title: string, data: SalesforceOrg[]) => {
  return { title, data, keys: KEYS };
};

describe('list unit tests', () => {
  test
    .stub(SfHook, 'run', async () => ({
      successes: [{ result: makeTableObj('Salesforce Orgs', expectedSfOrgs) }],
      failures: [],
    }))
    .stdout()
    .command(['env:list', '--json'])
    .it('should list active orgs with json output', (ctx) => {
      const sfOrgs = JSON.parse(ctx.stdout) as OrgAuthorization[];
      expect(sfOrgs).to.be.deep.equal(expectedSfOrgs);
    });

  test
    .stub(SfHook, 'run', async () => ({
      successes: [{ result: makeTableObj('Salesforce Orgs', expectedSfOrgs) }],
      failures: [],
    }))
    .stdout()
    .command(['env:list'])
    .it('should list active orgs with human output', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.include(sfOrg.aliases[0]);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.include(sfOrg.oauthMethod);
        expect(stdout).to.include(sfOrg.instanceUrl);
      });
    });

  test
    .stub(SfHook, 'run', async () => ({
      successes: [{ result: makeTableObj('Salesforce Orgs', expectedSfOrgs) }],
      failures: [],
    }))
    .stdout()
    .command(['env:list', '--columns', 'org Id,username'])
    .it('should list active orgs with human output and display selected columns', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      ['Org ID', 'Username'].forEach((columnName) => expect(stdout).to.include(columnName));
      ['Aliases', 'Instance URL', 'Auth Method', 'Config'].forEach((columnName) =>
        expect(stdout).to.not.include(columnName)
      );
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.not.include(sfOrg.aliases[0]);
        expect(stdout).to.include(sfOrg.orgId);
        expect(stdout).to.include(sfOrg.username);
        expect(stdout).to.not.include(sfOrg.oauthMethod);
        expect(stdout).to.not.include(sfOrg.instanceUrl);
      });
    });

  test
    .stub(SfHook, 'run', async () => ({
      successes: [{ result: makeTableObj('Salesforce Orgs', expectedSfOrgs) }],
      failures: [],
    }))
    .stdout()
    .command(['env:list', '--filter', 'aliases=someAlias'])
    .it('should fetch active orgs with human output and filtered data', (ctx) => {
      const stdout = ctx.stdout;
      expect(stdout).to.be.ok;
      expect(stdout).to.include('someAlias');
      expect(stdout).to.not.include('someOtherAlias');
    });

  test
    .stub(SfHook, 'run', async () => ({
      successes: [{ result: makeTableObj('Salesforce Orgs', expectedSfOrgs) }],
      failures: [],
    }))
    .stdout()
    .command(['env:list', '--sort', '-aliases'])
    .it('should fetch active orgs with human output and sorted results', (ctx) => {
      const stdout = ctx.stdout.replace(/\n/g, '');
      expect(stdout).to.be.ok;
      expect(stdout).to.match(/.*?someOtherAlias.*?someAlias.*/g);
    });
});
