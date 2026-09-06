import "../CSS/App.css";
import "../CSS/Card.css";
import { useState } from "react";

function CardItem({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [back, setBack] = useState("transparent");

  const handleClick = () => {
    if (!added) {
      setAdded(true);
      setBack("rgb(189, 189, 189)");
      onAddToCart(); // Appeler la fonction pour ajouter un produit au panier
    } else {
      setAdded(false);
      setBack("transparent");
    }
  };

  return (
    <div className="card">
      <img src={product.thumbnail} alt={product.title} />
      <div className="description">
        <p>{product.title}</p>
        <small>{product.price}</small>
        <button onClick={handleClick} style={{ background: back }}>
          {added ? "Ajouté au panier" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}

function Card({ onAddToCart, products }) {
  return (
    <div className="card-container">
      {products.map((product) => (
        <CardItem
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default Card;
