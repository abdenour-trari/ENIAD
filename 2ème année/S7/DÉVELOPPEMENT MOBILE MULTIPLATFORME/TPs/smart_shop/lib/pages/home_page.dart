import 'package:flutter/material.dart';
import 'package:smart_shop/models/product.dart';
import 'package:smart_shop/pages/settings_page.dart';
import 'package:smart_shop/widgets/drawer.dart';
import 'package:smart_shop/widgets/product_card.dart';
import 'package:smart_shop/pages/shoppingcart_page.dart';
import 'package:smart_shop/widgets/section_title.dart';
import '../provider/shopping_cart_provider.dart';
import '../data/data.dart';
import 'package:provider/provider.dart';
import '../services/json_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String selectedCategory = "";
  Widget category(String catName) {
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: GestureDetector(
        onTap: () {
          setState(() {
            selectedCategory = catName;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: selectedCategory.contains(catName)
                ? Colors.green
                : Colors.green.withOpacity(0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.green, width: 1.2),
          ),
          child: Text(
            catName,
            style: TextStyle(
              color: selectedCategory.contains(catName)
                  ? Colors.white
                  : Colors.green,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shoppingCartProvider = Provider.of<ShoppingCartProvider>(context);
    return Scaffold(
      drawer: AppDrawer(),
      appBar: AppBar(
        title: const Text("SmartShop"),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsPage()),
              );
            },
          ),
          IconButton(icon: Icon(Icons.download), onPressed: () {}),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ShoppingcartPage()),
          );
        },
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(Icons.shopping_cart),
            if (shoppingCartProvider.countItems > 0)
              Positioned(
                top: -4,
                right: -4,
                child: CircleAvatar(
                  backgroundColor: Colors.red,
                  radius: 9,
                  child: Text(
                    shoppingCartProvider.countItems.toString(),
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      body: Padding(
        padding: EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  category("Phones"),
                  category("Laptops"),
                  category("Watchs"),
                  category("Gaming"),
                  category("Accessoires"),
                ],
              ),
            ),
            SizedBox(height: 10),
            selectedCategory.isNotEmpty
                ? Container(
                    height: 60,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        selectedCategory.isEmpty
                            ? ""
                            : "Résultats de $selectedCategory",
                        style: TextStyle(color: Colors.teal, fontSize: 20),
                      ),
                    ),
                  )
                : SizedBox(height: 10),
            SectionTitle(sectionTtitle: "Produits recommandés"),
            FutureBuilder<List<Product>>(
              future: JsonService.loadProducts(),
              builder: (context, snapshot) {
                final products_s = snapshot.data!;

                return Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    children: products_s.map((p) {
                      return ProductCard(
                        id: '1',
                        name: p.name,
                        description: p.desc,
                        price: p.price,
                        imgPath: p.image,
                      );
                    }).toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
