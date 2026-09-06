import { useState } from "react";
import Products from "./Products";
import data from "../../Data/data";

const App = () => {
  const [productsAddedNumber, setProductsAddedNumber] = useState(0);

  const handleClick = () => {
    setProductsAddedNumber(productsAddedNumber + 1);
  };

  const [searchedproduct, setSearchedproduct] = useState("");
  const [produits, setProduits] = useState(data);
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchedproduct(e.target.value);
    setProduits(
      data.filter((p) => {
        return p.title.toLowerCase().includes(value.toLowerCase());
      })
    );
  };

  return (
    <div className="C">
      <Products
        produits={produits}
        handleClick={handleClick}
        productsAddedNumber={productsAddedNumber}
        handleChange={handleChange}
        searchedproduct={searchedproduct}
      />
    </div>
  );
};

export default App;
