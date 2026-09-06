import { useState } from "react";
import "../../CSS/Product.css";

const Product = ({ product, handleClick }) => {
  const [addToBasket, setAddToBasket] = useState("Ajouter au panier");

  const handleClickBtn = () => {
    setAddToBasket("Ajouté au panier");
    if (addToBasket !== "Ajouté au panier") {
      handleClick();
    }
  };
  return (
    <div className="productCard">
      <div className="productImage">
        <img src={product.thumbnail} alt="productImage" />
      </div>
      <div className="productDetail">
        <b>{product.title}</b>
        <span>{product.price}</span>
        <button onClick={handleClickBtn}>{addToBasket}</button>
      </div>
    </div>
  );
};

export default Product;
