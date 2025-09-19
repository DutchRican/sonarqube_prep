import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:sq_prep/models/project.dart';

String getCurrentProject() {
  return Directory.current.path.split("/").last;
}

String getHomeDir() {
  return Platform.environment['HOME'] ??
      Platform.environment['USERPROFILE'] ??
      '';
}

void checkIfThisIsAGitRepo() {
  var result = Process.runSync("git", ["status"]);
  if (result.exitCode != 0) {
    print("Please make sure this is a git repo");
    exit(1);
  }
}

String getDefaultBranch() {
  final allBranchInformation =
      Process.runSync("git", ["remote", "show", "origin"]);
  // git remote show origin | sed -n '/HEAD branch/s/.*: //p'
  if (allBranchInformation.exitCode > 0) {
    print("Couldn't find the default branch, please try again");
    exit(1);
  }
  var lines = allBranchInformation.stdout.toString().split("\n");
  var defaultBranch = lines
      .firstWhere((line) => line.contains("HEAD branch"))
      .split(":")
      .last
      .trim();
  return defaultBranch;
}

Future<Map<String, dynamic>> _getConfig() async {
  var home = '${getHomeDir()}/.sq_prep';
  var envString = await File(home).readAsString();
  return jsonDecode(envString);
}

Future<String> getAuthToken() async {
  var conf = await _getConfig();
  return conf['SONAR_TOKEN'] ?? "";
}

Future<String> getSonarUrl() async {
  var conf = await _getConfig();
  return conf["SONAR_HOST_URL"] ?? "";
}

Future<List<Project>> getAvailableProjects(String sonarUrl, String authtoken) async {
  var uri = Uri.parse('$sonarUrl/api/components/search_projects?ps=499');
  var response = await http.get(uri, headers: {"Authorization": 'Bearer $authtoken'});
  if (response.statusCode != 200) {
    throw Exception('Failed to fetch projects: ${response.statusCode} ${response.reasonPhrase}');
  }
  var raw = jsonDecode(response.body);
  var components = raw["components"] ?? [];
  var projects = List<Project>.from(components.map((p) => Project.fromJson(p)));
  return projects;
}

final badgeMap = {
  'Quality Gate Status': 'alert_status',
  'Lines of Code': 'ncloc',
  'Coverage': 'coverage',
  'Maintainability Rating': 'sqale_rating',
  'Technical Debt': 'sqale_index',
  'Reliability Rating': 'reliability_rating',
  'Security Rating': 'security_rating'
};

List<String> badgeOptions = badgeMap.keys.toList();
