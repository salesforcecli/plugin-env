/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { deepCopy } from '@salesforce/core/lib/globalInfo/globalInfoConfig';
import * as chalk from 'chalk';
import {
  getFormattedStages,
  initialSandboxCopyStages,
  SandboxStage,
  StateCharacters,
  updateStages,
} from '../../src/shared/sandboxReporter';

describe('sandboxReporter', () => {
  describe('updateStages', () => {
    let stages: SandboxStage;
    beforeEach(() => {
      stages = deepCopy<SandboxStage>(initialSandboxCopyStages);
    });
    it('should update existing stage', () => {
      const newStages = updateStages(stages, 'Pending', StateCharacters.failed);
      const pendingStage = newStages['Pending'];
      expect(pendingStage).to.be.ok;
      expect(pendingStage.state).to.equal(StateCharacters.failed);
    });
    it('should insert new stage at beginning of stages', () => {
      const newStages = updateStages(stages, 'Creating', StateCharacters.inProgress);
      const creatingStage = newStages['Creating'];
      const pendingStage = newStages['Pending'];
      expect(creatingStage).to.be.ok;
      expect(creatingStage.state).to.equal(StateCharacters.inProgress);
      expect(creatingStage.index).to.be.lessThan(pendingStage.index);
    });
    it('should insert new stage at end of stages', () => {
      Object.keys(stages).forEach((stage) => {
        stages[stage].visited = true;
        stages[stage].state = StateCharacters.success;
      });
      const newStages = updateStages(stages, 'Past the End', StateCharacters.inProgress);
      const pastTheEnd = newStages['Past the End'];
      const authenticatingStage = newStages['Authenticating'];
      expect(pastTheEnd).to.be.ok;
      expect(pastTheEnd.state).to.equal(StateCharacters.inProgress);
      expect(pastTheEnd.index).to.be.greaterThan(authenticatingStage.index);
    });
    it('should insert new stage after Processing', () => {
      Object.keys(stages).forEach((stage) => {
        if (['Pending', 'Processing'].includes(stage)) {
          stages[stage].visited = true;
          stages[stage].state = StateCharacters.success;
        }
      });
      const newStages = updateStages(stages, 'After Processing', StateCharacters.inProgress);
      const afterProcessStage = newStages['After Processing'];
      const processingStage = newStages['Processing'];
      expect(afterProcessStage).to.be.ok;
      expect(afterProcessStage.state).to.equal(StateCharacters.inProgress);
      expect(afterProcessStage.index).to.be.equal(processingStage.index + 1);
    });
  });
  describe('getFormattedStages', () => {
    let stages: SandboxStage;
    beforeEach(() => {
      stages = deepCopy<SandboxStage>(initialSandboxCopyStages);
    });
    it('should get formatted stages - all unknown', () => {
      const formattedStages = getFormattedStages(stages);
      expect(formattedStages).to.be.ok;
      expect(formattedStages).to.include(StateCharacters.unknown);
      expect(formattedStages).to.include(chalk.dim(''));
    });
    it('should get formatted stages - pending in progress', () => {
      stages = updateStages(stages, 'Pending', StateCharacters.inProgress);
      const formattedStages = getFormattedStages(stages);
      expect(formattedStages).to.be.ok;
      expect(formattedStages).to.include(StateCharacters.unknown);
      expect(formattedStages).to.include(`${StateCharacters.inProgress} ${chalk.yellow('Pending')}`);
    });
    it('should get formatted stages - pending successful', () => {
      stages = updateStages(stages, 'Pending', StateCharacters.success);
      stages = updateStages(stages, 'Processing', StateCharacters.inProgress);
      const formattedStages = getFormattedStages(stages);
      expect(formattedStages).to.be.ok;
      expect(formattedStages).to.include(StateCharacters.unknown);
      expect(formattedStages).to.include(`${StateCharacters.success} ${chalk.green('Pending')}`);
    });
    it('should get formatted stages - processing failed', () => {
      stages = updateStages(stages, 'Pending', StateCharacters.success);
      stages = updateStages(stages, 'Processing', StateCharacters.failed);
      const formattedStages = getFormattedStages(stages);
      expect(formattedStages).to.be.ok;
      expect(formattedStages).to.include(StateCharacters.unknown);
      expect(formattedStages).to.include(`${StateCharacters.failed} ${chalk.red('Processing')}`);
    });
  });
});
