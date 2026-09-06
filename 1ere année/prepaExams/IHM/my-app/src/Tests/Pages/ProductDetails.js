import NavBar from "../NavBar";
import "../Css.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProducts] = useState(null);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((d) => setProducts(d))
      .catch((e) => console.log(e));
  }, [id]);

  if (!product) return <div>Chargement...</div>;

  return (
    <div>
      <NavBar />
      <div className="details">
        <img src={product.image} alt={product.title} className="img" />
        <div>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>{product.category}</p>
          <span>{product.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
