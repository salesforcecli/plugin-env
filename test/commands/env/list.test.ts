/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { OrgAuthorization } from '@salesforce/core';
import { SfHook } from '@salesforce/sf-plugins-core';
import { SalesforceOrg } from '../../../src/hooks/envList';

const expectedSfOrgs: SalesforceOrg[] = [
  {
    'Org ID': '00Dxx12345678912345',
    'Instance Url': 'https://some.salesforce.com',
    Aliases: 'someAlias',
    'Auth Method': 'jwt',
    Username: 'some-user@some.salesforce.com',
    Config: '',
  },
  {
    'Org ID': '00Dxx54321987654321',
    'Instance Url': 'https://some.other.salesforce.com',
    Aliases: 'someOtherAlias',
    'Auth Method': 'web',
    Username: 'some-other-user@some.other.salesforce.com',
    Error: 'some auth error',
    Config: '',
  },
];

const expectedColumnNames = ['Aliases', 'Username', 'Org ID', 'Instance Url', 'Auth Method', 'Config'];

const makeTableObj = (title: string, data: SalesforceOrg[]) => {
  return { title, data, columns: expectedColumnNames };
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
      expectedColumnNames.forEach((columnName) => expect(stdout).to.include(columnName));
      expectedSfOrgs.forEach((sfOrg) => {
        expect(stdout).to.include(sfOrg.Aliases);
        expect(stdout).to.include(sfOrg['Org ID']);
        expect(stdout).to.include(sfOrg.Username);
        expect(stdout).to.include(sfOrg['Auth Method']);
        expect(stdout).to.include(sfOrg['Instance Url']);
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
        expect(stdout).to.not.include(sfOrg.Aliases);
        expect(stdout).to.include(sfOrg['Org ID']);
        expect(stdout).to.include(sfOrg.Username);
        expect(stdout).to.not.include(sfOrg['Auth Method']);
        expect(stdout).to.not.include(sfOrg['Instance Url']);
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
