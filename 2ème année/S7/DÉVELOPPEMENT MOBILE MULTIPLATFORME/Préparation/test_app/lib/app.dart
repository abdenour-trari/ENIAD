import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:test_app/providers/app_provider.dart';
import 'package:test_app/providers/json_provider.dart';

class UserApp extends StatefulWidget {
  const UserApp({super.key});

  @override
  State<UserApp> createState() => _UserAppState();
}

class _UserAppState extends State<UserApp> {
  late TextEditingController nameController;
  late TextEditingController emailController;
  late TextEditingController preferedColorController;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController();
    emailController = TextEditingController();
    preferedColorController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<UsersProvider>();
    final jsonProvider = context.read<JsonProvider>();
    return Scaffold(
      appBar: AppBar(
        title: Text("Test App"),
        backgroundColor: Colors.blue,
        actions: [
          IconButton(
            onPressed: () {
              context.read<UsersProvider>().saveUserName(nameController.text);
              context.read<UsersProvider>().saveUserEmail(emailController.text);
              context.read<UsersProvider>().saveUserPreferedColor(
                preferedColorController.text,
              );

              jsonProvider.saveUser({
                'name': nameController.text,
                'email': emailController.text,
                'preferedColor': preferedColorController.text,
              });
            },
            icon: Icon(Icons.save),
          ),
        ],
      ),
      body: Column(
        children: [
          provider.userName.isNotEmpty
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Nom : ${provider.userName}"),
                    Text("Email : ${provider.userEmail}"),
                    Text("Couleur : ${provider.userPreferedColor}"),
                  ],
                )
              : Text("Remplir les champs"),

          SizedBox(height: 20),
          TextField(
            controller: nameController,
            decoration: InputDecoration(label: Text("User name")),
          ),
          SizedBox(height: 20),
          TextField(
            controller: emailController,
            decoration: InputDecoration(label: Text("User Email")),
          ),
          SizedBox(height: 20),
          TextField(
            controller: preferedColorController,
            decoration: InputDecoration(label: Text("Prefered Color")),
          ),
        ],
      ),
    );
  }
}
