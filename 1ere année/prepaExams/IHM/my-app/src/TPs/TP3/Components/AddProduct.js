import { useState } from "react";
import "../CSS/AddProduct.css";

const AddProduct = ({ handleCancel, handleAddProductClick }) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    price: "",
    image: "",
  });

  const [error, setError] = useState({
    id: "",
    title: "",
    price: "",
    image: "",
  });

  const handleChangeData = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, image: imageUrl });
        setError({ ...error, image: "" });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setError({ ...error, [name]: "" });
    }
  };

  const addProducthandling = () => {
    const newError = {
      id: formData.id ? "" : "Le champ id est requis",
      title: formData.title ? "" : "Le champ titre est requis",
      price:
        formData.price && formData.price > 0 ? "" : "Le champ prix est requis",
      image: formData.image ? "" : "L'image est requise",
    };

    if (newError.id || newError.title || newError.price || newError.image) {
      setError(newError);
      return;
    }

    // Appel du parent pour ajouter le produit
    handleAddProductClick(formData);

    // Réinitialisation
    setFormData({ id: "", title: "", price: "", image: "" });
    setError({ id: "", title: "", price: "", image: "" });

    // Fermeture du formulaire
    handleCancel();
  };

  return (
    <div className="addProduct">
      <div className="cancel" onClick={handleCancel}>
        X
      </div>
      <div className="card">
        <h3>Ajouter un produit</h3>

        <input
          type="text"
          name="id"
          value={formData.id}
          placeholder="Id : "
          onChange={handleChangeData}
        />
        <span className="error">{error.id}</span>

        <input
          type="text"
          name="title"
          value={formData.title}
          placeholder="Titre : "
          onChange={handleChangeData}
        />
        <span className="error">{error.title}</span>

        <input
          type="text"
          name="price"
          value={formData.price}
          placeholder="Prix : "
          onChange={handleChangeData}
        />
        <span className="error">{error.price}</span>

        <input type="file" name="image" onChange={handleChangeData} />
        <span className="error">{error.image}</span>

        {formData.image && (
          <img
            src={formData.image}
            alt="Aperçu"
            style={{ maxWidth: "100px", marginTop: "10px" }}
          />
        )}

        <button onClick={addProducthandling}>Ajouter</button>
      </div>
    </div>
  );
};

export default AddProduct;
