import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_shop/provider/theme_provider.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(title: Text("Mon Profil"), backgroundColor: Colors.teal),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            CircleAvatar(
              radius: 100,
              backgroundImage: AssetImage("assets/profile/profile.jpg"),
            ),
            SizedBox(height: 10),
            Text(
              "TRARI Abdenour",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 3),
            Text("Etudiant à ENIAD Berkane"),

            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Mode Sombre"),
                Switch(
                  value: themeProvider.isDark,
                  onChanged: (value) {
                    themeProvider.toggleTheme(value);
                  },
                ),
              ],
            ),
            SizedBox(height: 10),

            Divider(),
            ListTile(
              leading: Icon(Icons.email),
              title: Text("a.trari@exemple.com"),
            ),
            ListTile(
              leading: Icon(Icons.phone),
              title: Text("+212 6 88 88 99 00"),
            ),
            ListTile(
              leading: Icon(Icons.location_on),
              title: Text("Oujda , Maroc"),
            ),
            Spacer(),
            ElevatedButton.icon(
              onPressed: () {},
              icon: Icon(Icons.add_shopping_cart),
              label: Text("Modifier mes informations"),
            ),
          ],
        ),
      ),
    );
  }
}
