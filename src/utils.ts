/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { isArray } from '@salesforce/ts-types';
import { capitalCase } from 'change-case';
import { JsonObject } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AuthInfo } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-env', 'util');

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

export function toValue(val: JsonObject[keyof JsonObject]): string | boolean | number {
  if (!val && val !== false) return '';
  if (isArray(val)) return val.join(', ');
  return val;
}

export function toKey(key: string, translations: Record<string, string> = {}): string {
  return translations[key] ?? capitalCase(key);
}

export const toKeyValuePairs = (source: string | string[]): Record<string, string> => {
  const s = typeof source === 'string' ? [source] : source;
  return s
    .map((property) => {
      const parts = property.includes(',') ? property.split(',') : [property];
      return parts.map((part) => {
        const [key, value] = part.split('=');
        if (!key || !value) {
          throw messages.createError('error.KeywordValueNotFormattedProperly', [part]);
        }
        return { [key]: value } as Record<string, string>;
      });
    })
    .flat()
    .reduce((o, e) => Object.assign(o, e), {} as Record<string, string>);
};
