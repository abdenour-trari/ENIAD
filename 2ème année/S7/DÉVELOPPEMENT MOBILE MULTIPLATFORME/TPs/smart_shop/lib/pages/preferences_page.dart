import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

class PreferencesPage extends StatefulWidget {
  const PreferencesPage({super.key});

  @override
  State<PreferencesPage> createState() => _PreferencesPageState();
}

class _PreferencesPageState extends State<PreferencesPage> {
  bool isDark = false;
  int cartCount = 0;
  String username = "";

  @override
  void initState() {
    super.initState();
    loadPref();
  }

  Future<void> loadPref() async {
    final pref = await SharedPreferences.getInstance();
    setState(() {
      username = pref.getString("username") ?? "";
      isDark = pref.getBool("darkmode") ?? false;
      cartCount = pref.getInt("cart") ?? 0;
    });
  }

  Future<void> savePref() async {
    final pref = await SharedPreferences.getInstance();
    await pref.setString("username", username);
    await pref.setBool("isDark", isDark);
    await pref.setInt("cart", cartCount);

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("Préférences sauvegardées")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Préférences")),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: "Nom d'utilisateur",
                border: OutlineInputBorder(),
              ),
              onChanged: (value) => {
                setState(() {
                  username = value;
                }),
                print(username),
              },
            ),
            SizedBox(height: 20),
            // dark mode
            Text(
              "Mode Sombre",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.green,
              ),
            ),
            Switch(
              value: isDark,
              onChanged: (value) {
                setState(() {
                  isDark = !isDark;
                });
                print(isDark);
              },
            ),

            SizedBox(height: 20),
            // Nombre de puirdui dans le panier
            Row(
              children: [
                Text(
                  "Nombre de produits dans le panier:",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.green,
                  ),
                ),
                SizedBox(width: 10),
                IconButton(
                  onPressed: () {
                    setState(() {
                      if (cartCount > 0) {
                        cartCount--;
                      }
                    });
                  },
                  icon: Icon(Icons.remove),
                ),
                Text(cartCount.toString(), style: TextStyle(fontSize: 16)),
                IconButton(
                  onPressed: () {
                    setState(() {
                      cartCount++;
                    });
                  },
                  icon: Icon(Icons.add),
                ),
              ],
            ),
            Spacer(),
            ElevatedButton(onPressed: savePref, child: Text("Sauvegarder")),
          ],
        ),
      ),
    );
  }
}
