/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AuthInfo } from '@salesforce/core';

export type OrgSideEffects = {
  alias: string;
  setDefault: boolean;
  setDefaultDevHub: boolean;
};

export async function handleSideEffects(authInfo: AuthInfo, sideEffects: OrgSideEffects): Promise<void> {
  if (sideEffects.alias) await authInfo.setAlias(sideEffects.alias);
  if (sideEffects.setDefault) await authInfo.setAsDefault({ org: true });
  if (sideEffects.setDefaultDevHub) await authInfo.setAsDefault({ devHub: true });
  await authInfo.save();
}
