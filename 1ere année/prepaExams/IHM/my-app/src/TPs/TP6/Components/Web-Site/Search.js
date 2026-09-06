import "../../CSS/Search.css";

const Search = ({ handleChange, searchedproduct }) => {
  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search a product"
        onChange={handleChange}
        value={searchedproduct}
      />
    </div>
  );
};

export default Search;
