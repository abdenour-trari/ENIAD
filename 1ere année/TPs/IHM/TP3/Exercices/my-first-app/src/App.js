import React, { useState } from "react";
import "./index.css";
import Products from "./Products";

const productsData = [
  {
    id: 1,
    title: "PC Portable Gamer HP VICTUS",
    price: "7490 DH",
    thumbnail: "/images/HP14424U3EA.jpg",
  },
  {
    id: 2,
    title: "PC Portable Gamer HP VICTUS",
    price: "2190 DH",
    thumbnail: "images/HP14424U3EA.jpg",
  },
  {
    id: 3,
    title: "Pc Portable Chromebook Acer",
    price: "3640 DH",
    thumbnail: "images/NXATHEF002.jpg",
  },
  {
    id: 4,
    title: "PC Portable - HUAWEI",
    price: "1270 DH",
    thumbnail: "images/HUA6901443442959.jpg",
  },
];

function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Boutique en ligne</h1>
        <p>🛒 Produits dans le panier : {cartCount}</p>
      </header>

      <Products products={productsData} setCartCount={setCartCount} />
    </div>
  );
}

export default App;
