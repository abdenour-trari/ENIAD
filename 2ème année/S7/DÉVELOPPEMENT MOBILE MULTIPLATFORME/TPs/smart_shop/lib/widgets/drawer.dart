import 'package:flutter/material.dart';
import 'package:smart_shop/mainscreen.dart';
import 'package:smart_shop/pages/profile_page.dart';
import 'package:smart_shop/pages/settings_page.dart';
import 'package:smart_shop/pages/shoppingcart_page.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        children: [
          DrawerHeader(
            child: Center(
              child: Text(
                "SmartShop",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          ListTile(
            leading: Icon(Icons.home),
            title: Text("Acceuil"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const Mainscreen()),
              );
            },
          ),

          ListTile(
            leading: Icon(Icons.shopping_cart),
            title: Text("Panier"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ShoppingcartPage(),
                ),
              );
            },
          ),

          ListTile(
            leading: Icon(Icons.person),
            title: Text("Profil"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ProfilePage()),
              );
            },
          ),

          ListTile(
            leading: Icon(Icons.settings),
            title: Text("Paramètres"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsPage()),
              );
            },
          ),
        ],
      ),
    );
  }
}
