/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ScratchOrgLifecycleEvent, scratchOrgLifecycleStages } from '@salesforce/core';
import * as chalk from 'chalk';

export const buildStatus = (data: ScratchOrgLifecycleEvent, baseUrl: string): string => `
Status: ${formatStage(data.stage)}
RequestId: ${formatRequest(baseUrl, data.scratchOrgInfo?.Id)}
OrgId: ${formatOrgId(data.scratchOrgInfo?.ScratchOrg)}
Username: ${formatUsername(data.scratchOrgInfo?.SignupUsername)})}`;

export const formatStage = (currentStage: ScratchOrgLifecycleEvent['stage']): string =>
  scratchOrgLifecycleStages
    .map((stage, stageIndex) => {
      // current stage
      if (currentStage === stage) return formatCurrentStage(stage);
      // completed stages
      if (scratchOrgLifecycleStages.indexOf(currentStage) > stageIndex) return formatCompletedStage(stage);
      // future stage
      return formatFutureStage(stage);
    })
    .join(chalk.dim(' -> '));

export const formatRequest = (baseUrl: string, id?: string): string =>
  `${id ? `${chalk.bold(id)} (${baseUrl}/${id})` : ''}`;

export const formatUsername = (username: string): string => `${username ? `${chalk.bold.blue(username)} ` : ''}`;
export const formatOrgId = (id: string): string => `${id ? `${chalk.bold.blue(id)} ` : ''}`;

export const formatCurrentStage = (stage: string): string => {
  return chalk.bold.blue(stage);
};
export const formatCompletedStage = (stage: string): string => {
  return chalk.green(stage);
};
export const formatFutureStage = (stage: string): string => {
  return chalk.dim(stage);
};
