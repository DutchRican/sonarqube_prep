export class Project {
	key: string;
	name: string;

	constructor(name: string, key: string) {
		this.name = name;
		this.key = key;
	}
}

export const projectFromJson = (json: Array<projectType>) => {
	return json.map(entry => new Project(entry.name, entry.key))
}

export type projectType = {
	name: string;
	key: string;
}