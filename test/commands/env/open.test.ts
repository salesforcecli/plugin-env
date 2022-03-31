/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, Connection, Org, SfOrg } from '@salesforce/core';

import EnvOpen, { OpenResult } from '../../../src/commands/env/open';

const expectedSfOrgs: Array<Partial<SfOrg>> = [
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

describe('open unit tests', () => {
  test
    .stub(Connection.prototype, 'getAuthInfo', (): AuthInfo => {
      return {} as AuthInfo;
    })
    .stub(AuthInfo.prototype, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stub(
      AuthInfo.prototype,
      'getOrgFrontDoorUrl',
      (): string => `${expectedSfOrgs[0].instanceUrl}?sid=${expectedSfOrgs[0].accessToken}`
    )
    .stub(Org.prototype, 'getConnection', (): Connection => {
      const getAuthInfo = (): AuthInfo => {
        return new AuthInfo();
      };
      const conn = { getAuthInfo } as Connection;
      return conn;
    })
    .stub(Org.prototype, 'refreshAuth', async (): Promise<void> => {})
    .stub(Org, 'create', async (): Promise<Org> => {
      return new Org({
        aliasOrUsername: expectedSfOrgs[0].username,
      } as Org.Options);
    })
    .stub(EnvOpen.prototype, 'open', async (): Promise<void> => {})
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
    .stub(Connection.prototype, 'getAuthInfo', (): AuthInfo => {
      return {} as AuthInfo;
    })
    .stub(AuthInfo.prototype, 'listAllAuthorizations', async (): Promise<Array<Partial<SfOrg>>> => expectedSfOrgs)
    .stub(AuthInfo.prototype, 'getOrgFrontDoorUrl', (): string => expectedSfOrgs[0].instanceUrl)
    .stub(Org.prototype, 'getConnection', (): Connection => {
      const getAuthInfo = (): AuthInfo => {
        return new AuthInfo();
      };
      const conn = { getAuthInfo } as Connection;
      return conn;
    })
    .stub(Org.prototype, 'refreshAuth', async (): Promise<void> => {})
    .stub(Org, 'create', async (): Promise<Org> => {
      return new Org({
        aliasOrUsername: expectedSfOrgs[0].username,
      } as Org.Options);
    })
    .stub(EnvOpen.prototype, 'open', async (): Promise<void> => {})
    .stdout()
    .command(['env:open', '--target-env', expectedSfOrgs[0].username, '--url-only', '--json'])
    .it('should open requested environment', (ctx) => {
      const stdout = ctx.stdout;
      const { result } = JSON.parse(stdout) as { result: OpenResult };
      expect(result.url).to.be.equal(expectedSfOrgs[0].instanceUrl);
    });
  test
    .stderr()
    .command(['env:open'])
    .it('should throw error if --target-env is not specified', (ctx) => {
      expect(ctx.stderr).to.to.include(
        'No default environment found. Use -e or --target-env to specify an environment to open.'
      );
    });
});
describe('open throws an error that is not NamedOrgNotFoundError or AuthInfoCreationError', () => {
  test
    .stub(Org, 'create', async (): Promise<Org> => {
      throw new Error('some other error');
    })
    .stderr()
    .command(['env:open', '--target-env', 'foobarbaz@some.org'])
    .it(
      'should throw error open fails for any reason other than NamedOrgNotFoundError or AuthInfoCreationError',
      (ctx) => {
        expect(ctx.stderr).to.to.include('some other error');
      }
    );
});
describe('open throws an error that is NamedOrgNotFoundError', () => {
  test
    .stub(Org, 'create', async (): Promise<Org> => {
      const err = new Error('NamedOrgNotFoundError');
      err.name = 'NamedOrgNotFoundError';
      throw err;
    })
    .stub(EnvOpen.prototype, 'open', async (): Promise<void> => {})
    .stderr()
    .command(['env:open', '--target-env', 'foobarbaz@some.org'])
    .it('should throw error open fails for no env found', (ctx) => {
      expect(ctx.stderr).to.to.include('No environment found for');
    });
});
