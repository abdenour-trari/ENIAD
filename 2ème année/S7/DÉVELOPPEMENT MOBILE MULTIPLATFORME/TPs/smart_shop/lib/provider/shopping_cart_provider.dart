import 'package:flutter/material.dart';
import '../widgets/product_card.dart';

class ShoppingCartProvider extends ChangeNotifier {
  final List<ProductCard> _items = [];

  List<ProductCard> get items => _items;

  int get countItems => _items.length;

  double get totalePrice =>
      _items.fold(0, (sum, item) => sum + double.parse(item.price));

  void addTCart(ProductCard item) {
    items.add(item);
    notifyListeners();
  }

  bool verifyAdded(String id) {
    return _items.any((p) => p.id == id) ? true : false;
  }

  void removeFromCart(String id) {
    _items.removeWhere((item) => item.id == id);
    notifyListeners();
  }
}
