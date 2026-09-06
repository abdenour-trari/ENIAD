import "../CSS/Search.css";
import { useState } from "react";

function Search({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState(""); // Valeur de la recherche, initialisée à une chaîne vide

  // Fonction qui se déclenche lors de la saisie dans l'input
  const handleChange = (event) => {
    setSearchTerm(event.target.value); // Mettre à jour la valeur de searchTerm avec ce que l'utilisateur tape
    onSearch(event.target.value); // Transmettre cette valeur au parent
  };
  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search a product"
        className="search-input"
        value={searchTerm} // Afficher la valeur de la recherche dans l'input
        onChange={handleChange} // Déclenche handleChange à chaque saisie
      />
    </div>
  );
}

export default Search;
