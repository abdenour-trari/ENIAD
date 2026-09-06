import "../CSS/SearchBar.css";

const SearchBar = ({ handleChange, inputValue }) => {
  return (
    <div className="searchBar">
      <input
        type="text"
        value={inputValue}
        placeholder="Rechrcher un produit"
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
