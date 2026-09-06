// src/components/NavBar.jsx
import { useState } from "react";
import { Menu, X, Search, Sun, Moon } from "lucide-react";
import logo from "../logo.png";
import { Link } from "react-router-dom";

export default function Navbar({
  darkMode,
  setDarkMode,
  setSearchQuery,
  openChat,
  openAdvancedSearch,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    setSearchQuery(searchText);
  };

  return (
    <nav className={`bg-[#0d1117] border-b border-[#30363d] text-gray-200`}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Logo"
              className="h-15 w-auto object-contain rounded-md shadow-md hover:opacity-90 transition duration-300"
            />
          </Link>

          {/* Search input (hidden on mobile, shown on md+) */}
          <div className="hidden sm:block relative">
            <input
              type="text"
              placeholder="Recherche..."
              className="bg-[#161b22] border border-[#30363d] w-[250px] h-[40px] rounded-md pl-8 pr-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              className="w-4 h-4 text-gray-400 absolute left-2 top-3 cursor-pointer"
              onClick={handleSearch}
            />
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <button
                className="w-[140px] text-white px-3 py-1 rounded
              bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 
              transition duration-300 shadow-md cursor-pointer"
              >
                Accueil
              </button>
            </Link>
            <button
              onClick={openChat || undefined}
              disabled={!openChat}
              className="text-white px-3 py-1 rounded
              bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 
              transition duration-300 shadow-md cursor-pointer"
            >
              Demander au Chat
            </button>
            <button
              onClick={openAdvancedSearch}
              className="text-white px-3 py-1 rounded
              bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 
              transition duration-300 shadow-md cursor-pointer"
            >
              Recherche Avancée
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="ml-2 p-1 rounded hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-200" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0d1117] border-t border-[#30363d] p-4 space-y-3">
          {/* Search input mobile */}
          <div className="relative">
            <input
              type="text"
              placeholder="Recherche..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              className="w-4 h-4 text-gray-400 absolute left-2 top-3 cursor-pointer"
              onClick={handleSearch}
            />
          </div>

          {/* Actions */}
          <button
            className="w-full bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600  text-sm"
          >
            Accueil
          </button>
          <button
            onClick={openChat}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600  text-sm"
          >
            💬 Chat
          </button>
          <button
            onClick={openAdvancedSearch}
            className="w-full bg-sky-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600  text-sm"
          >
            🔍 Recherche Avancée
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5 text-yellow-400 mr-2" /> Mode clair
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-gray-200 mr-2" /> Mode sombre
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
