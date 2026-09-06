import { DollarSign, RefreshCw, Gift } from "lucide-react";

export function PriceInput({ price, isNegotiable, transactionType, onChange }) {
  const handleTypeChange = (type) => {
    onChange({
      transactionType: type,
      price: type === "vente" ? price : "0",
      isNegotiable: type === "vente" ? isNegotiable : false
    });
  };

  return (
    <div className="space-y-6">
      {/* Transaction Type Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Type de transaction
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "vente", label: "Vente", icon: DollarSign, color: "hover:border-emerald-500 hover:bg-emerald-50/10 active:bg-emerald-500/10 border-slate-200 text-slate-700" },
            { id: "échange", label: "Échange", icon: RefreshCw, color: "hover:border-sky-500 hover:bg-sky-50/10 active:bg-sky-500/10 border-slate-200 text-slate-700" },
            { id: "gratuit", label: "Gratuit", icon: Gift, color: "hover:border-purple-500 hover:bg-purple-50/10 active:bg-purple-500/10 border-slate-200 text-slate-700" }
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = transactionType === type.id;
            let activeColor = "";
            if (isSelected) {
              if (type.id === "vente") activeColor = "border-emerald-500 bg-emerald-50/30 text-emerald-700 ring-2 ring-emerald-500/20";
              else if (type.id === "échange") activeColor = "border-sky-500 bg-sky-50/30 text-sky-700 ring-2 ring-sky-500/20";
              else if (type.id === "gratuit") activeColor = "border-purple-500 bg-purple-50/30 text-purple-700 ring-2 ring-purple-500/20";
            }

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold text-sm ${
                  isSelected ? activeColor : type.color
                }`}
              >
                <Icon size={20} className="mb-2" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Price Fields */}
      {transactionType === "vente" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Prix de vente
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={price === "0" ? "" : price}
                onChange={(e) => onChange({ price: e.target.value })}
                className="w-full border border-slate-200 pl-4 pr-14 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-extrabold text-lg outline-none transition"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                DH
              </div>
            </div>
          </div>

          {/* Negotiable Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700">Prix négociable</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Cochez cette option si vous êtes ouvert aux propositions
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => onChange({ isNegotiable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      )}

      {transactionType === "échange" && (
        <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-100/50 flex items-start gap-3.5 animate-fadeIn">
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-xs">
            <RefreshCw size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-900">Annonce d'échange étudiant</h4>
            <p className="text-xs text-sky-750 leading-relaxed mt-1">
              Vous proposez un échange sans contrepartie monétaire. Vous pourrez décrire l'objet désiré en retour dans la description.
            </p>
          </div>
        </div>
      )}

      {transactionType === "gratuit" && (
        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 flex items-start gap-3.5 animate-fadeIn">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
            <Gift size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-900">Annonce de don gratuit</h4>
            <p className="text-xs text-purple-750 leading-relaxed mt-1">
              Vous donnez gracieusement cet objet à un autre étudiant. L'objet sera affiché avec la mention "Gratuit". Merci pour votre générosité !
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
