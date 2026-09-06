import 'package:flutter/material.dart';
import 'package:smart_shop/pages/home_page.dart';
import 'package:smart_shop/pages/profile_page.dart';
import 'package:smart_shop/pages/search_page.dart';
import 'package:smart_shop/pages/settings_page.dart';
import 'package:smart_shop/pages/shoppingcart_page.dart';
import '../pages/history_page.dart';

class Mainscreen extends StatefulWidget {
  const Mainscreen({super.key});

  @override
  State<Mainscreen> createState() => MainScreenState();
}

class MainScreenState extends State<Mainscreen> {
  int index = 0;

  final Color color = Colors.black;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomePage(),
      SearchPage(),
      ShoppingcartPage(),
      ProfilePage(),
      SettingsPage(),
      HistoryPage(),
    ];

    return Scaffold(
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: (i) => setState(() {
          index = i;
          switch (index) {
            case 0:
              Log.actions.add("Page Home visitée");
              break;

            case 1:
              Log.actions.add("Page de Recherche visitée");
              break;

            case 2:
              Log.actions.add("Page Panier visitée");
              break;

            case 3:
              Log.actions.add("Page Profil visitée");
              break;

            case 4:
              Log.actions.add("Page Paramètre visitée");
              break;

            default:
          }
        }),
        selectedItemColor: color,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home, color: color),
            label: "Acceuil",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search, color: color),
            label: "Rechrche",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart, color: color),
            label: "Panier",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person, color: color),
            label: "Profil",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings, color: color),
            label: "Paramètres",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history, color: color),
            label: "Historique",
          ),
        ],
      ),
      body: pages[index],
    );
  }
}
