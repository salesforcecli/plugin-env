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
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@oclif/test';
import { AuthInfo, Connection, Org, SfOrg } from '@salesforce/core';

import Open, { OpenResult } from '../../../src/commands/env/open';

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
    .stub(Open.prototype, 'open', async (): Promise<void> => {})
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
      const url = JSON.parse(stdout) as OpenResult;
      const urlStartRegEx = new RegExp(`^${expectedSfOrgs[0].instanceUrl}.*`);
      const urlEndRegEx = new RegExp(`.*[?,&]retURL=${encodeURIComponent('/foo/bar/baz/')}`);
      expect(url.url).match(urlStartRegEx);
      expect(url.url).match(urlEndRegEx);
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
    .stub(Open.prototype, 'open', async (): Promise<void> => {})
    .stdout()
    .command(['env:open', '--target-env', expectedSfOrgs[0].username, '--json'])
    .it('should open requested environment', (ctx) => {
      const stdout = ctx.stdout;
      const url = JSON.parse(stdout) as OpenResult;
      expect(url.url).to.be.equal(expectedSfOrgs[0].instanceUrl);
    });
  test
    .stdout()
    .command(['env:open'])
    .catch((error) =>
      expect(error.message).to.to.include(
        'No default target-env found. Use --target-env to specify the environment to open.'
      )
    )
    .it('should throw error if --target-env is not specified');
});
describe('open throws an error that is not NamedOrgNotFoundError or AuthInfoCreationError', () => {
  test
    .stub(Org, 'create', async (): Promise<Org> => {
      throw new Error('some other error');
    })
    .command(['env:open', '--target-env', 'foobarbaz@some.org'])
    .catch((error) => expect(error.message).to.to.include('some other error'))
    .it('should throw error open fails for any reason other than NamedOrgNotFoundError or AuthInfoCreationError');
});
describe('open throws an error that is NamedOrgNotFoundError', () => {
  test
    .stub(Org, 'create', async (): Promise<Org> => {
      const err = new Error('NamedOrgNotFoundError');
      err.name = 'NamedOrgNotFoundError';
      throw err;
    })
    .stub(Open.prototype, 'open', async (): Promise<void> => {})
    .stdout()
    .command(['env:open', '--target-env', 'foobarbaz@some.org'])
    .catch((error) => expect(error.message).to.to.include('No environment found for'))
    .it('should throw error open fails for no env found');
});
