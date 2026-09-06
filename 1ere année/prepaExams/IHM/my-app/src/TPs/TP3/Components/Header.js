import "../CSS/Header.css";

const Header = ({ productAdded }) => {
  return (
    <nav className="header">
      <img src="sdvcsdv" alt="logo" />
      <div className="links">
        <a href="link1">Home</a>
        <a href="link2">Products</a>
        <a href="link3">Contact</a>
        <a href="link4">About us</a>
      </div>

      <div className="panier">
        🛒<span>{productAdded}</span>
      </div>
    </nav>
  );
};

export default Header;
