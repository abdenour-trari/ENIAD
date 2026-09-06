import { useState } from "react";
import GestionLivres from "./GestionLivres";
import dataSource from "./dataL"; // données initiales

const FormInputs = () => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    prix: "",
  });

  const [error, setError] = useState({
    id: "",
    title: "",
    prix: "",
  });

  const [books, setBooks] = useState(dataSource); // état local pour les livres
  const [searchedId, setSearchedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAdd = () => {
    const errors = {};
    const id = formData.id.trim();
    const title = formData.title.trim();
    const prix = formData.prix.trim();
    const verifyId = parseInt(id);
    const verifyPrix = parseFloat(prix);

    if (!id) errors.id = "Obligatoire !";
    else if (isNaN(verifyId)) errors.id = "L'ID doit être un nombre !";
    else if (verifyId < 0) errors.id = "ID négatif !";
    else if (books.some((item) => item.id === verifyId))
      errors.id = "ID existe déjà !";

    if (!title) errors.title = "Obligatoire !";
    if (!prix) errors.prix = "Obligatoire !";
    else if (isNaN(verifyPrix)) errors.prix = "Prix invalide !";
    else if (verifyPrix < 0) errors.prix = "Prix négatif !";

    setError(errors);
    if (Object.keys(errors).length > 0) return;

    setBooks([...books, { id: verifyId, titre: title, prix: verifyPrix }]);
    setFormData({ id: "", title: "", prix: "" });
    setSearchedId(null);
  };

  const handleSearch = () => {
    const idToSearch = parseInt(formData.id);
    const book = books.find((book) => book.id === idToSearch);
    if (book) {
      setSearchedId(book.id);
    } else {
      setError((prev) => ({
        ...prev,
        id: "Aucun livre trouvé avec cet ID.",
      }));
      setSearchedId(null);
    }
  };

  const handleEdit = () => {
    const id = parseInt(formData.id);
    const title = formData.title.trim();
    const prix = parseFloat(formData.prix.trim());

    const index = books.findIndex((book) => book.id === id);
    if (index === -1) {
      setError((prev) => ({
        ...prev,
        id: "ID introuvable pour modification.",
      }));
      return;
    }

    const updatedBooks = [...books];
    if (title) updatedBooks[index].titre = title;
    if (!isNaN(prix)) updatedBooks[index].prix = prix;

    setBooks(updatedBooks);
    setFormData({ id: "", title: "", prix: "" });
    setSearchedId(null);
  };

  return (
    <div>
      <table border={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td>
              <b>Id :</b>
            </td>
            <td>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
              />
              <span>{error.id}</span>
            </td>
          </tr>
          <tr>
            <td>
              <b>Titre :</b>
            </td>
            <td>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              <span>{error.title}</span>
            </td>
          </tr>
          <tr>
            <td>
              <b>Prix :</b>
            </td>
            <td>
              <input
                type="text"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
              />
              <span>{error.prix}</span>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <button onClick={handleAdd}>Envoyer</button>
              <button onClick={handleSearch}>Rechercher</button>
              <button onClick={handleEdit}>Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>

      <GestionLivres data={books} searchedId={searchedId} />
    </div>
  );
};

export default FormInputs;
