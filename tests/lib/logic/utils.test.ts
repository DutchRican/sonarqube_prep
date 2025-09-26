import fs from 'fs/promises';
import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import os from 'os';
import * as utils from '../../../lib/logic/utils.js';

describe('Utils', () => {
	it('should get the config location', () => {
		const homeDirMock = mock.method(os, 'homedir', () => '/some/home/dir');
		const location = utils.configLocation();
		assert(homeDirMock.mock.callCount() === 1);
		assert(location === '/some/home/dir/.sonarqube_prep');
	});

	it('should see if the file exists for checkFirstTimeRunning', async (t) => {
		mock.method(os, 'homedir', () => '/some/home/dir');
		const fsAccessMock = mock.method(fs, 'access', async () => true);
		utils.checkFirstTimeRunning();
		assert(fsAccessMock.mock.callCount() === 1);

	});

	it('should build badges for buildBadges', async () => {
		const badges = utils.buildBadges([{ val: 'coverage', title: 'Coverage Total' }, { title: 'Lines of Code', val: 'ncloc' }], { project: 'some-project', sqUrl: 'http://sonarcloud.io', token: 'some-token' });
		assert.deepEqual(badges, ['[![Coverage Total](http://sonarcloud.io/api/project_badges/measure?project=some-project&metric=coverage&token=some-token)](http://sonarcloud.io/dashboard?id=some-project)', '[![Lines of Code](http://sonarcloud.io/api/project_badges/measure?project=some-project&metric=ncloc&token=some-token)](http://sonarcloud.io/dashboard?id=some-project)']);
	});
});