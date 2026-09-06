import 'package:flutter/services.dart';
import 'dart:convert';
import '../models/product.dart';

class JsonService {
  static Future<List<Product>> loadProducts() async {
    final String jsonString = await rootBundle.loadString(
      'assets/products.json',
    );
    final List data = json.decode(jsonString);
    return data.map((e) => Product.fromJson(e)).toList();
  }
}
