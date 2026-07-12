/**
 * Utility to lazily load heic2any from CDN and convert HEIC/HEIF files to JPEG in the frontend.
 * This allows uploading HEIC/HEIF images from mobile devices directly to the app seamlessly.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  const nameLower = file.name.toLowerCase();
  const isHeic = nameLower.endsWith(".heic") || nameLower.endsWith(".heif");
  if (!isHeic) return file;

  // Load heic2any dynamically from unpkg/jsdelivr CDN
  const heic2any = await new Promise<any>((resolve, reject) => {
    if ((window as any).heic2any) {
      resolve((window as any).heic2any);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    script.onload = () => {
      if ((window as any).heic2any) {
        resolve((window as any).heic2any);
      } else {
        reject(new Error("heic2any failed to initialize on global window scope"));
      }
    };
    script.onerror = (err) => reject(new Error("Failed to download heic2any library: " + err));
    document.head.appendChild(script);
  });

  // Transcode HEIC/HEIF blob to standard JPEG blob
  const convertedBlobOrBlobs = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.8,
  });

  const convertedBlob = Array.isArray(convertedBlobOrBlobs) ? convertedBlobOrBlobs[0] : convertedBlobOrBlobs;

  // Re-build file metadata with .jpg extension
  const dotIndex = file.name.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
  const newName = `${baseName || "image"}.jpg`;

  return new File([convertedBlob], newName, { type: "image/jpeg" });
}
