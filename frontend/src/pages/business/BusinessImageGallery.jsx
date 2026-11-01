// import { useEffect, useRef, useState } from "react";
// import {
//   AlertCircle,
//   ImagePlus,
//   Loader2,
//   RefreshCw,
//   Trash2,
// } from "lucide-react";
// import { api } from "../../utils/api";
// import { supabase } from "../../utils/supabase";
// import ImageLightbox from "../../components/ImageLightbox";

// const IMAGE_BUCKET = "business_images";
// const MAX_IMAGES_PER_UPLOAD = 20;

// const BusinessImageGallery = ({
//   businessId,
//   canUpload = false,
//   title = "Business images",
//   uploadLabel = "Add images",
//   emptyLabel = "No images uploaded yet.",
//   uploadingLabel = "Uploading...",
//   errorLabel = "Unable to load business images.",
// }) => {
//   const addInputRef = useRef(null);
//   const replaceInputRef = useRef(null);

//   const [imageUrls, setImageUrls] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [actionInProgress, setActionInProgress] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedImage, setSelectedImage] = useState("");
//   const [replaceTargetUrl, setReplaceTargetUrl] = useState("");

//   const fetchImages = async () => {
//     if (!businessId) return;

//     try {
//       setLoading(true);
//       setError("");
//       const response = await api.get(`/businesses/${businessId}/images`);
//       const urls = response.data?.image_urls;
//       setImageUrls(Array.isArray(urls) ? urls : []);
//     } catch (err) {
//       console.error("Failed to load business images:", err);
//       setError(err.response?.data?.detail || errorLabel);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchImages();
//   }, [businessId]);

//   // Helper: Upload file to Supabase and return public URL
//   const uploadFileToSupabase = async (file) => {
//     const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
//     const fileName = `${businessId}/${Date.now()}-${Math.random()
//       .toString(36)
//       .substring(2)}.${extension}`;

//     const { error: uploadError } = await supabase.storage
//       .from(IMAGE_BUCKET)
//       .upload(fileName, file, {
//         contentType: file.type,
//         upsert: false,
//       });

//     if (uploadError) throw uploadError;

//     const { data: publicUrlData } = supabase.storage
//       .from(IMAGE_BUCKET)
//       .getPublicUrl(fileName);

//     if (!publicUrlData?.publicUrl) {
//       throw new Error("Unable to create an image URL.");
//     }

//     return publicUrlData.publicUrl;
//   };

//   // 1. Add / Append Images
//   const handleUpload = async (event) => {
//     const files = Array.from(event.target.files || []);
//     if (!files.length) return;

//     setUploading(true);
//     setError("");

//     try {
//       if (imageUrls.length + files.length > MAX_IMAGES_PER_UPLOAD) {
//         throw new Error(
//           `Maximum limit is ${MAX_IMAGES_PER_UPLOAD} images total.`,
//         );
//       }

//       if (files.some((file) => !file.type.startsWith("image/"))) {
//         throw new Error("Please select image files only.");
//       }

//       const uploadedUrls = await Promise.all(
//         files.map((file) => uploadFileToSupabase(file)),
//       );

//       const response = await api.post(`/businesses/${businessId}/images`, {
//         image_urls: uploadedUrls,
//       });

//       setImageUrls(
//         response.data?.image_urls || [...imageUrls, ...uploadedUrls],
//       );
//     } catch (err) {
//       console.error("Business image upload failed:", err);
//       setError(err.response?.data?.detail || err.message || errorLabel);
//     } finally {
//       setUploading(false);
//       if (addInputRef.current) addInputRef.current.value = "";
//     }
//   };

//   // 2. Trigger Single Image Replacement
//   const triggerReplace = (event, oldUrl) => {
//     event.stopPropagation();
//     setReplaceTargetUrl(oldUrl);
//     replaceInputRef.current?.click();
//   };

//   const handleReplaceUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file || !replaceTargetUrl) return;

//     setActionInProgress(true);
//     setError("");

//     try {
//       if (!file.type.startsWith("image/")) {
//         throw new Error("Please select an image file.");
//       }

//       const newPublicUrl = await uploadFileToSupabase(file);

//       // Replace old URL with the new one in the existing order
//       const updatedList = imageUrls.map((url) =>
//         url === replaceTargetUrl ? newPublicUrl : url,
//       );

//       const response = await api.put(`/businesses/${businessId}/images`, {
//         image_urls: updatedList,
//       });

//       setImageUrls(response.data?.image_urls || updatedList);
//     } catch (err) {
//       console.error("Failed to replace image:", err);
//       setError(
//         err.response?.data?.detail || err.message || "Failed to replace image.",
//       );
//     } finally {
//       setActionInProgress(false);
//       setReplaceTargetUrl("");
//       if (replaceInputRef.current) replaceInputRef.current.value = "";
//     }
//   };

