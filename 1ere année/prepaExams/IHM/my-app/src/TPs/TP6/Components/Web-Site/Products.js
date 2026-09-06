import Product from "./Product";
import Search from "./Search";
import "../../CSS/Products.css";

const Products = ({
  produits,
  handleClick,
  productsAddedNumber,
  handleChange,
  searchedproduct,
}) => {
  return (
    <div className="Container">
      <nav className="nav">Quantité Produit : {productsAddedNumber}</nav>
      <Search handleChange={handleChange} searchedproduct={searchedproduct} />
      <div className="cardConntainer">
        {produits.map((product) => {
          return (
            <Product
              key={product.id}
              product={product}
              handleClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Products;
