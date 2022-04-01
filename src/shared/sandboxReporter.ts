/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { StatusEvent, ResultEvent } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import * as chalk from 'chalk';
import { deepCopy } from '@salesforce/core/lib/globalInfo';

export type SandboxProgress = {
  id: string;
  status: string;
  percentComplete: number;
  remainingWaitTime: number;
  remainingWaitTimeHuman: string;
};

export enum StateCharacters {
  'inProgress' = '⏳',
  'success' = '✅',
  'failed' = '❌',
  'unknown' = '…',
}

export interface SandboxStage {
  [stage: string]: { state: StateCharacters; index: number; visited: boolean };
}
export const stageNames = ['Pending', 'Processing', 'Activating', 'Completed', 'Authenticating'];
export const initialSandboxCopyStages = stageNames
  .map((stage, index) => {
    return { [stage]: { state: StateCharacters.unknown, index: (index + 1) * 10 } };
  })
  .reduce((m, b) => Object.assign(m, b), {} as SandboxStage) as SandboxStage;

export const getSandboxProgress = (update: StatusEvent): SandboxProgress => {
  const { retries, interval, sandboxProcessObj, waitingOnAuth } = update;
  const waitTimeInSec = retries * interval;

  const sandboxIdentifierMsg = `${sandboxProcessObj.SandboxName}(${sandboxProcessObj.Id})`;

  return {
    id: sandboxIdentifierMsg,
    status: waitingOnAuth ? 'Authenticating' : sandboxProcessObj.Status,
    percentComplete: sandboxProcessObj.CopyProgress,
    remainingWaitTime: waitTimeInSec,
    remainingWaitTimeHuman: waitTimeInSec === 0 ? '' : `${getClockForSeconds(waitTimeInSec)} until timeout.`,
  };
};

export const getLogSandboxProcessResult = (
  result: ResultEvent
): { sandboxReadyForUse: string; data: Array<{ key: string; value: string | number }> } => {
  const { sandboxProcessObj, sandboxRes } = result;
  const sandboxReadyForUse = `Sandbox ${sandboxProcessObj.SandboxName}(${sandboxProcessObj.Id}) is ready for use.`;

  const data = [
    { key: 'Id', value: sandboxProcessObj.Id },
    { key: 'SandboxName', value: sandboxProcessObj.SandboxName },
    { key: 'Status', value: sandboxProcessObj.Status },
    { key: 'CopyProgress', value: sandboxProcessObj.CopyProgress },
    { key: 'Description', value: sandboxProcessObj.Description },
    { key: 'LicenseType', value: sandboxProcessObj.LicenseType },
    { key: 'SandboxInfoId', value: sandboxProcessObj.SandboxInfoId },
    { key: 'SourceId', value: sandboxProcessObj.SourceId },
    { key: 'SandboxOrg', value: sandboxProcessObj.SandboxOrganization },
    { key: 'Created Date', value: sandboxProcessObj.CreatedDate },
    { key: 'ApexClassId', value: sandboxProcessObj.ApexClassId },
    { key: 'Authorized Sandbox Username', value: sandboxRes.authUserName },
  ];

  return { sandboxReadyForUse, data };
};

export type TimeComponents = {
  days: Duration;
  hours: Duration;
  minutes: Duration;
  seconds: Duration;
};

export const getTimeComponentsFromSeconds = (timeInSec: number): TimeComponents => {
  const days = Duration.days(Math.floor(timeInSec / 86_400));
  const hours = Duration.hours(Math.floor((timeInSec % 86_400) / 3_600));
  const minutes = Duration.minutes(Math.floor((timeInSec % 3_600) / 60));
  const seconds = Duration.seconds(Math.floor(timeInSec % 60));

  return { days, hours, minutes, seconds };
};
export const getSecondsToHuman = (timeInSec: number): string => {
  const tc = getTimeComponentsFromSeconds(timeInSec);

  const dDisplay: string = tc.days.days > 0 ? tc.days.toString() + ' ' : '';
  const hDisplay: string = tc.hours.hours > 0 ? tc.hours.toString() + ' ' : '';
  const mDisplay: string = tc.minutes.minutes > 0 ? tc.minutes.toString() + ' ' : '';
  const sDisplay: string = tc.seconds.seconds > 0 ? tc.seconds.toString() : '';

  return (dDisplay + hDisplay + mDisplay + sDisplay).trim();
};

export const getClockForSeconds = (timeInSec: number): string => {
  const tc = getTimeComponentsFromSeconds(timeInSec);

  const dDisplay: string = tc.days.days > 0 ? `${tc.days.days.toString()}:` : '';
  const hDisplay: string = tc.hours.hours.toString().padStart(2, '0');
  const mDisplay: string = tc.minutes.minutes.toString().padStart(2, '0');
  const sDisplay: string = tc.seconds.seconds.toString().padStart(2, '0');

  return `${dDisplay}${hDisplay}:${mDisplay}:${sDisplay}`;
};

const compareStages = ([, aValue], [, bValue]): number => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return aValue.index - bValue.index;
};

export const getFormattedStages = (stages: SandboxStage): string => {
  return Object.entries(stages)
    .sort(compareStages)
    .map(([stage, stageState]) => {
      let howToColorStage;
      switch (stageState.state) {
        case StateCharacters.inProgress:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          howToColorStage = chalk.yellow;
          break;
        case StateCharacters.success:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          howToColorStage = chalk.green;
          break;
        case StateCharacters.unknown:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          howToColorStage = chalk.dim;
          break;
        case StateCharacters.failed:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          howToColorStage = chalk.red;
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/restrict-template-expressions
      return `${stageState.state} ${howToColorStage(stage)}`;
    })
    .join(os.EOL);
};

export const updateStages = (stages: SandboxStage, currentStage: string, newState?: StateCharacters): SandboxStage => {
  let newStages = deepCopy<SandboxStage>(stages);
  if (!stages[currentStage]) {
    const sortedEntries = Object.entries(stages).sort(compareStages);
    const visitedEntries = sortedEntries.filter(([, stageState]) => stageState.visited);
    const [, lastState] = visitedEntries.length
      ? visitedEntries[visitedEntries.length - 1]
      : ['', { state: StateCharacters.unknown, index: 0, visited: true }];
    const newEntry = {
      [currentStage]: { state: StateCharacters.unknown, visited: true, index: lastState.index + 1 },
    };
    newStages = Object.assign(newStages, newEntry);
  }
  newStages[currentStage].visited = true;
  newStages[currentStage].state = newState || StateCharacters.inProgress;
  return newStages;
};

export const buildStatus = (status: StatusEvent): string => {
  const event = getSandboxProgress(status);
  return event.toString();
};

/*
text output that shows the current state of the request
spinner output that includes includes time remaining and overall percent completed
spinner
 */
