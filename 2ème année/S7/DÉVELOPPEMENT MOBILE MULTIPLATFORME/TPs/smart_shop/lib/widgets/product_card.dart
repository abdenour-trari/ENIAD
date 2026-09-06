import 'package:flutter/material.dart';
import 'package:smart_shop/pages/product_page.dart';
import 'package:smart_shop/widgets/modal_bottom.dart';
import '../pages/history_page.dart';

class ProductCard extends StatelessWidget {
  final String id, imgPath, name, description, price;

  const ProductCard({
    super.key,
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imgPath,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        ModalBottom(
          id: id,
          name: name,
          price: price,
          description: description,
          imgPath: imgPath,
        ).show(context);
      },
      child: Card(
        elevation: 4,
        child: Padding(
          padding: EdgeInsets.all(10),
          child: Column(
            children: [
              Expanded(child: Image.asset(imgPath, fit: BoxFit.contain)),
              SizedBox(height: 10),
              Text(
                name,
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 5),
              Text(
                price + " DH",
                style: TextStyle(fontSize: 17, color: Colors.teal),
              ),
              SizedBox(height: 10),
              ElevatedButton(
                onPressed: () {
                  Log.actions.add("Produit $name consulté");
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ProductPage(
                        id: id,
                        name: name,
                        description: description,
                        price: price,
                        imgPath: imgPath,
                      ),
                    ),
                  );
                },
                child: Text("Détails"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
