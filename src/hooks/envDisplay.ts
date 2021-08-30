/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, OrgAuthorization } from '@salesforce/core';
import { SfHook } from '@salesforce/sf-plugins-core';

const hook: SfHook.EnvDisplay<OrgAuthorization> = async function (opts) {
  const orgs = await AuthInfo.listAllAuthorizations();
  const match =
    orgs.find((org) => org.username === opts.targetEnv) ?? orgs.find((org) => org.aliases?.includes(opts.targetEnv));
  delete match['timestamp'];
  return match;
};

export default hook;
