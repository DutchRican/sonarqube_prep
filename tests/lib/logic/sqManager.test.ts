import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { SQManager } from '../../../lib/logic/sqManager.js';

describe('SQManager', () => {
	it('should get a list of projects', async () => {
		const mockFetch = mock.method(global, 'fetch', async () => {
			return {
				ok: true,
				json: async () => ({ paging: { pageIndex: 1, pageSize: 10, total: 2 }, components: [{ key: 'project_1_key', name: 'Project 1' }, { key: 'project_2_key', name: 'Project 2' }] })
			};
		});
		const sqManager = new SQManager('https://sonarcloud.io', 'some-invalid-token');
		try {
			const projects = await sqManager.getProjectList();
			assert(mockFetch.mock.callCount() === 1);
			assert(projects.length === 2);
			assert(projects[0].key === 'project_1_key');
			assert(projects[0].name === 'Project 1');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should fetch a list of projects with pagination', async () => {
		const mockFetch = mock.method(global, 'fetch', async (url: string) => {
			if (url.includes('p=1')) {
				return {
					ok: true,
					json: async () => ({ paging: { pageIndex: 1, pageSize: 2, total: 4 }, components: [{ key: 'project_1_key', name: 'Project 1' }, { key: 'project_2_key', name: 'Project 2' }] })
				};
			}
			if (url.includes('p=2')) {
				return {
					ok: true,
					json: async () => ({ paging: { pageIndex: 2, pageSize: 2, total: 4 }, components: [{ key: 'project_3_key', name: 'Project 3' }, { key: 'project_4_key', name: 'Project 4' }] })
				};
			}
		});
		const sqManager = new SQManager('https://sonarcloud.io', 'some-invalid-token');
		try {
			const projects = await sqManager.getProjectList();
			assert(mockFetch.mock.callCount() === 2);
			assert(projects.length === 4);
			assert(projects[3].key === 'project_4_key');
			assert(projects[3].name === 'Project 4');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should handle an error when fetching projects', async () => {
		const mockFetch = mock.method(global, 'fetch', async () => {
			return {
				ok: false,
				status: 401
			};
		});
		const sqManager = new SQManager('https://sonarcloud.io', 'some-invalid-token');
		try {
			await sqManager.getProjectList();
			assert.fail('Expected an error to be thrown');
		} catch (err: any) {
			assert(mockFetch.mock.callCount() === 1);
			assert(err.includes('Please double check your SonarQube URL and Token'));
		}
	});

	it('should get token for badges', async () => {
		const mockFetch = mock.method(global, 'fetch', async () => {
			return {
				ok: true,
				json: async () => ({ token: 'some-badge-token' })
			};
		});
		const sqManager = new SQManager('https://sonarcloud.io', 'some-invalid-token');
		try {
			const token = await sqManager.getTokenForBadges('some-project-key');
			assert(mockFetch.mock.callCount() === 1);
			assert(token === 'some-badge-token');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});

	it('should handle an error when fetching token for badges', async () => {
		const mockFetch = mock.method(global, 'fetch', async () => {
			return {
				ok: false,
				status: 401
			};
		});
		const sqManager = new SQManager('https://sonarcloud.io', 'some-invalid-token');
		try {
			await sqManager.getTokenForBadges('some-project-key');
			assert.fail('Expected an error to be thrown');
		} catch (err: any) {
			assert(mockFetch.mock.callCount() === 1, `actual: ${mockFetch.mock.callCount()}`);
			assert(err.includes('Unable to fetch the project badges token'));
		}
	});

	it('should return an empty string if no auth token is provided when fetching token for badges', async () => {
		const sqManagerNoAuth = new SQManager('https://sonarcloud.io', '');
		try {
			const token = await sqManagerNoAuth.getTokenForBadges('some-project-key');
			assert(token === '');
		} catch (err: any) {
			assert.fail(err.message);
		}
	});
});