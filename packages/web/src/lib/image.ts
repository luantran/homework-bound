// Anthropic downscales anything larger, so bigger uploads only cost time
const MAX_EDGE = 1568;
const JPEG_QUALITY = 0.85;

// Shrinks a photo and re-encodes it as JPEG for upload
export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not process image")),
      "image/jpeg",
      JPEG_QUALITY,
    ),
  );
}
