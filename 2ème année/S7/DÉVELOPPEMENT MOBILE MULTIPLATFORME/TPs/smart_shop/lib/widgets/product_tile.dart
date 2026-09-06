import 'package:flutter/material.dart';

class ProductTile extends StatelessWidget {
  final String name;
  final String price;
  final String imagePath;
  const ProductTile({
    super.key,
    required this.name,
    required this.price,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: Container(
        height: 100,
        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.teal, width: 1.5),
          borderRadius: BorderRadius.circular(10),
          color: Colors.teal.withOpacity(0.05),
        ),
        child: Row(
          crossAxisAlignment:
              CrossAxisAlignment.center, // texte aligné au centre verticalement
          children: [
            // Image du produit
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                imagePath,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),

            // Texte (nom + prix)
            Expanded(
              child: Column(
                mainAxisAlignment:
                    MainAxisAlignment.center, // centré verticalement
                crossAxisAlignment: CrossAxisAlignment.start, // aligné à gauche
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    price,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.teal,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