//   // 3. Delete Single Image
//   const handleDeleteSingle = async (event, urlToDelete) => {
//     event.stopPropagation();

//     if (!window.confirm("Are you sure you want to remove this image?")) {
//       return;
//     }

//     setActionInProgress(true);
//     setError("");

//     try {
//       const remainingUrls = imageUrls.filter((url) => url !== urlToDelete);

//       if (remainingUrls.length === 0) {
//         // Clear all if none remain
//         await api.delete(`/businesses/${businessId}/images`);
//         setImageUrls([]);
//       } else {
//         const response = await api.put(`/businesses/${businessId}/images`, {
//           image_urls: remainingUrls,
//         });
//         setImageUrls(response.data?.image_urls || remainingUrls);
//       }
//     } catch (err) {
//       console.error("Failed to delete image:", err);
//       setError(err.response?.data?.detail || "Failed to remove image.");
//     } finally {
//       setActionInProgress(false);
//     }
//   };

//   // 4. Clear All Images
//   const handleClearAll = async () => {
//     if (!window.confirm("Are you sure you want to remove all images?")) {
//       return;
//     }

//     setActionInProgress(true);
//     setError("");

//     try {
//       await api.delete(`/businesses/${businessId}/images`);
//       setImageUrls([]);
//     } catch (err) {
//       console.error("Failed to clear images:", err);
//       setError(err.response?.data?.detail || "Failed to clear all images.");
//     } finally {
//       setActionInProgress(false);
//     }
//   };

//   const isBusy = uploading || actionInProgress;

//   return (
//     <section className="mt-5 border-t border-gray-800 pt-5">
//       <div className="flex items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
//           {imageUrls.length > 0 && (
//             <span className="text-xs text-gray-500">
//               ({imageUrls.length}/{MAX_IMAGES_PER_UPLOAD})
//             </span>
//           )}
//         </div>

//         {canUpload && (
//           <div className="flex items-center gap-2">
//             {imageUrls.length > 0 && (
//               <button
//                 type="button"
//                 onClick={handleClearAll}
//                 disabled={isBusy}
//                 className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
//                 title="Remove all images"
//               >
//                 <Trash2 size={13} />
//                 <span>Clear All</span>
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={() => addInputRef.current?.click()}
//               disabled={isBusy || imageUrls.length >= MAX_IMAGES_PER_UPLOAD}
//               className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {uploading ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <ImagePlus size={14} />
//               )}
//               {uploading ? uploadingLabel : uploadLabel}
//             </button>

//             {/* Hidden file input for adding new images */}
//             <input
//               ref={addInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleUpload}
//               disabled={isBusy}
//               className="hidden"
//             />

//             {/* Hidden file input for replacing an image */}
//             <input
//               ref={replaceInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleReplaceUpload}
//               disabled={isBusy}
//               className="hidden"
//             />
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="mt-3 flex items-start gap-2 text-xs text-red-400">
//           <AlertCircle size={14} className="mt-0.5 shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}

//       {loading ? (
//         <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-gray-800 bg-gray-950/30">
//           <Loader2 size={18} className="animate-spin text-blue-400" />
//         </div>
//       ) : imageUrls.length > 0 ? (
//         <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
//           {imageUrls.map((url) => (
//             <div
//               key={url}
//               className="group relative aspect-square overflow-hidden rounded-lg border border-gray-800 bg-gray-950"
//             >
//               <img
//                 src={url}
//                 alt={title}
//                 className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
//                 loading="lazy"
//               />

//               {/* View / Click overlay */}
//               <button
//                 type="button"
//                 onClick={() => setSelectedImage(url)}
//                 className="absolute inset-0 bg-transparent"
//                 aria-label={`View ${title}`}
//               />

//               {/* Action buttons on hover */}
//               {canUpload && (
//                 <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-end gap-1 p-1 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
//                   <button
//                     type="button"
//                     onClick={(event) => triggerReplace(event, url)}
//                     disabled={isBusy}
//                     title="Replace image"
//                     className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-blue-600 hover:text-white disabled:opacity-40"
//                   >
//                     <RefreshCw
//                       size={11}
//                       className={actionInProgress ? "animate-spin" : ""}
//                     />
//                   </button>

//                   <button
//                     type="button"
//                     onClick={(event) => handleDeleteSingle(event, url)}
//                     disabled={isBusy}
//                     title="Delete image"
//                     className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-red-600 hover:text-white disabled:opacity-40"
//                   >
//                     <Trash2 size={11} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="mt-3 text-xs text-gray-500">{emptyLabel}</p>
//       )}

