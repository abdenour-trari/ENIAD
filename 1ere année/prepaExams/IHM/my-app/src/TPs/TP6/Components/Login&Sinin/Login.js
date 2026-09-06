import "../../CSS/Login&Sinin.css";
import { useState } from "react";
import App from "../Web-Site/App";

const Login = () => {
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const database = [
    { username: "user1", password: "pass1" },
    { username: "user2", password: "pass2" },
  ];

  const errors = {
    uname: "Votre identifiant est incorrect.",
    upass: "Votre mot de passe est incorrect.",
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = database.find(
      (user) => user.username === formData.get("uname")
    );
    if (userData) {
      if (userData.password !== formData.get("upass")) {
        setErrorMessages({ name: "upass", message: errors.upass });
      } else {
        setIsSubmitted(true);
      }
    } else {
      setErrorMessages({ name: "uname", message: errors.uname });
    }
  };

  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  const renderForm = (
    <div className="login-form">
      <div className="title">Connexion</div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label>L'identifiant </label>
            <input type="text" name="uname" required />
            {renderErrorMessage("uname")}
          </div>
          <div className="input-container">
            <label>Mot de passe </label>
            <input type="password" name="upass" required />
            {renderErrorMessage("upass")}
          </div>
          <div className="button-container">
            <input type="submit" value="Se connecter" />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app">
      {isSubmitted ? <App className="C" /> : renderForm}
    </div>
  );
};

export default Login;
