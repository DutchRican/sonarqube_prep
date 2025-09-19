import 'dart:convert';
import 'dart:io';

import 'package:interact/interact.dart';
import 'package:sq_prep/models/project.dart';
import 'package:sq_prep/utils/utils.dart';
import 'package:sq_prep/core/sq_manager.dart';
import 'package:sq_prep/core/file_writer.dart';

class SonarQubePrep {
  late final FilewriterInjector _fileWriter;
  late String authtoken;
  late List<Project> projectsInSQ;

  SonarQubePrep([FilewriterInjector? fileWriter]) {
    _fileWriter = fileWriter ?? FileWriter();
  }

  Future<void> prepForSQ() async {
    checkIfThisIsAGitRepo();
    await checkFirstTimeRunning();
  
    var sonarUrl = await getSonarUrl();
    authtoken = await getAuthToken();
    projectsInSQ = await getAvailableProjects(sonarUrl, authtoken);
    
    final [project, token, badges, branch, createGHAYml] = parseAnswers();

    var sqm = SonarQubeManager(
        project: project as String, token: token as String, branch: branch as String, badges: badges as String, sonarUrl: sonarUrl);
    if (createGHAYml as bool) { sqm.createWorkflowYml();} else {sqm.showSnippet();}
    sqm.createPropertiesFile();
    sqm.updateReadme();
  }

  Future<void> checkFirstTimeRunning() async {
    var home = '${getHomeDir()}/.sq_prep';
    var exists = await _fileWriter.checkExists(home);
    if (!exists) {
      await setSqUrl(home);
    }
  }

  Future<Map<String, String>> setSqUrl(String path) async {
    String sqUrl = Input(
            prompt: "Enter the SonarQube URL",
            defaultValue: "https://sonarcloud.io")
        .interact();

    String sqToken = Input(
        prompt: "Enter a SonarQube token with project read access, leaving this blank will limit interactive access",
        defaultValue: "")
        .interact();

    sqUrl = sqUrl.endsWith("/") ? sqUrl.substring(0, sqUrl.length - 1) : sqUrl;
    Map<String, String> envVars = {
      'SONAR_HOST_URL': sqUrl,
      'SONAR_TOKEN': sqToken
    };
    var envString = jsonEncode(envVars);
    await _fileWriter.writeNewFile(path, envString);
    return envVars;
  }

  List<Object> parseAnswers() {
    final bool current = Confirm(
      prompt: "Is this your current project: ${getCurrentProject()}",
      defaultValue: true,
    ).interact();
    if (!current) {
      print("Please cd into your project folder and run this command again");
      exit(1);
    }
   
    final String project = Input(
        prompt: "enter the project id here",
        defaultValue: "asdfsdf",
        validator: (String x) {
          if (x.isEmpty || !x.contains("_")) {
            throw ValidationError("Please enter a valid project id");
          }
          return true;
        }).interact();

    final String token = Input(
        prompt: "paste the token here",
        validator: (String x) {
          if (x.isEmpty || !x.contains("sqb_")) {
            throw ValidationError(
                "Please enter a valid token, it should start with sqb_");
          }
          return true;
        }).interact();
   
    final String branch = Input(
        prompt: "what is the default branch",
        defaultValue: getDefaultBranch(),
        validator: (String x) {
          if (x.isEmpty || x.contains(" ")) {
            throw ValidationError(
                "Please enter a valid branch name");
          }
          return true;
        }).interact();

    final badges = MultiSelect(
            prompt: "What badges would you like to use",
            options: badgeOptions,
            defaults: List<bool>.filled(badgeOptions.length, true))
        .interact();
    var selectedBadges = badges.map((e) => badgeOptions[e]).toList();

    final createGHAYml = Confirm(
      prompt: "Would you like to create a GitHub Actions workflow file",
      defaultValue: true,
    ).interact();
    return [project, token, selectedBadges.join(','), branch, createGHAYml];
  }
}
