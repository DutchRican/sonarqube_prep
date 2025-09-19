import 'dart:io';
import 'package:path/path.dart' as p;

import 'package:sq_prep/docs/wf.dart';
import 'package:sq_prep/core/badge_creator.dart';
import 'package:sq_prep/core/file_writer.dart';

class SonarQubeManager {
  final String _project;
  final String _token;
  final String _branch;
  final String _badges;
  final String _sonarUrl;
  final FileWriter _fileWriter;

  SonarQubeManager(
      {required String project,
      required String token,
      required String branch,
      required String badges,
      String? sonarUrl,
      FileWriter? fileWriter})
      : _project = project,
        _token = token,
        _branch = branch,
        _badges = badges,
        _sonarUrl = sonarUrl ?? "",
        _fileWriter = fileWriter ?? FileWriter();

  Future<void> createWorkflowYml() async {
    try {
      String ymlString = wf.replaceAll(RegExp(r'\{\{ branch \}\}'), _branch);
      await _fileWriter.writeNewFile(
          p.join(Directory.current.path, '.github', 'workflows',
              'sonarqube-build.yml'),
          ymlString);
    } catch (e) {
      print("Error creating workflow yml: $e");
      exit(1);
    }
  }

  Future<void> showSnippet() async {
    print(
        "\nHere is a Sonar job snippet you might want to use.\nThis can be added to a GitHub Actions workflow file:\n\n$jobStep");
  }

  Future<void> createPropertiesFile() async {
    final String propertiesContent = 'sonar.projectKey=$_project\n';
    await _fileWriter.writeNewFile(
        p.join(Directory.current.path, 'sonar-project.properties'),
        propertiesContent);
  }

  List<String> _getCurrentReadme() {
    final readme = File('README.md');
    final lines = readme.readAsLinesSync();
    return lines;
  }

  Future<void> _writeReadme(lines) async {
    await _fileWriter.writeNewFile(
        p.join(Directory.current.path, 'README.md'), lines.join('\n'));
  }

  List<String> _createBadges() {
    var badges = _badges.split(',').map((badge) => badge.trim()).toList();
    var badgeCreator =
        BadgeCreator(badges: badges, project: _project, token: _token, sqUrl: _sonarUrl );
    return badgeCreator.createBadges();
  }

  Future<void> updateReadme() async {
    if (_badges.isEmpty) return;

    final lines = _getCurrentReadme();
    final newLines = _createBadges();
    lines.insertAll(0, newLines);
    await _writeReadme(lines);
  }
}
