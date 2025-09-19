import fs from 'fs/promises';
import path from 'path';
import { wf } from '../workflow';

export class FileManager {

	async createWorkflowYml(branch: string) {
		try {
			const ymlString = wf.replaceAll(/{{ branch }}/gi, branch);
			const location = path.join(process.cwd(), '.github', 'workflows');
			const dirName = path.dirname(location);
			if (!(await fs.exists(dirName))) {
				await fs.mkdir(location, { recursive: true });
			}
			await fs.writeFile(`${location}/sonarqube-build.yml`, ymlString, { encoding: 'utf-8' });
		} catch (err: any) {
			throw err.message;
		}
	}
}