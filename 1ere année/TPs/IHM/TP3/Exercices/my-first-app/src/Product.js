import React, { useState } from "react";

const Product = ({ product, setCartCount }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setAdded(true);
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="product-card">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="product-image"
      />
      <h2>{product.title}</h2>
      <p>{product.price}</p>
      {added ? (
        <span className="added-text">Ajouté au panier ✅</span>
      ) : (
        <button onClick={handleAddToCart}>Ajouter au panier</button>
      )}
    </div>
  );
};

export default Product;
