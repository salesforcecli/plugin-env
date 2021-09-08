/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { isArray } from '@salesforce/ts-types';
import { capitalCase } from 'change-case';
import { JsonObject } from '@salesforce/sf-plugins-core';

export function toValue(val: JsonObject[keyof JsonObject]): string | boolean | number {
  if (!val && val !== false) return '';
  if (isArray(val)) return val.join(', ');
  return val;
}

export function toKey(key: string, translations: Record<string, string> = {}): string {
  return translations[key] ?? capitalCase(key);
}
