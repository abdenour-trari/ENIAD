class Data {
  final List _products = [
    {
      "id": "1",
      "name": "SmartPhone",
      "description": "Descrption du SmartPhone",
      "price": "1999",
      "imgPath": "assets/products/phone.png",
    },
    {
      "id": "2",
      "name": "SmartWatch",
      "description": "Descrption du SmartWatch",
      "price": "999",
      "imgPath": "assets/products/watch.png",
    },
    {
      "id": "3",
      "name": "LapTop",
      "description": "Descrption du LapTop",
      "price": "8999",
      "imgPath": "assets/products/laptop.png",
    },
  ];

  List get products => _products;
}
