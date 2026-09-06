// src/components/housing/ImageUploader.jsx
import React, { useState, useRef } from "react";
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function ImageUploader() {
  const { draft, updateDraftField } = useHousingDraft();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState({}); // { [fileId]: percentage }
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const images = draft.images || [];

  // Client-side Canvas Image Compression
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down to max 1200px width/height
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized WebP
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                {
                  type: "image/webp",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            },
            "image/webp",
            0.75
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadToSupabase = async (file, fileId) => {
    if (!user) return null;

    try {
      const fileExt = "webp";
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Simulate upload progress (since Supabase JS upload doesn't support progress events directly out of the box in simple clients)
      let progress = 10;
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      const interval = setInterval(() => {
        progress = Math.min(progress + 15, 90);
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }, 150);

      // Check if credentials are placeholders, if so bypass and simulate
      const isPlaceholderCred = supabase.supabaseUrl?.includes("placeholder-url");

      if (isPlaceholderCred) {
        await new Promise(resolve => setTimeout(resolve, 800));
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        // Return dummy Pexels image as mockup
        const mockPexels = [
          "https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg",
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
          "https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg",
          "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
        ];
        return mockPexels[Math.floor(Math.random() * mockPexels.length)];
      }

      // Real Supabase Upload
      const { error: uploadErr } = await supabase.storage
        .from("housing-images")
        .upload(filePath, file);

      clearInterval(interval);

      if (uploadErr) throw uploadErr;

      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      const { data: { publicUrl } } = supabase.storage
        .from("housing-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Storage upload error:", err);
      setUploadProgress(prev => ({ ...prev, [fileId]: -1 })); // error state
      return null;
    }
  };

  const processFiles = async (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file =>
      file.type.startsWith("image/")
    );

    if (images.length + validFiles.length > 10) {
      alert("Vous ne pouvez pas ajouter plus de 10 photos.");
      return;
    }

    const newImageSlots = validFiles.map((file, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      name: file.name,
      url: "",
      isCover: images.length === 0 && idx === 0, // auto-select cover for the first image
      loading: true
    }));

    // Add empty slots with loading states immediately for snappy UX feedback
    const updatedImages = [...images, ...newImageSlots];
    updateDraftField("images", updatedImages);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const slot = newImageSlots[i];

      // 1. Client-side compression
      const compressed = await compressImage(file);

      // 2. Upload to Supabase Storage
      const uploadedUrl = await uploadToSupabase(compressed, slot.id);

      if (uploadedUrl) {
        updateDraftField(
          "images",
          updatedImages.map(img =>
            img.id === slot.id
              ? { ...img, url: uploadedUrl, loading: false }
              : img
          )
        );
        // Also set the cover_url if this image is selected as cover
        if (slot.isCover) {
          updateDraftField("cover_url", uploadedUrl);
        }
      } else {
        // Remove slot if upload failed
        updateDraftField(
          "images",
          updatedImages.filter(img => img.id !== slot.id)
        );
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id, url) => {
    const filtered = images.filter(img => img.id !== id);
    
    // If we removed the cover, auto-assign the first remaining one as cover
    let isCoverRemoved = false;
    const mapped = filtered.map((img, idx) => {
      if (img.isCover) return img;
      if (idx === 0) {
        isCoverRemoved = true;
        return { ...img, isCover: true };
      }
      return img;
    });

    updateDraftField("images", mapped);
    
    // Update cover URL field
    if (mapped.length > 0) {
      const coverObj = mapped.find(img => img.isCover);
      updateDraftField("cover_url", coverObj ? coverObj.url : "");
    } else {
      updateDraftField("cover_url", "");
    }
  };

  const setAsCover = (id) => {
    const updated = images.map(img => {
      const isTarget = img.id === id;
      if (isTarget) {
        updateDraftField("cover_url", img.url);
      }
      return { ...img, isCover: isTarget };
    });
    updateDraftField("images", updated);
  };

  const moveImage = (index, direction) => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === images.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...images];
    
    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updateDraftField("images", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Photos du logement</h3>
        <p className="text-xs text-slate-500">
          Ajoutez jusqu'à 10 photos. La première photo servira de couverture par défaut. Vos photos sont compressées pour accélérer le chargement.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          isDragActive
            ? "border-sky-500 bg-sky-50/30"
            : "border-slate-300 hover:border-sky-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="p-4 bg-sky-50 rounded-full text-sky-600">
          <Upload size={24} />
        </div>
        <div className="text-center">
          <span className="text-xs font-bold text-slate-700">Glissez-déposez vos photos ou cliquez pour parcourir</span>
          <p className="text-[10px] text-slate-400 mt-1">Formats acceptés : PNG, JPEG, WEBP. Max 10 Mo par fichier.</p>
        </div>
      </div>

      {/* Uploading & Preview Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, index) => {
            const progress = uploadProgress[img.id] || 0;
            const isError = progress === -1;

            return (
              <div
                key={img.id}
                className={`group relative aspect-square rounded-2xl border overflow-hidden bg-slate-50 flex flex-col justify-between transition-all ${
                  img.isCover ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md" : "border-slate-200"
                }`}
              >
                {/* Image rendering or loader */}
                {img.loading || !img.url ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-white/95">
                    {isError ? (
                      <span className="text-[10px] font-bold text-red-500 text-center">Échec de l'envoi</span>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300 animate-bounce w-8 h-8 mb-2" />
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] font-black text-slate-500 mt-1">{progress}%</span>
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Cover Flag badge */}
                {img.isCover && !img.loading && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white rounded-md text-[8px] font-black flex items-center gap-1 shadow-sm uppercase tracking-wider">
                    <Star size={8} fill="white" />
                    <span>Couverture</span>
                  </div>
                )}

                {/* Floating controls */}
                {!img.loading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      type="button"
                      onClick={() => removeImage(img.id, img.url)}
                      className="self-end p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow-sm transition"
                    >
                      <X size={12} />
                    </button>

                    <div className="space-y-1.5">
                      {/* Cover assignment button */}
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => setAsCover(img.id)}
                          className="w-full py-1 bg-white/95 hover:bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <Star size={10} />
                          <span>Couverture</span>
                        </button>
                      )}

                      {/* Swap Position arrows */}
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, "left")}
                          className="flex-1 py-1 bg-white/90 hover:bg-slate-100 disabled:opacity-40 rounded-lg flex justify-center text-slate-700 transition"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, "right")}
                          className="flex-1 py-1 bg-white/90 hover:bg-slate-100 disabled:opacity-40 rounded-lg flex justify-center text-slate-700 transition"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
