import { useState } from "react";
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";

export function ImageUploader({ images, onChange }) {
  const [dragActive, setDragActive] = useState(false);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (filesList) => {
    const validFiles = Array.from(filesList).filter((file) =>
      file.type.startsWith("image/")
    );

    const remainingSlots = 8 - images.length;
    const filesToProcess = validFiles.slice(0, remainingSlots);

    const compressed = await Promise.all(
      filesToProcess.map((file) => compressImage(file))
    );

    onChange([...images, ...compressed]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, i) => i !== indexToRemove));
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    onChange(newImages);
  };

  const moveRight = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      {images.length < 8 && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? "border-pink-500 bg-pink-50/30"
              : "border-slate-200 hover:border-pink-400 hover:bg-slate-50/50"
          }`}
          onClick={() => document.getElementById("file-input").click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-4 shadow-xs">
            <Upload size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Faites glisser vos photos ici, ou <span className="text-pink-500">parcourez</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Formats acceptés : WebP, JPEG, PNG (Max. 8 images)
          </p>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Photos sélectionnées ({images.length}/8)
            </span>
            {images.length === 8 && (
              <span className="text-xs font-bold text-amber-500">
                Limite maximale atteinte (8 images)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="group relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-xs flex flex-col justify-end"
              >
                <img
                  src={img}
                  alt={`Preview ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Control Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-7 h-7 bg-white/90 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-slate-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-white/95 backdrop-blur-xs px-2 py-1 rounded-xl text-slate-700">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveLeft(index)}
                      className={`hover:text-pink-500 transition ${
                        index === 0 ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <span className="text-[10px] font-bold">
                      {index === 0 ? "Couverture" : index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveRight(index)}
                      className={`hover:text-pink-500 transition ${
                        index === images.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {index === 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-pink-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase shadow-xs">
                    Couverture
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
