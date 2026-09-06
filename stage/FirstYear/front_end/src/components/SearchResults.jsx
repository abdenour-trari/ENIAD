// src/components/SearchResults.jsx
export default function SearchResults({
  results,
  onClose,
  darkMode,
  isDetailed,
}) {
  if (!results || results.length === 0) return null;

  // Classes dynamiques selon le thème
  const containerClass = `fixed top-20 right-6 w-[28rem] max-h-[70vh] overflow-y-auto 
                          rounded-2xl shadow-2xl z-50 border
                          ${
                            darkMode
                              ? "bg-[#161b22]/90 border-[#30363d]"
                              : "bg-white/90 border-gray-300"
                          } 
                          backdrop-blur-md transition`;
  const headerClass = `flex justify-between items-center px-4 py-3 border-b 
                       ${darkMode ? "border-[#30363d]" : "border-gray-300"}`;
  const titleClass = `${
    darkMode ? "text-gray-200" : "text-gray-800"
  } text-lg font-semibold`;
  const closeBtnClass = `text-gray-400 hover:${
    darkMode ? "text-gray-300" : "text-gray-600"
  } transition`;
  const resultClass = `p-4 cursor-pointer transition group hover:${
    darkMode ? "bg-[#21262d]" : "bg-gray-100"
  }`;
  const categoryTextClass = `${
    darkMode ? "text-gray-200" : "text-gray-800"
  } text-sm font-semibold`;
  const detailedLinkClass = `block`;

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <h2 className={`${titleClass}`}>🔍 Résultats de recherche</h2>
        <button onClick={onClose} className={closeBtnClass}>
          ✖
        </button>
      </div>

      {/* Résultats */}
      <div
        className={`divide-y ${
          darkMode ? "divide-[#30363d]" : "divide-gray-200"
        }`}
      >
        {results.map((item, i) => (
          <div key={i} className={resultClass}>
            {isDetailed ? (
              <a
                href={item.lien}
                target="_blank"
                rel="noopener noreferrer"
                className={detailedLinkClass}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    📄 {item.reference || "N/A"}
                  </span>
                  {item.categorie && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {item.categorie}
                    </span>
                  )}
                </div>
                <p
                  className={`${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  } text-sm font-semibold line-clamp-2`}
                >
                  {item.objet}
                </p>
                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } text-xs mt-1`}
                >
                  🏢 {item.acheteur}
                </p>
                {item.date && (
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-xs`}
                  >
                    🗓 {item.date}
                  </p>
                )}
              </a>
            ) : (
              <p className={categoryTextClass}>📊 {item}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
