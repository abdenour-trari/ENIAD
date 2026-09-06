import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UsersProvider extends ChangeNotifier {
  String userName = "";
  String userEmail = "";
  String userPreferedColor = "";

  Future<void> loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    userName = prefs.getString("userName") ?? "";
    userEmail = prefs.getString("userEmail") ?? "";
    userPreferedColor = prefs.getString("userPreferedColor") ?? "";
    notifyListeners();
  }

  Future<void> saveUserName(String userN) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("userName", userN);
    userName = userN;
    notifyListeners();
  }

  Future<void> saveUserEmail(String userE) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("userEmail", userE);
    userEmail = userE;
    notifyListeners();
  }

  Future<void> saveUserPreferedColor(String userPC) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("userPreferedColor", userPC);
    userPreferedColor = userPC;
    notifyListeners();
  }
}
