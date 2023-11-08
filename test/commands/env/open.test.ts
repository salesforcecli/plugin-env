/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, Connection, Org, OrgAuthorization } from '@salesforce/core';

import { assert } from 'chai';
import EnvOpen, { OpenResult } from '../../../src/commands/env/open.js';

// we can't make this "readonly" or "as const" because OrgAuthorization includes a Nullable in is props
const expectedSfOrgs: Array<Partial<OrgAuthorization>> = [
  {
    orgId: '00Dxx54321987654321',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.salesforce.com',
    aliases: ['someOtherAlias'],
    oauthMethod: 'web',
    username: 'some-other-user@some.other.salesforce.com',
    error: 'some auth error',
  },
];

describe('open unit tests', () => {
  assert(expectedSfOrgs[0].username);
  test
    .stub(Connection.prototype, 'getAuthInfo', (stub) => stub.returns({}))
    .stub(AuthInfo, 'listAllAuthorizations', (stub) => stub.resolves(expectedSfOrgs))
    .stub(AuthInfo.prototype, 'getOrgFrontDoorUrl', (stub) =>
      stub.returns(`${expectedSfOrgs[0].instanceUrl}?sid=${expectedSfOrgs[0].accessToken}`)
    )
    .stub(Org.prototype, 'getConnection', (stub) =>
      stub.callsFake(() => {
        const getAuthInfo = (): AuthInfo => new AuthInfo();
        const conn = { getAuthInfo } as Connection;
        return conn;
      })
    )
    .stub(Org.prototype, 'refreshAuth', (stub) => stub.resolves())
    .stub(Org, 'create', (stub) => stub.resolves(new Org({ aliasOrUsername: expectedSfOrgs[0].username })))
    .stub(EnvOpen.prototype, 'open', (stub) => stub.resolves())
    .stdout()
    .command([
      'env:open',
      '--target-env',
      expectedSfOrgs[0].username,
      '--path',
      '/foo/bar/baz/',
      '--json',
      '--url-only',
    ])
    .it('should open environment with redirect path with json output', (ctx) => {
      const stdout = ctx.stdout;
      const { result } = JSON.parse(stdout) as { result: OpenResult };
      const urlStartRegEx = new RegExp(`^${expectedSfOrgs[0].instanceUrl}.*`);
      const urlEndRegEx = new RegExp(`.*[?,&]retURL=${encodeURIComponent('/foo/bar/baz/')}`);
      expect(result.url).match(urlStartRegEx);
      expect(result.url).match(urlEndRegEx);
    });
  test
    .stub(Connection.prototype, 'getAuthInfo', (stub) => stub.returns({}))
    .stub(AuthInfo, 'listAllAuthorizations', (stub) => stub.resolves(expectedSfOrgs))
    .stub(AuthInfo.prototype, 'getOrgFrontDoorUrl', (stub) => stub.returns(expectedSfOrgs[0].instanceUrl))
    .stub(Org.prototype, 'getConnection', (stub) =>
      stub.callsFake(() => {
        const getAuthInfo = (): AuthInfo => new AuthInfo();
        const conn = { getAuthInfo } as Connection;
        return conn;
      })
    )
    .stub(Org.prototype, 'refreshAuth', (stub) => stub.resolves())
    .stub(Org, 'create', (stub) => stub.resolves(new Org({ aliasOrUsername: expectedSfOrgs[0].username })))
    .stub(EnvOpen.prototype, 'open', (stub) => stub.resolves())
    .stdout()
    .command(['env:open', '--target-env', expectedSfOrgs[0].username, '--url-only', '--json'])
    .it('should open requested environment', (ctx) => {
      const stdout = ctx.stdout;
      const { result } = JSON.parse(stdout) as { result: OpenResult };
      expect(result.url).to.be.equal(expectedSfOrgs[0].instanceUrl);
    });
});
