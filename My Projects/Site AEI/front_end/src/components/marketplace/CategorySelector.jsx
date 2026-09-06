import { Laptop, Smartphone, Headphones, Sofa, BookOpen, Shirt, Box } from "lucide-react";

export function CategorySelector({ category, onChange }) {
  const categoriesList = [
    { id: "Informatique", label: "Informatique", icon: Laptop },
    { id: "Téléphone", label: "Téléphone", icon: Smartphone },
    { id: "Accessoires", label: "Accessoires", icon: Headphones },
    { id: "Mobilier", label: "Mobilier", icon: Sofa },
    { id: "Livres", label: "Livres & Études", icon: BookOpen },
    { id: "Vêtements", label: "Vêtements", icon: Shirt },
    { id: "Autres", label: "Autres objets", icon: Box }
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
        Catégorie
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          const isSelected = category === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all cursor-pointer font-bold text-xs gap-3 ${
                isSelected
                  ? "border-pink-500 bg-pink-50/30 text-pink-650 ring-2 ring-pink-500/20"
                  : "border-slate-200 hover:border-pink-400 hover:bg-slate-50/50 text-slate-700"
              }`}
            >
              <div className={`p-3 rounded-2xl ${
                isSelected ? "bg-pink-100/50 text-pink-600" : "bg-slate-50 text-slate-500 group-hover:text-pink-500"
              }`}>
                <Icon size={20} />
              </div>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
