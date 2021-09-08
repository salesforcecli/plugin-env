/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { AuthInfo, OrgAuthorization } from '@salesforce/core';
import * as sinon from 'sinon';
import hook, { KEYS } from '../../src/hooks/envList';

const ORGS = [
  {
    orgId: '00Dxx12345678912345',
    accessToken: '00Dxx12345678912345!fdkjlfsakjlsafdjldijafsjklsdfjklafdsjkl',
    instanceUrl: 'https://some.salesforce.com',
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
    aliases: [],
    configs: [],
  },
  {
    orgId: '00Dxx54321987654321',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.salesforce.com',
    aliases: ['someOtherAlias'],
    oauthMethod: 'web',
    username: 'some-other-user@some.other.salesforce.com',
    error: 'some auth error',
    configs: [],
  },
  {
    orgId: '00Dxx54321987654327',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.scratch.salesforce.com',
    aliases: ['MyScratch'],
    oauthMethod: 'web',
    username: 'some-other-scratch@some.other.salesforce.com',
    isScratchOrg: true,
    configs: [],
  },
  {
    orgId: '00Dxx54321987654327',
    accessToken: '00Dxx54321987654321!lasfdlkjasfdljkerwklj;afsdlkjdhk;f',
    instanceUrl: 'https://some.other.scratch.salesforce.com',
    oauthMethod: 'web',
    username: 'some-other-scratch@some.other.salesforce.com',
    isScratchOrg: true,
    isExpired: true,
    configs: [],
    aliases: [],
  },
];

const EXPECTED_ORGS = [
  {
    orgId: '00Dxx12345678912345',
    instanceUrl: 'https://some.salesforce.com',
    oauthMethod: 'jwt',
    username: 'some-user@some.salesforce.com',
    aliases: [],
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
  {
    orgId: '00Dxx54321987654327',
    instanceUrl: 'https://some.other.scratch.salesforce.com',
    aliases: ['MyScratch'],
    oauthMethod: 'web',
    username: 'some-other-scratch@some.other.salesforce.com',
    configs: [],
  },
  {
    orgId: '00Dxx54321987654327',
    instanceUrl: 'https://some.other.scratch.salesforce.com',
    aliases: [],
    oauthMethod: 'web',
    username: 'some-other-scratch@some.other.salesforce.com',
    configs: [],
  },
];

describe('envList hook', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return non-expired salesforce orgs', async () => {
    sandbox.stub(AuthInfo, 'hasAuthentications').resolves(true);
    sandbox.stub(AuthInfo, 'listAllAuthorizations').resolves(ORGS.slice(0, 3) as OrgAuthorization[]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await hook({ all: false });
    expect(result).to.deep.equal([
      {
        title: 'Salesforce Orgs',
        data: EXPECTED_ORGS.slice(0, 2),
        keys: KEYS,
      },
      {
        title: 'Scratch Orgs',
        data: [EXPECTED_ORGS[2]],
        keys: KEYS,
      },
    ]);
  });

  it('should return all salesforce orgs', async () => {
    sandbox.stub(AuthInfo, 'hasAuthentications').resolves(true);
    sandbox.stub(AuthInfo, 'listAllAuthorizations').resolves(ORGS as OrgAuthorization[]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await hook({ all: true });
    expect(result).to.deep.equal([
      {
        title: 'Salesforce Orgs',
        data: EXPECTED_ORGS.slice(0, 2),
        keys: KEYS,
      },
      {
        title: 'Scratch Orgs',
        data: EXPECTED_ORGS.slice(2),
        keys: KEYS,
      },
    ]);
  });
});
