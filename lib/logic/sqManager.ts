import { Project, projectFromJson } from "../models/projectModel.js";

export class SQManager {
	host: string;
	auth: string;
	PROJECT_URL = '/api/components/search_projects';
	TOKEN_URL = '/api/project_badges/token';

	constructor(host: string, auth: string) {
		this.host = host;
		this.auth = auth;
	}

	async getProjectList() {
		const projects: Project[] = [];
		const maxAttempts = 20;
		if (!this.auth) return projects;
		let currentPage = 1;
		while (true) {
			const response = await fetch(`${this.host}${this.PROJECT_URL}?ps=100&p=${currentPage}`, {
				headers: {
					"Authorization": `Bearer ${this.auth}`,
					"accept": "application/json"
				}
			});

			if (!response.ok) throw `Please double check your SonarQube URL and Token. \nThe request failed with: ${response.status}`;
			const json: any = await response.json();
			const { pageIndex, pageSize, total } = json['paging'];

			const projectList = projectFromJson(json['components'] || []);
			projects.push(...projectList);
			if (pageIndex * pageSize >= total || currentPage >= maxAttempts) {
				break;
			}
			currentPage += 1;
		}
		return projects;

	}

	async getTokenForBadges(projectKey: string) {
		if (!this.auth || !projectKey) return '';
		const response = await fetch(`${this.host}${this.TOKEN_URL}?project=${projectKey}`, {
			headers: {
				"Authorization": `Bearer ${this.auth}`,
				"accept": "application/json"
			}
		});
		if (!response.ok) throw 'Unable to fetch the project badges token';
		const json: any = await response.json();
		return json.token;
	}
}