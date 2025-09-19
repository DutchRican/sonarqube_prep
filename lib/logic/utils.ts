import fs from 'fs/promises';
import os from 'os';
import prompts from 'prompts';

export const SONAR_HOST_URL = 'SONAR_HOST_URL';
export const SONAR_TOKEN = 'SONAR_TOKEN';

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