import 'package:flutter/material.dart';
import 'package:smart_shop/widgets/product_tile.dart';
import '../data/data.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController productsController = TextEditingController();
  final productList = Data().products;
  List filtredList = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.teal,
        title: Text("Page Recherche"),
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: productsController,
              decoration: InputDecoration(
                labelText: "Rechecher",
                hintText: "Rechecher un produit ... ",
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  productsController.text.isNotEmpty
                      ? filtredList = productList
                            .where(
                              (p) => p['name'].toLowerCase().contains(
                                value.toString(),
                              ),
                            )
                            .toList()
                      : filtredList = [];
                });
              },
            ),
            SizedBox(height: 20),
            Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                children: filtredList.map((p) {
                  return GestureDetector(
                    child: ProductTile(
                      name: p['name'],
                      price: p['price'],
                      imagePath: p['imgPath'],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
