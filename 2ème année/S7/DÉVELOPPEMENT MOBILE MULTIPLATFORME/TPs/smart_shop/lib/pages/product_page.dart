import 'package:flutter/material.dart';
import 'package:smart_shop/services/db_service.dart';
import 'package:smart_shop/widgets/product_card.dart';
import '../provider/shopping_cart_provider.dart';
import '../pages/history_page.dart';
import 'package:provider/provider.dart';

class ProductPage extends StatefulWidget {
  final String id, name, description, price, imgPath;
  const ProductPage({
    super.key,
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imgPath,
  });

  @override
  State<ProductPage> createState() => _ProductPageState();
}

class _ProductPageState extends State<ProductPage> {
  Color favIconColor = Colors.black;
  @override
  Widget build(BuildContext context) {
    final shoppingCartProvider = Provider.of<ShoppingCartProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.name),
        backgroundColor: Colors.teal,
        leading: IconButton(
          onPressed: () => {Navigator.pop(context)},
          icon: Icon(Icons.arrow_back),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Image.asset(widget.imgPath, width: 260)),
            SizedBox(height: 30),
            Text(
              widget.name,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(widget.description, textAlign: TextAlign.end),
            SizedBox(height: 20),
            Row(
              children: [
                Icon(Icons.star, color: Colors.amber),
                Icon(Icons.star, color: Colors.amber),
                Icon(Icons.star, color: Colors.amber),
                Icon(Icons.star, color: Colors.amber),
                Icon(Icons.star_half, color: Colors.amber),
              ],
            ),

            SizedBox(height: 20),
            IconButton(
              icon: Icon(Icons.favorite_border, color: favIconColor),
              onPressed: () async {
                setState(() {
                  favIconColor = Colors.red;
                });
                await DBService.addFavorite({
                  'id': widget.id,
                  'name': widget.name,
                  'description': widget.description,
                  'price': widget.price,
                  'imgPath': widget.imgPath,
                });

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Ajouté aux favoris")),
                );
              },
            ),
            SizedBox(height: 20),
            Text(
              "Prix : $widget.price  DH",
              style: TextStyle(
                color: Colors.teal,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            Spacer(),

            Center(
              child: ElevatedButton.icon(
                onPressed: () {
                  final isAdded = shoppingCartProvider.verifyAdded(widget.id);
                  if (isAdded) {
                    shoppingCartProvider.removeFromCart(widget.id);
                    Log.actions.add("Produit ${widget.name} retiré du panier");
                  } else {
                    shoppingCartProvider.addTCart(
                      ProductCard(
                        id: widget.id,
                        name: widget.name,
                        description: widget.description,
                        price: widget.price,
                        imgPath: widget.imgPath,
                      ),
                    );
                    Log.actions.add("Produit ${widget.name} ajouté au panier");
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isAdded
                            ? "Produit retiré du panier"
                            : "Produit ajouté au panier",
                      ),
                    ),
                  );
                },
                icon: Icon(
                  shoppingCartProvider.verifyAdded(widget.id)
                      ? Icons.check
                      : Icons.add_shopping_cart,
                ),
                label: Text(
                  shoppingCartProvider.verifyAdded(widget.id)
                      ? "Retirer du panier"
                      : "Ajouter au panier",
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
