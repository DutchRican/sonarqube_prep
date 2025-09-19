import 'dart:io';

abstract class FilewriterInjector {
  Future<void> writeNewFile(String path, String content);
  Future<bool> checkExists(String path);
}


class FileWriter implements FilewriterInjector {
  @override
  Future<void> writeNewFile(String path, String content) async {
    File file = File(path);
    if (!file.existsSync()) {
      await file.create(recursive: true);
    }
    await file.writeAsString(content);
  }

  @override
  Future<bool> checkExists(String path) async {
    File file = File(path);
    return file.exists();
  }
}