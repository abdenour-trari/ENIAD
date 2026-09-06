import { useState } from "react";
import "../CSS/Product.css";

const Button = ({ handleAdd }) => {
  const [clicked, setClicked] = useState("Ajouter au panier");
  const handleClick = () => {
    setClicked("Produit ajouté");
    handleAdd();
  };
  return <button onClick={handleClick}>{clicked}</button>;
};

const Product = ({ product, handleAdd }) => {
  return (
    <div className="productCard" key={product.id}>
      <img src={product.thumbnail} alt="ProductImage" />
      <div className="productInfos">
        <b>{product.title}</b>
        <b>{product.price}</b>
        <Button handleAdd={handleAdd} />
      </div>
    </div>
  );
};

export default Product;
