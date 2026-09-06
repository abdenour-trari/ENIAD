import 'package:flutter/material.dart';
import 'package:smart_shop/mainscreen.dart';
import 'package:provider/provider.dart';
import './provider/theme_provider.dart';
import './provider/shopping_cart_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => ShoppingCartProvider()),
      ],
      child: SmartShop(),
    ),
  );
}

class SmartShop extends StatelessWidget {
  const SmartShop({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: "Smart Shop App",
          theme: ThemeData.light(),
          darkTheme: ThemeData.dark(),
          themeMode: themeProvider.isDark ? ThemeMode.dark : ThemeMode.light,
          debugShowCheckedModeBanner: false,
          home: const Mainscreen(),
        );
      },
    );
  }
}
