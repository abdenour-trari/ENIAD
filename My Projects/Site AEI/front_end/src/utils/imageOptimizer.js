// src/utils/imageOptimizer.js

/**
 * Optimizes an image URL by applying size, quality, and format constraints.
 * Supports Supabase Storage, Pexels, Unsplash, and Pravatar.
 * 
 * @param {string} src The original image source URL
 * @param {object} options Optimization options
 * @param {number} options.width Target width in pixels
 * @param {number} options.height Target height in pixels (optional)
 * @param {number} options.quality Compression quality (0-100)
 * @param {string} options.format Target image format (default: 'webp')
 * @returns {string} The optimized image URL
 */
export function getOptimizedImage(src, options = {}) {
  if (!src) return "";
  
  // Return as-is if it's already a base64 string
  if (src.startsWith("data:")) return src;

  const { width, height, quality = 75, format = "webp" } = options;

  try {
    const url = new URL(src);

    // 1. Supabase Storage Public URLs
    // Example: https://xxxx.supabase.co/storage/v1/object/public/housing-images/file.jpg
    if (url.pathname.includes("/storage/v1/object/public/")) {
      const newPathname = url.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );
      
      const optimizedUrl = new URL(url.origin + newPathname);
      if (width) optimizedUrl.searchParams.set("width", width.toString());
      if (height) optimizedUrl.searchParams.set("height", height.toString());
      optimizedUrl.searchParams.set("quality", quality.toString());
      optimizedUrl.searchParams.set("format", format);
      
      return optimizedUrl.toString();
    }

    // 2. Pexels Images
    // Example: https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg
    if (url.hostname.includes("pexels.com")) {
      url.search = ""; // clear old query params
      if (width) url.searchParams.set("w", width.toString());
      if (height) url.searchParams.set("h", height.toString());
      url.searchParams.set("q", quality.toString());
      url.searchParams.set("auto", "compress");
      url.searchParams.set("fm", format);
      return url.toString();
    }

    // 3. Unsplash Images
    // Example: https://images.unsplash.com/photo-1522708323590-d24dbb6b0267
    if (url.hostname.includes("unsplash.com")) {
      if (width) url.searchParams.set("w", width.toString());
      if (height) url.searchParams.set("h", height.toString());
      url.searchParams.set("q", quality.toString());
      url.searchParams.set("fm", format);
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      return url.toString();
    }

    // 4. Pravatar.cc (User avatars)
    // Example: https://i.pravatar.cc/150?img=33
    if (url.hostname.includes("pravatar.cc")) {
      const targetSize = width || 80;
      // Replace the size (last part of pathname if it's numeric, or rebuild pathname)
      // Usually format is /150 or /300
      url.pathname = `/${targetSize}`;
      return url.toString();
    }

    return src;
  } catch {
    // If URL parsing fails, return original source
    return src;
  }
}
