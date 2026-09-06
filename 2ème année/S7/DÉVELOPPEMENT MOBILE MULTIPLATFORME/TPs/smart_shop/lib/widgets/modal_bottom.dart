import 'package:flutter/material.dart';
import 'package:smart_shop/pages/product_page.dart';

class ModalBottom {
  final String id, name, price, description, imgPath;
  const ModalBottom({
    required this.id,
    required this.name,
    required this.price,
    required this.description,
    required this.imgPath,
  });

  void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,

            children: [
              Container(
                width: 500,
                height: 2,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(height: 20),
              Image.asset(imgPath, width: 150),
              const SizedBox(height: 15),
              Text(
                name,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 15),
              Text(
                "prix : $price",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
              const SizedBox(height: 30),
              ElevatedButton(
                onPressed: () {
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
                child: const Text("Voir détails"),
              ),
            ],
          ),
        );
      },
    );
  }
}
