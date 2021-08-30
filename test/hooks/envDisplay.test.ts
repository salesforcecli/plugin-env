/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { AuthInfo, OrgAuthorization } from '@salesforce/core';
import * as sinon from 'sinon';
import hook from '../../src/hooks/envDisplay';

const ORGS = [
  {
    orgId: '00Dxx12345678912345',
    accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
    instanceUrl: 'https://some.salesforce.com',
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
    aliases: [],
  },
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

describe('envDisplay hook', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return a salesforce org by username', async () => {
    sandbox.stub(AuthInfo, 'listAllAuthorizations').resolves(ORGS as OrgAuthorization[]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await hook({ targetEnv: 'some-user@some.salesforce.com' });
    expect(result).to.deep.equal(ORGS[0]);
  });

  it('should return a salesforce org by alias', async () => {
    sandbox.stub(AuthInfo, 'listAllAuthorizations').resolves(ORGS as OrgAuthorization[]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await hook({ targetEnv: 'someOtherAlias' });
    expect(result).to.deep.equal(ORGS[1]);
  });
});
