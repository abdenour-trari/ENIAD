import MainNavigation from "./Navbar";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = ["/connexion", "/register", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );

  if (isAuthPage) {
    return <div className="min-h-screen font-sans bg-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen font-sans">
      <MainNavigation>{children}</MainNavigation>
    </div>
  );
}

export default Layout;
