import { projectFromJson } from "../models/projectModel";

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
		if (!response.ok) throw response.status;
		const json = await response.json();
		const projectList = projectFromJson(json['components'] || []);
		return projectList;
	}
}