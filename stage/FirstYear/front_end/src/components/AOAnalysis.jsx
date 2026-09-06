// src/components/AOAnalysis.jsx
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./NavBar";
import * as docx from "docx";
import { saveAs } from "file-saver";

// ======================
// Modal de réponse étape par étape
// ======================
const ResponseModal = ({
  aoResponse,
  darkMode,
  loading,
  onClose,
  currentStep,
  nextStep,
  regenerateStep,
  allResponses,
  regeneratePrompt,
  setRegeneratePrompt,
  showRegenerateInput,
  setShowRegenerateInput,
  steps, // 🔹 pour détecter la dernière étape
}) => {
  const generateWordFile = (currentStep) => {
    const titleStyle = {
      bold: true,
      color: "1E40AF",
      size: 32,
      font: "Calibri",
    };

    const normalText = {
      size: 24,
      font: "Calibri",
    };

    const children = [];

    // 🧱 Page de garde
    children.push(
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
          new docx.TextRun({
            text: "HOLOKIA",
            bold: true,
            size: 48,
            color: "2563EB",
            font: "Calibri",
          }),
        ],
        spacing: { after: 400 },
      }),
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
          new docx.TextRun({
            text: `Rapport de réponse de l’appel d’offres ${currentStep.reference}`,
            bold: true,
            size: 36,
            color: "1E3A8A",
            font: "Calibri",
          }),
        ],
        spacing: { after: 400 },
      }),
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
          new docx.TextRun({
            text: `Date : ${new Date().toLocaleDateString()}`,
            size: 22,
            color: "6B7280",
            font: "Calibri",
          }),
        ],
        spacing: { after: 800 },
      }),
      new docx.Paragraph({ text: "" })
    );

    // 📄 Contenu des sections
    allResponses.forEach((resp) => {
      // === TITRE DE SECTION ===
      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: resp.step.toUpperCase(),
              ...titleStyle,
            }),
          ],
          spacing: { after: 300 },
        })
      );

      // === TEXTE ===
      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text:
                (resp.response && resp.response.texte) ||
                (typeof resp.response === "string"
                  ? resp.response
                  : "Aucune réponse disponible."),
              ...normalText,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      // === TABLEAU (si disponible) ===
      if (
        resp.response &&
        resp.response.tableau &&
        resp.response.tableau.length > 0
      ) {
        const firstRow = Object.keys(resp.response.tableau[0]);

        // 🔹 Header stylé
        const header = new docx.TableRow({
          children: firstRow.map(
            (col) =>
              new docx.TableCell({
                shading: { fill: "D1D5DB" }, // gris clair
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                children: [
                  new docx.Paragraph({
                    text: col,
                    bold: true,
                    alignment: docx.AlignmentType.CENTER,
                  }),
                ],
                borders: {
                  top: {
                    style: docx.BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  bottom: {
                    style: docx.BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: {
                    style: docx.BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  right: {
                    style: docx.BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
              })
          ),
        });

        // 🔹 Lignes du tableau
        const rows = resp.response.tableau.map(
          (row, i) =>
            new docx.TableRow({
              children: firstRow.map(
                (key) =>
                  new docx.TableCell({
                    shading: { fill: i % 2 === 0 ? "FFFFFF" : "F9FAFB" }, // alternance blanc / gris clair
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new docx.Paragraph({
                        text: String(row[key]),
                        alignment: docx.AlignmentType.LEFT,
                      }),
                    ],
                    borders: {
                      top: {
                        style: docx.BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      bottom: {
                        style: docx.BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      left: {
                        style: docx.BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      right: {
                        style: docx.BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                    },
                  })
              ),
            })
        );

        children.push(
          new docx.Table({
            rows: [header, ...rows],
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            borders: {
              top: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
              left: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
              right: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
              insideHorizontal: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
              insideVertical: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
            },
          })
        );

        children.push(new docx.Paragraph({ text: "" }));
      }

      children.push(new docx.Paragraph({ text: "" }));
    });

    // 📘 Création du document final
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Réponse_AO.docx");
    });
  };

  const isLastStep = currentStep === steps[steps.length - 1];

  return (
    <div className="bg fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/40">
      <div
        className={`relative w-full max-w-full sm:max-w-[600px] md:max-w-[800px] xl:max-w-[1000px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl transition-all duration-300 transform ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* ❌ Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold hover:text-red-500 transition"
        >
          ✖
        </button>

        {/* 🧠 Titre */}
        <h3
          className={`text-xl sm:text-2xl font-bold mb-4 text-center ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          {loading
            ? "Génération en cours..."
            : `${
                (currentStep !== "intro"
                  ? currentStep.charAt(0).toUpperCase() + currentStep.slice(1)
                  : (currentStep = "introduction"),
                currentStep.charAt(0).toUpperCase() + currentStep.slice(1))
              } générée`}
        </h3>

        {/* 💫 Zone de chargement */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Veuillez patienter...</p>
          </div>
        ) : (
          <>
            {aoResponse && typeof aoResponse === "object" ? (
              <>
                <p className="whitespace-pre-wrap leading-relaxed text-justify text-sm sm:text-base">
                  {aoResponse.texte}
                </p>

                {aoResponse.tableau && aoResponse.tableau.length > 0 && (
                  <table className="mt-4 w-full border border-gray-400 text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                      <tr>
                        {Object.keys(aoResponse.tableau[0]).map((col) => (
                          <th key={col} className="border px-2 py-1 text-left">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aoResponse.tableau.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="border px-2 py-1">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <pre className="whitespace-pre-wrap leading-relaxed text-justify text-sm sm:text-base">
                {aoResponse || "Aucune réponse générée pour cette étape."}
              </pre>
            )}
          </>
        )}

        {/* 🧩 Zone d’actions */}
        {!loading && (
          <div className="mt-6 flex flex-col gap-4">
            <span className="text-sm text-gray-400">
              Étape : {currentStep.toUpperCase()}
            </span>

            {/* Boutons principaux */}
            <div className="flex flex-wrap gap-3">
              {!showRegenerateInput && (
                <button
                  onClick={() => setShowRegenerateInput(true)}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-400 transition flex-1 sm:flex-auto"
                >
                  🔄 Régénérer
                </button>
              )}

              {currentStep === "conclusion" && (
                <button
                  onClick={generateWordFile}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition flex-1 sm:flex-auto"
                >
                  📄 Générer un fichier Word
                </button>
              )}

              {!isLastStep && nextStep && (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition flex-1 sm:flex-auto"
                >
                  Étape suivante →
                </button>
              )}
            </div>

            {/* Zone de régénération animée */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showRegenerateInput
                  ? "max-h-64 opacity-100 mt-3"
                  : "max-h-0 opacity-0"
              }`}
            >
              {showRegenerateInput && (
                <div
                  className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl p-4 flex flex-col gap-3`}
                >
                  <textarea
                    value={regeneratePrompt}
                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                    placeholder="Précisez ce que vous voulez améliorer..."
                    className="w-full p-2 border rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 resize-none focus:ring-2 focus:ring-yellow-400 transition"
                    rows={3}
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowRegenerateInput(false)}
                      className="px-3 py-1 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition flex-1 sm:flex-auto"
                    >
                      ❌ Annuler
                    </button>
                    <button
                      onClick={() => {
                        regenerateStep(currentStep);
                        setShowRegenerateInput(false);
                      }}
                      className="px-4 py-1 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-500 transition flex-1 sm:flex-auto"
                    >
                      ✅ Régénérer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ======================
// Page principale AOAnalysis
// ======================
export default function AOAnalysis() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const { objet, lien, reference } = location.state || {};

  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);

  const [responseLoading, setResponseLoading] = useState(false);
  const [aoResponse, setAoResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);

  const steps = [
    "intro",
    "methodologie",
    "finance",
    "valeur",
    "risques",
    "conclusion",
  ];
  const [currentStep, setCurrentStep] = useState(steps[0]);

  const [allResponses, setAllResponses] = useState([]);

  // ======================
  // Charger l'analyse de l'AO
  // ======================
  useEffect(() => {
    if (!lien) return;
    setLoading(true);

    fetch("http://localhost:5000/analysis-ao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: lien, objet, reference }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          data.success &&
          Array.isArray(data.data) &&
          data.data.length > 0 &&
          data.data[0].summary
        ) {
          const cleaned = data.data[0].summary
            .replace(/\*\*/g, "")
            .split(/\n(?=\d+\s*-\s*)/);
          const phases = cleaned.map((section, index) => ({
            filename: `Phase ${index + 1}`,
            summary: section.trim(),
          }));
          setAnalysis(phases);
        } else {
          setAnalysis([
            {
              filename: "Erreur",
              summary: data.error || "Aucune donnée reçue",
            },
          ]);
        }
      })
      .catch((err) =>
        setAnalysis([{ filename: "Erreur réseau", summary: err.toString() }])
      )
      .finally(() => setLoading(false));
  }, [lien]);

  // ======================
  // Générer la réponse pour une étape
  // ======================
  const generateResponse = (step = "intro") => {
    setCurrentStep(step);
    setResponseLoading(true);
    setAoResponse(null);
    setShowResponseModal(true);

    fetch("http://localhost:5000/generate-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objet, analysis, step, reference }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAoResponse(data.response);
          setAllResponses((prev) => [
            ...prev.filter((r) => r.step !== step),
            { step, response: data.response },
          ]);
        } else {
          setAoResponse("❌ Erreur : " + data.error);
        }
      })
      .catch((err) => setAoResponse("❌ Erreur rése au : " + err.toString()))
      .finally(() => setResponseLoading(false));
  };

  // ======================
  // Régénérer l'étape actuelle
  // ======================
  const regenerateStep = (step) => {
    setResponseLoading(true);
    setAoResponse(null);
    setShowRegenerateInput(false);

    fetch("http://localhost:5000/generate-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objet,
        analysis,
        step,
        reference,
        force: true,
        customPrompt: regeneratePrompt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAoResponse(data.response);
        else setAoResponse("❌ Erreur : " + data.error);
      })
      .catch((err) => setAoResponse("❌ Erreur réseau : " + err.toString()))
      .finally(() => setResponseLoading(false));
  };

  // ======================
  // Étape suivante
  // ======================
  const handleNextStep = () => {
    const index = steps.indexOf(currentStep);
    if (index < steps.length - 1) {
      const next = steps[index + 1];
      setCurrentStep(next);
      generateResponse(next);
    } else {
      setShowResponseModal(false);
    }
  };

  return (
    <>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openChat={() => {}}
        openAdvancedSearch={() => {}}
      />

      <div
        className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
          darkMode ? "bg-[#0d1117] text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        {loading ? (
          <div className="text-center text-lg text-gray-500 animate-pulse">
            ⏳ Analyse en cours...
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
              Analyse de l'appel d'offre
            </h2>
            <p className="mb-6 text-center">
              <a
                href={lien}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium underline ${
                  darkMode
                    ? "text-blue-300 hover:text-blue-400"
                    : "text-blue-700 hover:text-blue-900"
                }`}
              >
                Voir l'appel d'offre original
              </a>
            </p>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-1">
              {analysis.map((doc, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl ${
                    darkMode
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        darkMode
                          ? "bg-blue-900 text-blue-300"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <h3
                      className={`font-bold text-lg sm:text-xl tracking-wide ${
                        darkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {doc.filename}
                    </h3>
                  </div>
                  <p
                    className={`whitespace-pre-wrap leading-relaxed text-justify text-sm sm:text-base ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {doc.summary}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => generateResponse("intro")}
              disabled={responseLoading}
              className={`px-6 py-3 m-2 rounded-xl font-semibold shadow transition flex items-center justify-center gap-2 mx-auto ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } ${responseLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {responseLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {responseLoading ? "Génération..." : "📝 Générer une réponse"}
            </button>
          </div>
        )}
      </div>

      {showResponseModal && (
        <ResponseModal
          aoResponse={aoResponse}
          darkMode={darkMode}
          loading={responseLoading}
          onClose={() => {
            setShowResponseModal(false);
            setCurrentStep(steps[0]);
            setAoResponse(null);
            setRegeneratePrompt("");
            setShowRegenerateInput(false);
          }}
          currentStep={currentStep}
          nextStep={handleNextStep}
          regenerateStep={regenerateStep}
          allResponses={allResponses}
          regeneratePrompt={regeneratePrompt}
          setRegeneratePrompt={setRegeneratePrompt}
          showRegenerateInput={showRegenerateInput}
          setShowRegenerateInput={setShowRegenerateInput}
          steps={steps}
        />
      )}
    </>
  );
}
