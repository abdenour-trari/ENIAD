import Products from "./Products";
import Header from "./Header";
import SearchBar from "./SearchBar";
import { useState } from "react";
import products from "../Data/data";

const App = () => {
  const [productAdded, setProductAdded] = useState(0);
  const handleAdd = () => {
    setProductAdded(productAdded + 1);
  };

  const [inputValue, setInputValue] = useState("");
  const [produits, setProduits] = useState(products);
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(e.target.value);
    setProduits(
      products.filter((p) =>
        p.title.toLowerCase().includes(value.toLowerCase())
      )
    );
  };
  const [linckClicked, setLink] = useState(false);
  const handleAddProduct = () => {
    setLink(true);
  };
  const handleCancel = () => {
    setLink(false);
  };
  const handleAddProductClick = (formData) => {
    products.push(formData);
  };

  return (
    <>
      <Header productAdded={productAdded} />
      <SearchBar handleChange={handleChange} inputValue={inputValue} />
      <Products
        handleAdd={handleAdd}
        inputValue={inputValue}
        produits={produits}
        handleAddProduct={handleAddProduct}
        handleCancel={handleCancel}
        linckClicked={linckClicked}
        handleAddProductClick={handleAddProductClick}
      />
    </>
  );
};

export default App;
