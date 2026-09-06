import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, AlertCircle, ShoppingBag, Eye, MapPin, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useProductDraft } from "../../hooks/useProductDraft";
import { CategorySelector } from "./CategorySelector";
import { PriceInput } from "./PriceInput";
import { ImageUploader } from "./ImageUploader";
import { PublishSuccess } from "./PublishSuccess";

export function ProductWizard({ onClose, draftHook }) {
  const { user } = useAuth();
  const { publishProduct } = useMarketplace();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishedProduct, setPublishedProduct] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Hook handles draft recovery, autosave, steps, and forms state
  const {
    currentStep,
    formData,
    updateDraftField,
    nextStep,
    prevStep,
    resetDraft,
    validateStep,
    setCurrentStep
  } = draftHook;

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    setPublishError(null);

    // Map wizard data to database columns
    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price || 0),
      category: formData.category,
      condition: formData.condition,
      city: formData.city,
      images: formData.images,
      image_url: formData.images[0] || null, // First image as main cover
      status: "published",
      // Custom metadata mapped to descriptions if needed
      deliveryOptions: formData.deliveryOptions,
      isNegotiable: formData.isNegotiable,
      transactionType: formData.transactionType,
      contactDetails: formData.contactDetails
    };

    try {
      const response = await publishProduct(payload);
      setPublishedProduct(response);
      setShowSuccess(true);
      await resetDraft();
    } catch (err) {
      console.error("Error publishing product:", err);
      setPublishError(err.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishAnother = () => {
    setShowSuccess(false);
    setPublishedProduct(null);
    setCurrentStep(1);
  };

  if (showSuccess) {
    return (
      <PublishSuccess
        onSeeProduct={() => {
          onClose(); // Close publish modal
        }}
        onPublishAnother={handlePublishAnother}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Steps Progress Header */}
      <div className="mb-8 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">
          <span>Étape {currentStep} sur 5</span>
          <span className="text-pink-500 font-black">
            {currentStep === 1 && "Informations"}
            {currentStep === 2 && "Prix & Type"}
            {currentStep === 3 && "Photos de l'objet"}
            {currentStep === 4 && "Livraison & Contact"}
            {currentStep === 5 && "Prévisualisation"}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-full flex-1 rounded-full transition-all duration-500 ${
                currentStep >= stepNum ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps Content Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {publishError && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            <span>{publishError}</span>
          </div>
        )}

        {/* STEP 1: GENERAL INFOS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Titre de l'annonce
              </label>
              <input
                type="text"
                placeholder="Ex: Bureau en bois Ikea, iPhone 12..."
                value={formData.title}
                onChange={(e) => updateDraftField("title", e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-sm outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Description de l'objet
              </label>
              <textarea
                rows="4"
                placeholder="Décrivez l'état de l'objet, ses dimensions, les raisons de la vente..."
                value={formData.description}
                onChange={(e) => updateDraftField("description", e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-sm outline-none transition resize-none"
              />
            </div>

            <CategorySelector
              category={formData.category}
              onChange={(value) => updateDraftField("category", value)}
            />

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                État de l'objet
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "neuf", title: "Neuf", desc: "Jamais utilisé, scellé" },
                  { id: "très bon", title: "Très bon état", desc: "Peu utilisé, sans défaut" },
                  { id: "bon", title: "Bon état", desc: "Traces d'usures mineures" },
                  { id: "acceptable", title: "Acceptable", desc: "Usure visible, fonctionnel" }
                ].map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => updateDraftField("condition", cond.id)}
                    className={`flex flex-col p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                      formData.condition === cond.id
                        ? "border-pink-500 bg-pink-50/20 text-pink-650"
                        : "border-slate-100 hover:border-pink-400 hover:bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{cond.title}</span>
                    <span className="text-[9px] text-slate-400 mt-1 font-semibold leading-snug">
                      {cond.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING */}
        {currentStep === 2 && (
          <PriceInput
            price={formData.price}
            isNegotiable={formData.isNegotiable}
            transactionType={formData.transactionType}
            onChange={(fields) => {
              Object.entries(fields).forEach(([key, val]) => {
                updateDraftField(key, val);
              });
            }}
          />
        )}

        {/* STEP 3: PHOTO UPLOAD */}
        {currentStep === 3 && (
          <ImageUploader
            images={formData.images}
            onChange={(imagesList) => updateDraftField("images", imagesList)}
          />
        )}

        {/* STEP 4: DETAILS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Ville
              </label>
              <select
                value={formData.city}
                onChange={(e) => updateDraftField("city", e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-sm outline-none transition"
              >
                <option value="Berkane">Berkane (Campus)</option>
                <option value="Oujda">Oujda</option>
                <option value="Saidia">Saidia</option>
                <option value="Nador">Nador</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Options de remise
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "remise", title: "Remise en main propre", desc: "Échange sur le campus ou en ville" },
                  { id: "livraison", title: "Envoi postal / Colis", desc: "Livraison à la charge de l'acheteur" }
                ].map((opt) => {
                  const isChecked = formData.deliveryOptions.includes(opt.id);
                  const toggleOption = () => {
                    if (isChecked) {
                      updateDraftField(
                        "deliveryOptions",
                        formData.deliveryOptions.filter((o) => o !== opt.id)
                      );
                    } else {
                      updateDraftField("deliveryOptions", [...formData.deliveryOptions, opt.id]);
                    }
                  };

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={toggleOption}
                      className={`flex flex-col p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                        isChecked
                          ? "border-pink-500 bg-pink-50/20 text-pink-650"
                          : "border-slate-100 hover:border-pink-400 hover:bg-slate-50/50 text-slate-700"
                      }`}
                    >
                      <span className="text-xs font-extrabold">{opt.title}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-semibold leading-snug">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Coordonnées de contact
              </label>
              <input
                type="text"
                placeholder="Ex: N° de Téléphone (WhatsApp), ID Telegram..."
                value={formData.contactDetails}
                onChange={(e) => updateDraftField("contactDetails", e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-sm outline-none transition"
              />
            </div>
          </div>
        )}

        {/* STEP 5: PREVIEW */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 text-amber-700 text-xs font-bold rounded-2xl border border-amber-100 leading-relaxed">
              Veuillez examiner l'aperçu de votre annonce ci-dessous. Cliquez sur "Publier" pour la mettre en ligne.
            </div>

            <div className="max-w-sm mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="h-48 overflow-hidden relative bg-slate-100 shrink-0">
                <img
                  src={formData.images[0] || "https://images.pexels.com/photos/18105/pexels-photo.jpg"}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[9px] font-extrabold rounded-full border border-white/40 shadow-xs">
                  {formData.category}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-xs">
                  {formData.condition}
                </span>
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    📍 {formData.city}
                  </div>
                  <h2 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2">
                    {formData.title || "Titre sans nom"}
                  </h2>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3">
                    {formData.description || "Aucune description fournie."}
                  </p>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-600">
                    {formData.transactionType === "gratuit" ? "Gratuit" : `${formData.price || 0} DH`}
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">
                    {formData.deliveryOptions.includes("livraison") ? "📦 Envoi disponible" : "🤝 Remise en main propre"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Navigation Footer */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
        <button
          type="button"
          disabled={currentStep === 1 || publishing}
          onClick={prevStep}
          className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-bold transition border border-slate-150 ${
            currentStep === 1 || publishing
              ? "text-slate-300 border-slate-100 cursor-not-allowed"
              : "text-slate-655 hover:bg-slate-50 active:scale-98"
          }`}
        >
          <ArrowLeft size={14} />
          <span>Précédent</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            disabled={!validateStep(currentStep)}
            onClick={nextStep}
            className={`flex items-center gap-1.5 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-lg ${
              validateStep(currentStep)
                ? "bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/10 hover:opacity-95 active:scale-98 cursor-pointer"
                : "bg-slate-100 text-slate-350 shadow-none cursor-not-allowed border border-slate-200/50"
            }`}
          >
            <span>Continuer</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            disabled={publishing}
            onClick={handlePublish}
            className="flex items-center gap-1.5 bg-linear-to-r from-green-500 to-emerald-600 hover:opacity-95 active:scale-98 text-white px-7 py-3 rounded-2xl text-xs font-extrabold shadow-lg shadow-green-500/10 transition-all cursor-pointer"
          >
            {publishing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Mise en ligne...</span>
              </>
            ) : (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Publier mon annonce</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