//       <ImageLightbox
//         src={selectedImage}
//         alt={title}
//         onClose={() => setSelectedImage("")}
//       />
//     </section>
//   );
// };

// export default BusinessImageGallery;

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { api } from "../../utils/api";
import { supabase } from "../../utils/supabase";
import ImageLightbox from "../../components/ImageLightbox";
import { useLanguage } from "../../context/LanguageContext";

const IMAGE_BUCKET = "business_images";
const MAX_IMAGES_PER_UPLOAD = 20;

const BusinessImageGallery = ({
  businessId,
  initialUrls = [],
  canUpload = false,
  title = "Business images",
  uploadLabel = "Add images",
  emptyLabel = "No images uploaded yet.",
  uploadingLabel = "Uploading...",
  errorLabel = "Unable to load business images.",
}) => {
  const { language } = useLanguage();
  const galleryText =
    {
      english: {
        maxImages: (count) => `Maximum limit is ${count} images total.`,
        imageOnly: "Please select image files only.",
        imageFile: "Please select an image file.",
        replaceFailed: "Failed to replace image.",
        removeConfirm: "Are you sure you want to remove this image?",
        removeFailed: "Failed to remove image.",
        clearConfirm: "Are you sure you want to remove all images?",
        clearFailed: "Failed to clear all images.",
        removeAll: "Remove all images",
        clearAll: "Clear All",
        view: (label) => `View ${label}`,
        replace: "Replace image",
        delete: "Delete image",
      },
      hindi: {
        maxImages: (count) => `कुल अधिकतम ${count} तस्वीरें हो सकती हैं।`,
        imageOnly: "कृपया केवल तस्वीर फ़ाइलें चुनें।",
        imageFile: "कृपया एक तस्वीर फ़ाइल चुनें।",
        replaceFailed: "तस्वीर बदलना विफल रहा।",
        removeConfirm: "क्या आप वाकई इस तस्वीर को हटाना चाहते हैं?",
        removeFailed: "तस्वीर हटाना विफल रहा।",
        clearConfirm: "क्या आप वाकई सभी तस्वीरें हटाना चाहते हैं?",
        clearFailed: "सभी तस्वीरें हटाना विफल रहा।",
        removeAll: "सभी तस्वीरें हटाएं",
        clearAll: "सभी साफ़ करें",
        view: (label) => `${label} देखें`,
        replace: "तस्वीर बदलें",
        delete: "तस्वीर हटाएं",
      },
      bengali: {
        maxImages: (count) => `সর্বোচ্চ মোট ${count}টি ছবি হতে পারে।`,
        imageOnly: "অনুগ্রহ করে শুধুমাত্র ছবির ফাইল নির্বাচন করুন।",
        imageFile: "অনুগ্রহ করে একটি ছবির ফাইল নির্বাচন করুন।",
        replaceFailed: "ছবি পরিবর্তন করা যায়নি।",
        removeConfirm: "আপনি কি নিশ্চিত যে এই ছবিটি সরাতে চান?",
        removeFailed: "ছবি সরানো যায়নি।",
        clearConfirm: "আপনি কি নিশ্চিত যে সব ছবি সরাতে চান?",
        clearFailed: "সব ছবি সরানো যায়নি।",
        removeAll: "সব ছবি সরান",
        clearAll: "সব মুছুন",
        view: (label) => `${label} দেখুন`,
        replace: "ছবি পরিবর্তন করুন",
        delete: "ছবি মুছুন",
      },
    }[language] || galleryText.english;
  const addInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const [imageUrls, setImageUrls] = useState(() =>
    Array.isArray(initialUrls) ? initialUrls : [],
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [replaceTargetUrl, setReplaceTargetUrl] = useState("");

  const fetchImages = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/businesses/${businessId}/images`);
      const data = response.data;
      let urls = [];

      if (Array.isArray(data)) {
        urls = data;
      } else if (Array.isArray(data?.image_urls)) {
        urls = data.image_urls;
      } else if (typeof data?.image_urls === "string") {
        try {
          urls = JSON.parse(data.image_urls);
        } catch {
          urls = [data.image_urls];
        }
      }

      setImageUrls(Array.isArray(urls) ? urls.filter(Boolean) : []);
    } catch (err) {
      console.error("Failed to load business images:", err);
      setError(err.response?.data?.detail || errorLabel);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialUrls) && initialUrls.length > 0) {
      setImageUrls(initialUrls);
    }
    fetchImages();
  }, [businessId]);

  const uploadFileToSupabase = async (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${businessId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Unable to create an image URL.");
    }

    return publicUrlData.publicUrl;
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      if (imageUrls.length + files.length > MAX_IMAGES_PER_UPLOAD) {
        throw new Error(galleryText.maxImages(MAX_IMAGES_PER_UPLOAD));
      }

      if (files.some((file) => !file.type.startsWith("image/"))) {
        throw new Error(galleryText.imageOnly);
      }

      const uploadedUrls = await Promise.all(
        files.map((file) => uploadFileToSupabase(file)),
      );

      const response = await api.post(`/businesses/${businessId}/images`, {
        image_urls: uploadedUrls,
      });

      const updated = response.data?.image_urls || [
        ...imageUrls,
        ...uploadedUrls,
      ];
      setImageUrls(updated);
    } catch (err) {
      console.error("Business image upload failed:", err);
      setError(err.response?.data?.detail || err.message || errorLabel);
    } finally {
      setUploading(false);
      if (addInputRef.current) addInputRef.current.value = "";
    }
  };

  const triggerReplace = (event, oldUrl) => {
    event.stopPropagation();
    setReplaceTargetUrl(oldUrl);
    replaceInputRef.current?.click();
  };

  const handleReplaceUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !replaceTargetUrl) return;

    setActionInProgress(true);
    setError("");

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(galleryText.imageFile);
      }

      const newPublicUrl = await uploadFileToSupabase(file);
      const updatedList = imageUrls.map((url) =>
        url === replaceTargetUrl ? newPublicUrl : url,
      );

      const response = await api.put(`/businesses/${businessId}/images`, {
        image_urls: updatedList,
      });

      setImageUrls(response.data?.image_urls || updatedList);
    } catch (err) {
      console.error("Failed to replace image:", err);
      setError(
        err.response?.data?.detail || err.message || galleryText.replaceFailed,
      );
    } finally {
      setActionInProgress(false);
      setReplaceTargetUrl("");
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDeleteSingle = async (event, urlToDelete) => {
    event.stopPropagation();

    if (!window.confirm(galleryText.removeConfirm)) {
      return;
    }

    setActionInProgress(true);
    setError("");

    try {
      const remainingUrls = imageUrls.filter((url) => url !== urlToDelete);

      if (remainingUrls.length === 0) {
        await api.delete(`/businesses/${businessId}/images`);
        setImageUrls([]);
      } else {
        const response = await api.put(`/businesses/${businessId}/images`, {
          image_urls: remainingUrls,
        });
        setImageUrls(response.data?.image_urls || remainingUrls);
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError(err.response?.data?.detail || galleryText.removeFailed);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(galleryText.clearConfirm)) {
      return;
    }

    setActionInProgress(true);
    setError("");

    try {
      await api.delete(`/businesses/${businessId}/images`);
      setImageUrls([]);
    } catch (err) {
      console.error("Failed to clear images:", err);
      setError(err.response?.data?.detail || galleryText.clearFailed);
    } finally {
      setActionInProgress(false);
    }
  };

  const isBusy = uploading || actionInProgress;

  return (
    <section className="mt-5 border-t border-slate-200 dark:border-gray-800 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200">{title}</h3>
          {imageUrls.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-gray-500">
              ({imageUrls.length}/{MAX_IMAGES_PER_UPLOAD})
            </span>
          )}
        </div>

        {canUpload && (
          <div className="flex items-center gap-2">
            {imageUrls.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isBusy}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                title={galleryText.removeAll}
              >
                <Trash2 size={13} />
                <span>{galleryText.clearAll}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              disabled={isBusy || imageUrls.length >= MAX_IMAGES_PER_UPLOAD}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {uploading ? uploadingLabel : uploadLabel}
            </button>

            <input
              ref={addInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={isBusy}
              className="hidden"
            />

            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceUpload}
              disabled={isBusy}
              className="hidden"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-500 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/30">
          <Loader2 size={18} className="animate-spin text-blue-500" />
        </div>
      ) : imageUrls.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imageUrls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 shadow-sm"
            >
              <img
                src={url}
                alt={title}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                loading="lazy"
              />

              <button
                type="button"
                onClick={() => setSelectedImage(url)}
                className="absolute inset-0 bg-transparent"
                aria-label={galleryText.view(title)}
              />

              {canUpload && (
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-end gap-1 p-1 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(event) => triggerReplace(event, url)}
                    disabled={isBusy}
                    title={galleryText.replace}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-blue-600 hover:text-white disabled:opacity-40"
                  >
                    <RefreshCw
                      size={11}
                      className={actionInProgress ? "animate-spin" : ""}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => handleDeleteSingle(event, url)}
                    disabled={isBusy}
                    title={galleryText.delete}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-red-600 hover:text-white disabled:opacity-40"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500 dark:text-gray-500">{emptyLabel}</p>
      )}

      <ImageLightbox
        src={selectedImage}
        alt={title}
        onClose={() => setSelectedImage("")}
      />
    </section>
  );
};

export default BusinessImageGallery;
