import ora, { type Ora } from 'ora';
import { badgeOptions } from './constants.js';
import { FileManager } from './logic/fileManager.js';
import { getResponses } from './logic/responses.js';
import { SQManager } from './logic/sqManager.js';
import { checkFirstTimeRunning, checkIfThisIsAGitRepo, getDefaultBranch, getEnvVars } from './logic/utils.js';
import { jobStep } from './workflow.js';

await checkIfThisIsAGitRepo().catch((err) => {
	console.error(err);
	process.exit(1);
});
let defaultBranch: string;
try {
	defaultBranch = await getDefaultBranch();
	console.log(defaultBranch)
} catch (err) {
	console.error(err);
	process.exit(2);
}
await checkFirstTimeRunning();
try {
	const { SONAR_HOST_URL, SONAR_TOKEN } = await getEnvVars();
	const sqManager = new SQManager(SONAR_HOST_URL, SONAR_TOKEN);
	let spinner: Ora;
	if (SONAR_TOKEN) {
		spinner = ora({ text: 'Fetching Projects', spinner: 'bouncingBall', color: 'blue' }).start();
	}
	const prefetchedProjects = await sqManager.getProjectList().finally(() => spinner?.succeed());
	const responses = await getResponses(prefetchedProjects, defaultBranch, sqManager);
	const fm = new FileManager();
	if (responses.createYML) { await fm.createWorkflowYml(responses.defBranch); } else {
		console.log(`\nHere is a Sonar job snippet you might want to use.\nThis can be added to a GitHub Actions workflow file:\n\n${jobStep}`)
	}
	await fm.createPropertiesFile(responses.projectKey);
	await fm.updateReadme(responses.badgesSelected.map((index: number) => badgeOptions.at(index)), { project: responses.projectKey, sqUrl: SONAR_HOST_URL, token: responses.sq_token });

} catch (err) {
	console.error(err);
}
