class Project {
  final String key;
  final String name;

  Project({required this.key, required this.name});

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      key: json['key'] as String,
      name: json["name"] as String
    );
  }
}
