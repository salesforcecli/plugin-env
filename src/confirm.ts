/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Prompter } from '@salesforce/sf-plugins-core';

export const confirm = async (message: string): Promise<boolean> => {
  const prompter = new Prompter();
  const { confirmed } = await prompter.prompt<{ confirmed: boolean }>([
    {
      name: 'confirmed',
      message,
      type: 'confirm',
    },
  ]);
  return confirmed;
};
