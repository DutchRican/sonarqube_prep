import 'dart:io';

import 'package:sq_prep/utils/utils.dart';

class BadgeCreator {
  final String _project;
  final String _token;
  final String _sqUrl;
  final List<String> _badges;


  BadgeCreator({required String project, required String token, required List<String> badges, required String sqUrl})
      : _project = project,
        _token = token,
        _badges = badges,
        _sqUrl = sqUrl;


  List<String> createBadges() {
   final badges = <String>[];
    for (final badge in _badges) {
      var badgeUrl = '$_sqUrl/api/project_badges/measure?project=$_project&metric=${badgeMap[badge]}&token=$_token';
      var dashUrl = '$_sqUrl/dashboard?id=$_project';
      badges.add(
          '[![$badge]($badgeUrl)]($dashUrl)');
    }
    badges.add('\n');
    return badges;
  }
}