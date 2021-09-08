/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, Messages, OrgAuthorization } from '@salesforce/core';
import { SfHook } from '@salesforce/sf-plugins-core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'list');

export type SalesforceOrg = {
  aliases: string[];
  username: string;
  orgId: string;
  instanceUrl: string;
  oauthMethod: string;
  configs: string[];
  error?: string;
};

function extractData(orgs: OrgAuthorization[]): SalesforceOrg[] {
  return orgs.map((org) => {
    const base: SalesforceOrg = {
      aliases: org.aliases,
      username: org.username,
      orgId: org.orgId,
      instanceUrl: org.instanceUrl,
      oauthMethod: org.oauthMethod,
      configs: org.configs,
    };
    if (org.error) base.error = org.error || '';
    return base;
  });
}

export const KEYS = {
  orgId: 'Org ID',
  oauthMethod: 'Auth Method',
  configs: 'Config',
};

const hook: SfHook.EnvList<SalesforceOrg> = async function (opts) {
  if (!(await AuthInfo.hasAuthentications())) throw messages.createError('error.NoAuthsAvailable');

  const orgs = opts.all
    ? await AuthInfo.listAllAuthorizations()
    : await AuthInfo.listAllAuthorizations((org) => org.isExpired !== true);

  const grouped = {
    nonScratchOrgs: [] as OrgAuthorization[],
    scratchOrgs: [] as OrgAuthorization[],
  };
  for (const org of orgs) {
    if (org.isScratchOrg) grouped.scratchOrgs.push(org);
    else grouped.nonScratchOrgs.push(org);
  }

  const salesforceOrgs = {
    title: 'Salesforce Orgs',
    data: extractData(grouped.nonScratchOrgs),
    keys: KEYS,
  };

  const scratchOrgs = {
    title: 'Scratch Orgs',
    data: extractData(grouped.scratchOrgs),
    keys: KEYS,
  };

  return [salesforceOrgs, scratchOrgs];
};

export default hook;
