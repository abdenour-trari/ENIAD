import React, { useState } from "react";
import { Bold, Italic, Heading, Code, Link, List, Eye, Edit2, Sparkles } from "lucide-react";

// Robust client-side markdown compiler
export function parseMarkdown(md) {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (e.g. ### Title)
  html = html.replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-semibold text-slate-500 mt-2 mb-1">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-semibold text-slate-600 mt-2 mb-1">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-semibold text-slate-700 mt-3 mb-2">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2 border-b border-slate-100 pb-1">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-extrabold text-slate-850 mt-6 mb-3 border-b border-slate-100 pb-1">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-950">$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-700">$1</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600 text-sm font-mono">$1</code>');

  // Block Code (```lang ... ```)
  html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, '<pre class="bg-slate-900 border border-slate-800 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm text-neutral-200"><code>$1</code></pre>');

  // Unordered list items (- item or * item)
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');

  // Ordered list items (1. item)
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal text-slate-700 my-1">$1</li>');

  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline hover:text-blue-500 transition-colors">$1</a>');

  // Blockquotes (> text)
  html = html.replace(/^>\s+(.*?)$/gm, '<blockquote class="border-l-4 border-slate-350 pl-4 py-1 italic my-3 text-slate-550">$1</blockquote>');

  // Paragraphs - split by double newlines and wrap in p if not already blocks
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<pre") || trimmed.startsWith("<li") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<a") || trimmed.startsWith("<code")) {
      return trimmed;
    }
    return `<p class="text-slate-700 leading-relaxed my-2">${trimmed}</p>`;
  }).join("\n");

  return html;
}

export default function MarkdownEditor({ value, onChange, onAiGenerate, isGeneratingAi }) {
  const [activeTab, setActiveTab] = useState("edit"); // edit, preview, split

  const insertText = (before, after = "") => {
    const textarea = document.getElementById("markdown-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + (selected || "texte") + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Refocus textarea after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || "texte").length);
    }, 0);
  };

  return (
    <div className="w-full border border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col min-h-[400px] shadow-xs">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200/80 gap-2">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertText("### ")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Titre"
          >
            <Heading size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertText("**", "**")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Gras"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertText("*", "*")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Italique"
          >
            <Italic size={16} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <button
            type="button"
            onClick={() => insertText("- ")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Liste"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertText("`", "`")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Code en ligne"
          >
            <Code size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertText("```javascript\n", "\n```")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Bloc de code"
          >
            <span className="font-mono text-xs font-bold">{"{}"}</span>
          </button>
          <button
            type="button"
            onClick={() => insertText("[", "](url)")}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Lien"
          >
            <Link size={16} />
          </button>

          {onAiGenerate && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button
                type="button"
                onClick={onAiGenerate}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Générer avec l'IA"
              >
                <Sparkles size={13} className={isGeneratingAi ? "animate-pulse" : ""} />
                <span>{isGeneratingAi ? "Génération..." : "Aide IA"}</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "edit"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit2 size={12} />
            <span>Éditeur</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye size={12} />
            <span>Aperçu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`hidden md:flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "split"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Côte à côte</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex min-h-[350px]">
        {/* Edit Pane */}
        {(activeTab === "edit" || activeTab === "split") && (
          <textarea
            id="markdown-textarea"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Saisissez votre README au format Markdown. Utilisez la barre d'outils ou l'IA pour démarrer..."
            className={`flex-1 p-4 bg-transparent outline-none border-none resize-none font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:ring-0 ${
              activeTab === "split" ? "border-r border-slate-250" : ""
            }`}
          />
        )}

        {/* Preview Pane */}
        {(activeTab === "preview" || activeTab === "split") && (
          <div
            className="flex-1 p-4 overflow-y-auto max-h-[500px] bg-slate-50/50 text-slate-800 prose prose-slate max-w-none scrollbar-thin select-text"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) || `<p class="text-slate-400 italic">Rien à afficher pour le moment. Rédigez du contenu pour voir l'aperçu.</p>` }}
          />
        )}
      </div>
    </div>
  );
}
