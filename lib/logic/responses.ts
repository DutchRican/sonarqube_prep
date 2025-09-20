import ora, { type Ora } from "ora";
import prompts from "prompts";
import { badgeOptions } from "../constants.js";
import type { Project } from "../models/projectModel.js";
import type { SQManager } from "./sqManager.js";

export async function getResponses(projects: Array<Project>, defaultBranch: string, sqManager: SQManager) {
	const responses = await prompts([
		{
			type: 'text',
			name: 'defBranch',
			message: 'What is the default branch name?',
			initial: defaultBranch
		},
		projects.length ? {
			type: 'autocomplete',
			name: 'projectKey',
			message: 'Select or enter a project',
			choices: projects.map((p) => ({ title: p.name, value: p.key })),
			suggest: async (input, choices) => {
				const matches = choices.filter((choice) => choice.title.toLocaleLowerCase().includes(input.toLocaleLowerCase()));

				if (!matches.length && input.trim() !== '') {
					matches.push({ title: input, value: input })
				}
				return matches;
			}
		} : {
			type: 'text',
			name: 'projectKey',
			message: 'Enter a project key (get this from you sonarqube instance)'
		},
		projects.length ? {
			type: 'text',
			name: 'sq_token',
			message: 'Confirm or enter a Sonar Qube token for this projects badges:',
			initial: async (prev) => {
				let spinner: Ora;
				try {
					spinner = ora({ text: 'fetching token', spinner: 'arc' });
					const token = await sqManager.getTokenForBadges(prev).then((res) => { spinner.succeed(); return res; }).catch(() => { spinner.fail(); });
					return token;
				} catch {
					return '';
				}
			}
		} : {
			type: 'text',
			name: 'sq_token',
			message: 'Paste the token used for badges. (Get this from your sonarqube instance)'
		},
		{
			type: 'multiselect',
			name: 'badgesSelected',
			message: 'What badges would you like to show in the ReadMe?',
			choices: badgeOptions.map(el => ({ ...el, selected: true })),
		},
		{
			type: 'confirm',
			name: 'createYML',
			message: 'Would you like to create a separate github actions workflow file?',
			initial: true
		}
	]);
	return responses;
}