/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import EnvConnect, { ConnectMethod } from '../../../src/commands/env/connect';

describe('env connect', () => {
  describe('determineConnectMethod', () => {
    it('should return org_web connect method when no flags are provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const envConnect = new EnvConnect([], {});
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      envConnect.flags = (await envConnect.parse(EnvConnect)).flags;
      const method = envConnect.determineConnectMethod();
      expect(method).to.equal(ConnectMethod.ORG_WEB);
    });

    it('should return org_jwt connect method when jwt flags are provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const envConnect = new EnvConnect(['-f', 'key.txt', '-u', 'myUser', '-i', '12345'], {});
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      envConnect.flags = (await envConnect.parse(EnvConnect)).flags;
      const method = envConnect.determineConnectMethod();
      expect(method).to.equal(ConnectMethod.ORG_JWT);
    });
  });
});
