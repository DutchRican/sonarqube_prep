export class Project {
    key;
    name;
    constructor(name, key) {
        this.name = name;
        this.key = key;
    }
}
export const projectFromJson = (json) => {
    return json.map(entry => new Project(entry.name, entry.key));
};
