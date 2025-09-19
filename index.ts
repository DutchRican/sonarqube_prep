import ora, { type Ora } from 'ora';
import prompts from 'prompts';
import { SQManager } from './lib/logic/sqManager';
import { checkFirstTimeRunning, getEnvVars } from './lib/logic/utils';
import type { Project } from './lib/models/projectModel';

async function getResponses(projects: Array<Project>) {
	const responses = await prompts([
		{
			type: 'text',
			name: 'projectName',
			message: 'What is the project name?',
			initial: 'test'
		},
		{
			type: 'multiselect',
			name: 'badgesSelected',
			message: 'What badges would you like to show in the ReadMe?',
			choices: [{ title: 'Coverage' }, { title: 'Duplication' }]
		},
		{
			type: 'autocomplete',
			name: 'projectKey',
			message: 'Enter or select a project key',
			choices: projects.map((p) => ({ title: p.name, value: p.key })),
			suggest: async (input, choices) => {
				const matches = choices.filter((choice) => choice.title.toLocaleLowerCase().includes(input.toLocaleLowerCase()));

				if (!matches.length && input.trim() !== '') {
					matches.push({ title: input, value: input })
				}
				return matches;
			}
		}
	]);
	console.log(responses);
}

await checkFirstTimeRunning();
const { SONAR_HOST_URL, SONAR_TOKEN } = await getEnvVars();
const sqManager = new SQManager(SONAR_HOST_URL, SONAR_TOKEN);
let spinner: Ora;
if (SONAR_TOKEN) {
	spinner = ora({ text: 'Fetching Projects', spinner: 'bouncingBall', color: 'blue' }).start();
}
const prefetchedProjects = await sqManager.getProjectList().finally(() => spinner?.succeed());
await getResponses(prefetchedProjects);
