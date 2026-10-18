/**
 * High-fidelity client-side Image Compressor
 * Preserves ultra-crisp detail and color accuracy (Retina & 4K display ready)
 * Uses high-quality bicubic interpolation at 92% quality WebP
 */
export async function compressImage(
  file: File, 
  maxWidth = 2560, 
  maxHeight = 1600, 
  quality = 0.92
): Promise<File> {
  // If file is already small (e.g. under 600KB) or vector/GIF, preserve original without touching
  if (file.size <= 600 * 1024 || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Only scale down if significantly exceeds crisp 2K/4K display limits
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // fallback to original if canvas fails
        }

        // Enable maximum quality anti-aliased bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with full fidelity
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-fidelity WebP format at 92% quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Create compressed File object with .webp extension
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File(
              [blob], 
              `${baseName}.webp`, 
              { type: 'image/webp', lastModified: Date.now() }
            );

            // If compressed is somehow larger than original, keep original
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
