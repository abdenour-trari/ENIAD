import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  isLoading = false,
}) => {
  const handleEditorChange = (val: string | undefined) => {
    onChange(val || '');
  };

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono ml-2">
            quiz_questions.py
          </span>
        </div>
        <div className="text-xs text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/40 border border-blue-500/10">
          Python
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          onChange={handleEditorChange}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Chargement de l'éditeur Monaco...
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
};
