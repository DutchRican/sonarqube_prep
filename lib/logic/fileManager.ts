import type { badgeOptions } from '@constants';
import { wf } from '@lib/workflow';
import { buildBadges, type badgeBuildTypes } from '@logic/utils';
import fs from 'fs/promises';
import path from 'path';

export class FileManager {
	currentWorkingDirectory: string;

	constructor() {
		this.currentWorkingDirectory = process.cwd();
	}

	async createWorkflowYml(branch: string) {
		try {
			const ymlString = wf.replaceAll(/{{ branch }}/gi, branch);
			const location = path.join(this.currentWorkingDirectory, '.github', 'workflows');
			const dirName = path.dirname(location);
			if (!(await fs.stat(dirName))) {
				await fs.mkdir(location, { recursive: true });
			}
			await fs.writeFile(`${location}/sonarqube-build.yml`, ymlString, { encoding: 'utf-8' });
		} catch (err: any) {
			throw err.message;
		}
	}

	async createPropertiesFile(project: string) {
		const contents = `sonar.projectKey=${project}`;
		const location = path.join(this.currentWorkingDirectory, 'sonar-project.properties');
		try {
			await fs.writeFile(location, contents, { encoding: 'utf-8' });
		} catch (err: any) {
			throw err.message;
		}
	}

	async getCurrentReadme() {
		const file = path.join(this.currentWorkingDirectory, 'README.md');
		const readme = await fs.readFile(file, { encoding: 'utf-8' });
		return readme.split('\n');
	}

	async writeNewReadme(lines: string[]) {
		const file = path.join(this.currentWorkingDirectory, 'README.md');
		await fs.writeFile(file, lines.join('\n'), { encoding: 'utf-8' });
	}

	async updateReadme(badges: typeof badgeOptions, { project, sqUrl, token }: badgeBuildTypes) {
		if (!badges.length) return;
		try {
			const lines = await this.getCurrentReadme();
			const newLines = buildBadges(badges, { project, sqUrl, token });
			lines.unshift(...newLines);
			this.writeNewReadme(lines);
		} catch (err: any) {
			throw err.message;
		}
	}
}