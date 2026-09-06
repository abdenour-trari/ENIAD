import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:test_app/providers/app_provider.dart';
import 'package:test_app/app.dart';
import 'package:test_app/providers/json_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UsersProvider()..loadUserData()),
        ChangeNotifierProvider(create: (_) => JsonProvider()),
      ],
      child: MaterialApp(home: UserApp(), debugShowCheckedModeBanner: false),
    ),
  );
}
