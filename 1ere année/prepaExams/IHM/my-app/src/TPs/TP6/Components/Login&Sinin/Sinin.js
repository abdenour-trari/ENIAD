import "../../CSS/Login&Sinin.css";
import { useState } from "react";
import App from "../Web-Site/App";

const Sinin = () => {
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passValue, setPassValue] = useState("");

  const database = [
    { id: 1, password: "pass1", ubirth: "10/10/2005", ville: "Casablanca" },
    { id: 2, password: "pass2", ubirth: "10/05/2008", ville: "Rabat" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const uid = formData.get("uid");
    const ubirth = formData.get("ubirth");
    const city = formData.get("city");

    const userData = database.find(
      (user) => parseInt(user.id) === parseInt(uid)
    );

    const hasLetter = /[a-zA-Z]/.test(passValue);
    const hasNumber = /\d/.test(passValue);
    const hasSymbol = /[^a-zA-Z0-9]/.test(passValue);

    // Vérification des champs obligatoires
    if (!uid || !passValue || !ubirth || !city) {
      setErrorMessages({
        name: "champsRequis",
        message: "Tous les champs sont requis !",
      });
    } else if (userData) {
      setErrorMessages({
        name: "uid",
        message: "Identifiant déjà utilisé !",
      });
    } else if (passValue.length < 8) {
      setErrorMessages({
        name: "upass",
        message: "Mot de passe : 8 caractères min",
      });
    } else if (!hasLetter || !hasNumber || !hasSymbol) {
      setErrorMessages({
        name: "upass",
        message: "Doit contenir lettres, chiffres et symboles.",
      });
    } else {
      setErrorMessages({});
      setIsSubmitted(true);
    }
  };

  const errorRender = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  const handleChange = (e) => {
    setPassValue(e.target.value);
  };

  const renderForm = (
    <div className="login-form">
      <div className="title">Inscription {isSubmitted ? "✔️" : ""}</div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          {errorRender("champsRequis")}
          <div className="input-container">
            <label>L'identifiant </label>
            <input type="text" name="uid" />
            {errorRender("uid")}
          </div>
          <div className="input-container">
            <label>Mot de passe </label>
            <input
              type="password"
              value={passValue}
              name="upass"
              onChange={handleChange}
            />
            {errorRender("upass")}
          </div>
          <div className="input-container">
            <label>Date de naissance </label>
            <input type="date" name="ubirth" />
            {errorRender("ubirth")}
          </div>
          <div className="input-container">
            <label>Ville </label>
            <select name="city" defaultValue="">
              <option value="" disabled>
                Choisissez une ville
              </option>
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Berkane">Berkane</option>
              <option value="Agadir">Agadir</option>
              <option value="Tanger">Tanger</option>
              <option value="Fès">Fès</option>
            </select>
          </div>
          <div className="button-container">
            <input type="submit" value="S'inscrire" />
          </div>
        </form>
      </div>
    </div>
  );

  return <div className="app">{isSubmitted ? <App /> : renderForm}</div>;
};

export default Sinin;
