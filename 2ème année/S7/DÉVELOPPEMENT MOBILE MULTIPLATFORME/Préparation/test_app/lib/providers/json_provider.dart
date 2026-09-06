import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

class JsonProvider extends ChangeNotifier {
  Future<File> _getFile() async {
    final dir = await getApplicationDocumentsDirectory();
    print(dir.path);
    return File('${dir.path}/user.json');
  }

  Future<void> saveUser(Map<String, dynamic> userData) async {
    final file = await _getFile();
    await file.writeAsString(jsonEncode(userData));
    notifyListeners();
  }

  Future<Map<String, dynamic>> readUser() async {
    final file = await _getFile();

    if (!await file.exists()) {
      return {};
    }

    final content = await file.readAsString();
    return jsonDecode(content);
  }
}
