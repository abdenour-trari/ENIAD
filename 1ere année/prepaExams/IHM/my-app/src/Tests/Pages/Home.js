import NavBar from "../NavBar";
import { useEffect, useState } from "react";
import "../Css.css";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.log(error));
  }, []);
  return (
    <>
      <NavBar />
      <div className="productsContainer">
        {products.map((product) => {
          return (
            <div key={product.id} className="productCard">
              <div className="productImage">
                <img src={product.image} alt={product.title} className="Pimg" />
              </div>
              <div className="productDetails">
                <Link to={`/ProductDetails/${product.id}`}>
                  {product.title}
                </Link>
                <span>{product.price} $</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Home;
