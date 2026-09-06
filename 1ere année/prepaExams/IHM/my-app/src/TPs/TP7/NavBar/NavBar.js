import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> <br />
        <Link to="/About">ABOUT</Link> <br />
        <Link to="/Contact">CONTACT</Link> <br />
      </nav>
    </div>
  );
};

export default NavBar;
