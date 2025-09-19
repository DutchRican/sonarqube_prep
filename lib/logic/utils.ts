import { exec } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import prompts from 'prompts';
import type { badgeOptions } from '../constants';

export const getHomeDir = () => {
	return os.homedir();
}

export const configLocation = () => {
	return `${getHomeDir()}/.sonarqube_prep`;
}

export const checkFirstTimeRunning = async () => {
	const exists = await fs.exists(configLocation());
	if (!exists) {
		await initialSetup();
	}
}

export const getEnvVars = async (): Promise<{ SONAR_HOST_URL: string, SONAR_TOKEN: string }> => {
	try {
		const data = await fs.readFile(configLocation(), { encoding: 'utf-8' });
		return JSON.parse(data);
	} catch (err: any) {
		throw Error(err.message);
	}
}

export const checkIfThisIsAGitRepo = () => {
	return new Promise<void>((res, rej) => {
		exec('git status', (error) => {
			if (error) {
				return rej('Please make sure that you run this from a git repo');
			}
			return res();
		});
	});
}

export const getDefaultBranch = (): Promise<string> => {
	return new Promise<string>((res, rej) => {
		return exec('git remote show origin', (error, stdout) => {
			if (error) {
				if (error.code === 128) {
					return rej('Unable to get origin repo information. \nMake sure you have access to the remote, and that it exists.')
				}
				return rej(error.message);
			}
			const lines = stdout.toString().split("\n");
			const head = lines.find((item) => item.includes('HEAD branch'));
			if (!head) return rej('HEAD branch was not found!');
			// safe bet to force this since we know head is not undefined.
			const branchName = head.split(':').at(-1)!;
			return res(branchName);
		});
	});
}

export const initialSetup = async () => {
	// get inquirer answers
	console.log('This is your first time running, let\'s get some basic information');
	const answers = await prompts([
		{
			type: 'text',
			name: 'url',
			initial: 'https://sonarcloud.io',
			message: 'The URL for your sonarqube instance',
			validate: async (input) => {
				try {
					new URL(input);
					return true;
				} catch {
					return false;
				}
			}

		},
		{
			type: 'text',
			name: 'token',
			initial: '',
			message: 'Optionally, add a Sonarqube API token for more functionality'
		}
	])

	const { url, token } = answers;
	const sqUrl = (url as string).endsWith('/') ? url.substring(0, -1) : url;
	const envVars = { SONAR_HOST_URL: url, SONAR_TOKEN: token || undefined };
	await fs.writeFile(configLocation(), JSON.stringify(envVars), { encoding: 'utf-8' });
	return envVars;
}

export type badgeBuildTypes = {
	project: string;
	sqUrl: string;
	token: string;
}

export const buildBadges = (selectedBadges: typeof badgeOptions, { project, sqUrl, token }: badgeBuildTypes) => {
	const badges = selectedBadges.map((entry) => {
		var badgeUrl = `${sqUrl}/api/project_badges/measure?project=${project}&metric=${entry.val}&token=${token}`;
		var dashUrl = `${sqUrl}/dashboard?id=${project}`;
		return `[![${entry.title}](${badgeUrl})](${dashUrl})`;
	});
	return badges;
}