import "../CSS/Header.css";
import Notification from "./Notification";

function Header({ addedProducts }) {
  return (
    <div className="header">
      <a href="/produits" className="logo">
        <img src="#" alt="logo" className="logo-image" />
      </a>

      <div className="links">
        <a href="/produits">Home</a>
        <a href="/produits">Contact</a>
        <a href="/produits">About Us</a>
      </div>

      <div className="Panier">
        🛒 <Notification addedProducts={addedProducts} />
      </div>
    </div>
  );
}

export default Header;
