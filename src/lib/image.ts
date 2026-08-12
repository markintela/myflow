// Reduz uma imagem para um thumbnail (via canvas) antes do upload, para não
// sobrecarregar o Storage com fotos em resolução/tamanho originais.
export function resizeImageToThumbnail(
  file: File,
  maxSize: number = 256,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível processar a imagem"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar o thumbnail"))),
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível ler a imagem"));
    };

    img.src = objectUrl;
  });
}
