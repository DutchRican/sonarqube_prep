import ora, {} from 'ora';
import { FileManager } from './lib/logic/fileManager';
import { getResponses } from './lib/logic/responses';
import { SQManager } from './lib/logic/sqManager';
import { checkFirstTimeRunning, checkIfThisIsAGitRepo, getDefaultBranch, getEnvVars } from './lib/logic/utils';
await checkIfThisIsAGitRepo().catch((err) => {
    console.error(err);
    process.exit(1);
});
try {
    await getDefaultBranch();
}
catch (err) {
    console.error(err);
    process.exit(2);
}
await checkFirstTimeRunning();
try {
    const { SONAR_HOST_URL, SONAR_TOKEN } = await getEnvVars();
    const sqManager = new SQManager(SONAR_HOST_URL, SONAR_TOKEN);
    let spinner;
    if (SONAR_TOKEN) {
        spinner = ora({ text: 'Fetching Projects', spinner: 'bouncingBall', color: 'blue' }).start();
    }
    const prefetchedProjects = await sqManager.getProjectList().finally(() => spinner?.succeed());
    const responses = await getResponses(prefetchedProjects, sqManager);
    const fm = new FileManager();
    console.log(responses);
    if (responses.createYML)
        await fm.createWorkflowYml("develop");
}
catch (err) {
    console.error(err);
}
