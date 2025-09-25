import fs from 'fs/promises';
import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { FileManager } from '../../../lib/logic/fileManager.js';


describe('FileManager', () => {
	let fileManager: FileManager;
	beforeEach(() => {
		fileManager = new FileManager();
	});

	it('should create workflow yml file', async () => {
		const fsMock = mock.method(fs, 'stat', async () => true);
		const fsMkdirMock = mock.method(fs, 'mkdir', async () => 'some directory');
		const fsWriteFileMock = mock.method(fs, 'writeFile', async () => void 0);
		try {
			await fileManager.createWorkflowYml('some-branch');
			console.log(fsWriteFileMock.mock.calls[0].arguments)
			assert(fsMock.mock.callCount() === 1);
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String).includes('- some-branch'));
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should create properties file', async () => {
		const fsWriteFileMock = mock.method(fs, 'writeFile', async () => void 0);
		try {
			await fileManager.createPropertiesFile('some-project');
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String) === 'sonar.projectKey=some-project');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should get current readme', async () => {
		const fsReadFileMock = mock.method(fs, 'readFile', async () => '# Some Readme\nSome content');
		try {
			const lines = await fileManager.getCurrentReadme();
			assert(fsReadFileMock.mock.callCount() === 1);
			assert(lines.length === 2);
			assert(lines[0] === '# Some Readme');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should write new readme', async () => {
		const fsWriteFileMock = mock.method(fs, 'writeFile', async () => void 0);
		try {
			await fileManager.writeNewReadme(['# New Readme', 'New content']);
			assert(fsWriteFileMock.mock.callCount() === 1);
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String).includes('# New Readme'));
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should update readme with badges', async () => {
		const fsReadFileMock = mock.method(fs, 'readFile', async () => '# Some Readme\nSome content');
		const fsWriteFileMock = mock.method(fs, 'writeFile', async () => void 0);
		try {
			await fileManager.updateReadme([{ title: 'coverage', val: 'cov string val' }, { title: 'quality gate', val: 'qual string val' }], { project: 'some-project', sqUrl: 'http://sonar.url', token: 'some-token' });
			assert(fsReadFileMock.mock.callCount() === 1);
			assert(fsWriteFileMock.mock.callCount() === 1);
			console.log(fsWriteFileMock.mock.calls[0].arguments);
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String).includes('[![coverage](http://sonar.url/api/project_badges/measure?project=some-project&metric=cov string val&token=some-token)](http://sonar.url/dashboard?id=some-project)'));
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String).includes('[![quality gate](http://sonar.url/api/project_badges/measure?project=some-project&metric=qual string val&token=some-token)](http://sonar.url/dashboard?id=some-project)'));
			assert((fsWriteFileMock.mock.calls[0].arguments[1] as String).includes('# Some Readme'));
		} catch (err: any) {
			assert.fail(err.message);
		}
	});
});

