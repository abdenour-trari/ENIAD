import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PrefsPage extends StatefulWidget {
  const PrefsPage({super.key});

  @override
  State<PrefsPage> createState() => _PrefsPageState();
}

class _PrefsPageState extends State<PrefsPage> {
  final TextEditingController _nameCtrl = TextEditingController();
  bool darkMode = false;
  int cartCount = 0;

  @override
  void initState() {
    super.initState();
    loadPrefs();
  }

  Future<void> loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameCtrl.text = prefs.getString("username") ?? "";
      darkMode = prefs.getBool("darkmode") ?? false;
      cartCount = prefs.getInt("cart") ?? 0;
    });
  }

  Future<void> savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("username", _nameCtrl.text);
    await prefs.setBool("darkmode", darkMode);
    await prefs.setInt("cart", cartCount);

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("Préférences sauvegardées")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Préférences")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: "Nom d'utilisateur",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text("Mode sombre"),
              value: darkMode,
              onChanged: (v) => setState(() => darkMode = v),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                const Text("Articles dans le panier"),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.remove),
                  onPressed: () {
                    if (cartCount > 0) {
                      setState(() => cartCount--);
                    }
                  },
                ),
                Text(cartCount.toString()),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () => setState(() => cartCount++),
                ),
              ],
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: savePrefs,
              child: const Text("Sauvegarder"),
            ),
          ],
        ),
      ),
    );
  }
}
