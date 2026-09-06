import { useState } from "react";
import "../CSS/App.css";
import Livres from "../Data/data";

const App = () => {
  const [data, setData] = useState(Livres);
  const [formData, setFormData] = useState({
    id: "",
    titre: "",
    prix: "",
  });
  const [error, setError] = useState({
    id: "",
    titre: "",
    prix: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleClick() {
    const { id, titre, prix } = formData;
    const newError = { id: "", titre: "", prix: "" };
    let isValid = true;

    // Validation ID
    if (!id) {
      newError.id = "Le champ id est requis";
      isValid = false;
    } else if (!/^\d+$/.test(id)) {
      newError.id = "L'id doit être un entier";
      isValid = false;
    } else if (parseInt(id) <= 0) {
      newError.id = "L'id doit être supérieur à zéro";
      isValid = false;
    } else if (data.some((livre) => parseInt(livre.id) === parseInt(id))) {
      newError.id = "Cet id existe déjà";
      isValid = false;
    }

    // Validation Titre
    if (!titre.trim()) {
      newError.titre = "Le champ titre est requis";
      isValid = false;
    }

    // Validation Prix
    if (!prix) {
      newError.prix = "Le champ prix est requis";
      isValid = false;
    } else if (isNaN(parseFloat(prix))) {
      newError.prix = "Le prix doit être un nombre";
      isValid = false;
    } else if (parseFloat(prix) <= 0) {
      newError.prix = "Le prix doit être supérieur à zéro";
      isValid = false;
    }

    setError(newError);

    if (!isValid) return;

    // Ajout du livre
    setData([
      ...data,
      { id: parseInt(id), titre: titre.trim(), prix: parseFloat(prix) },
    ]);
    setFormData({ id: "", titre: "", prix: "" });
  }

  function handleDelete(bookClicked) {
    const confirme = window.confirm(
      "Voulez-vous vraiment supprimer ce livre ?"
    );
    if (confirme) {
      setData(data.filter((e) => e.id !== bookClicked.id));
    }
  }

  // handleSearch

  const [idTrouve, setId] = useState(null);

  function handleSearch() {
    const id = parseInt(formData.id);

    if (!id || isNaN(id)) {
      return;
    }

    const livreT = data.find((b) => b.id === id);

    if (livreT) {
      setId(livreT.id);
    } else {
      setId(null);
      setError({ id: "Id non trouvé", titre: "", prix: "" });
    }
  }

  function handleEdite() {
    const { id, titre, prix } = formData;
    const newError = { id: "", prix: "" };
    const livreT = data.find((b) => b.id === parseInt(id));

    // Validation ID
    if (!id || isNaN(parseInt(id))) {
      newError.id = "Le champ id est requis";
      setError(newError);
      return;
    } else if (!livreT) {
      newError.id = "Id n'existe pas";
      setError(newError);
      return;
    }

    // Validation Prix
    if (isNaN(parseFloat(prix))) {
      newError.prix = "Le prix doit être un nombre";
      setError(newError);
      return;
    } else if (parseFloat(prix) <= 0) {
      newError.prix = "Le prix doit être positif";
      setError(newError);
      return;
    }

    // Réinitialiser les erreurs
    setError({ id: "", prix: "" });

    // Mise à jour de la liste
    const dataEdited = data.map((b) =>
      b.id === parseInt(id)
        ? {
            ...b,
            titre: titre ? titre.trim() : b.titre,
            prix: parseFloat(prix),
          }
        : b
    );

    setData(dataEdited);
    setFormData({ id: "", titre: "", prix: "" });
  }

  // Affichage des livres à partir de `data`
  const books = data.map((b) => (
    <tr
      key={b.id}
      style={{ backgroundColor: b.id === idTrouve ? "lightgreen" : "" }}
    >
      <td>{b.id}</td>
      <td>{b.titre}</td>
      <td>{b.prix}</td>
      <td>
        <button onClick={() => handleDelete(b)}>Supprimer</button>
      </td>
    </tr>
  ));

  const [currentIndex, setCurrentIndex] = useState(0);

  function goToFirst() {
    setCurrentIndex(0);
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
  }

  function goToLast() {
    setCurrentIndex(data.length - 1);
  }

  return (
    <div className="addProduct">
      <div className="card">
        <h3>Ajouter un livre</h3>

        <input
          type="text"
          name="id"
          value={formData.id}
          placeholder="Id : "
          onChange={handleChange}
        />
        <span className="error">{error.id}</span>

        <input
          type="text"
          name="titre"
          value={formData.titre}
          placeholder="Titre : "
          onChange={handleChange}
        />
        <span className="error">{error.titre}</span>

        <input
          type="text"
          name="prix"
          value={formData.prix}
          placeholder="Prix : "
          onChange={handleChange}
        />
        <span className="error">{error.prix}</span>

        <button onClick={handleClick}>Ajouter</button>
        <button onClick={handleSearch}>Rechrcher</button>
        <button onClick={handleEdite}>Modifier</button>
      </div>

      <div className="books">
        <table border={0} cellSpacing={0} cellPadding="15px">
          <thead>
            <th>Id</th>
            <th>Titre</th>
            <th>Prix</th>
            <th></th>
          </thead>
          {books}
        </table>
      </div>
      <div className="carousel">
        {data.length > 0 && (
          <div className="bookCard">
            <b>id : {data[currentIndex].id}</b>
            <b>Titre : {data[currentIndex].titre}</b>
            <b>Prix : {data[currentIndex].prix}</b>
          </div>
        )}

        <div className="buttons">
          <button onClick={goToFirst}>Premier</button>
          <button onClick={goToPrevious}>Précédent</button>
          <button onClick={goToNext}>Suivant</button>
          <button onClick={goToLast}>Dernier</button>
        </div>
      </div>
    </div>
  );
};

export default App;
