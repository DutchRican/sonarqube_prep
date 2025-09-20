import { projectFromJson } from "../models/projectModel.js";

export class SQManager {
	host: string;
	auth: string;
	PROJECT_URL = '/api/components/search_projects?ps=499';
	TOKEN_URL = '/api/project_badges/token';

	constructor(host: string, auth: string) {
		this.host = host;
		this.auth = auth;
	}

	// should really loop and get more if total items > pagesize
	async getProjectList() {
		if (!this.auth) return [];
		const response = await fetch(`${this.host}${this.PROJECT_URL}`, {
			headers: {
				"Authorization": `Bearer ${this.auth}`,
				"accept": "application/json"
			}
		});
		if (!response.ok) throw `Please double check your SonarQube URL and Token. \nThe request failed with: ${response.status}`;
		const json: any = await response.json();
		const projectList = projectFromJson(json['components'] || []);
		return projectList;
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