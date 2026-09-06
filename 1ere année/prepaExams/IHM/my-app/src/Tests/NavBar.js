import "./NavBar.css";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <header className="header">
      <div className="logo">Logo</div>
      <div className="Links">
        <span>
          <Link to="/">Home</Link>
        </span>
        <span>
          <Link to="/About">About</Link>
        </span>
        <span>
          <Link to="/Contact">Contact</Link>
        </span>
      </div>
      <div className="panier">🛒</div>
    </header>
  );
};
export default NavBar;
