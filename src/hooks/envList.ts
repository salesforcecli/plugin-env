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
  Aliases: string;
  Username: string;
  'Org ID': string;
  'Instance Url': string;
  'Auth Method': string;
  Config: string;
  Error?: string;
};

function extractData(orgs: OrgAuthorization[]): SalesforceOrg[] {
  return orgs.map((org) => {
    const base: SalesforceOrg = {
      Aliases: org.aliases ? org.aliases.join(', ') : '',
      Username: org.username,
      'Org ID': org.orgId,
      'Instance Url': org.instanceUrl,
      'Auth Method': org.oauthMethod,
      Config: org.configs ? org.configs.join(', ') : '',
    };
    if (org.error) base.Error = org.error || '';
    return base;
  });
}

function extractColumns(orgs: OrgAuthorization[]): Array<keyof SalesforceOrg> {
  const columns: Array<keyof SalesforceOrg> = [
    'Aliases',
    'Username',
    'Org ID',
    'Instance Url',
    'Auth Method',
    'Config',
  ];
  const hasErrors = orgs.some((org) => !!org.error);
  return hasErrors ? [...columns, 'Error'] : columns;
}

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
    if (org.isScratchOrg) {
      grouped.scratchOrgs = grouped.scratchOrgs.concat(org);
    } else {
      grouped.nonScratchOrgs = grouped.nonScratchOrgs.concat(org);
    }
  }

  const salesforceOrgs = {
    title: 'Salesforce Orgs',
    data: extractData(grouped.nonScratchOrgs),
    columns: extractColumns(grouped.nonScratchOrgs),
  };

  const scratchOrgs = {
    title: 'Scratch Orgs',
    data: extractData(grouped.scratchOrgs),
    columns: extractColumns(grouped.scratchOrgs),
  };

  return [salesforceOrgs, scratchOrgs];
};

export default hook;
