import ProductCard from "./Product";
import "../CSS/Products.css";
import AddProduct from "./AddProduct";

const Products = ({
  handleAdd,
  inputValue,
  produits,
  linckClicked,
  handleAddProduct,
  handleCancel,
  handleAddProductClick,
}) => {
  return (
    <div className="productConatainer">
      <button className="addp" onClick={handleAddProduct}>
        Add Product
      </button>
      <p>{inputValue}</p>
      <div className="products">
        {produits.map((product) => {
          return (
            <ProductCard
              key={product.id}
              product={product}
              handleAdd={handleAdd}
            />
          );
        })}
      </div>
      {linckClicked && (
        <AddProduct
          handleCancel={handleCancel}
          handleAddProductClick={handleAddProductClick}
        />
      )}
    </div>
  );
};

export default Products;
