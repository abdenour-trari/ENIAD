import React from "react";
import Product from "./Product";

const Products = ({ products, setCartCount }) => {
  return (
    <div className="products-container">
      {products.map((product) => (
        <Product
          key={product.id}
          product={product}
          setCartCount={setCartCount}
        />
      ))}
    </div>
  );
};

export default Products;
