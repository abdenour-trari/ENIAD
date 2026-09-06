import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class AuthService {
  static const _usersKey = 'local_users';

  /// 🔹 Charger users du JSON
  static Future<List<AppUser>> _loadJsonUsers() async {
    final data = await rootBundle.loadString('assets/data/users.json');
    final decoded = json.decode(data);
    return (decoded['users'] as List).map((e) => AppUser.fromJson(e)).toList();
  }

  /// 🔹 Charger users enregistrés (signup)
  static Future<List<AppUser>> _loadLocalUsers() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_usersKey);
    if (data == null) return [];
    return (json.decode(data) as List).map((e) => AppUser.fromJson(e)).toList();
  }

  /// 🔹 Login
  static Future<AppUser?> login(String email, String password) async {
    final jsonUsers = await _loadJsonUsers();
    final localUsers = await _loadLocalUsers();
    final allUsers = [...jsonUsers, ...localUsers];

    try {
      return allUsers.firstWhere(
        (u) => u.email == email && u.password == password,
      );
    } catch (_) {
      return null;
    }
  }

  /// 🔹 Signup
  static Future<AppUser?> register(
    String name,
    String email,
    String password,
    String image,
  ) async {
    final users = await _loadLocalUsers();

    if (users.any((u) => u.email == email)) return null;

    final newUser = AppUser(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      email: email,
      password: password,
      image: "assets/profile/profile.png",
    );

    users.add(newUser);

    final prefs = await SharedPreferences.getInstance();
    prefs.setString(
      _usersKey,
      json.encode(users.map((e) => e.toJson()).toList()),
    );

    return newUser;
  }
}
