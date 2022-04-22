/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ScratchOrgInfo, AuthFields } from '@salesforce/core';

export interface ScratchCreateResponse {
  username?: string;
  scratchOrgInfo: ScratchOrgInfo;
  authFields?: AuthFields;
  warnings: string[];
  orgId: string;
}
