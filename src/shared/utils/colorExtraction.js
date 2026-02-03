/**
 * Extracts dominant colors from an image file using an off-screen canvas
 * @param {File} file - The image file to process
 * @param {number} maxColors - Maximum number of colors to extract (default: 5)
 * @returns {Promise<string[]>} Array of hex color strings
 */
export async function extractColorsFromImage(file, maxColors = 5) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve([]);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize for performance (max 200px)
        const scale = Math.min(1, 200 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        const pixelCount = canvas.width * canvas.height;
        const colorMap = {};

        // Sample pixels (step by 4 to skip alpha, and step by larger amount for speed)
        // We step by 20 pixels (4 * 5) for performance
        for (let i = 0; i < imageData.length; i += 20) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // Skip transparent or very white/black pixels
          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue; // Skip white
          if (r < 15 && g < 15 && b < 15) continue; // Skip black

          // Quantize colors (round to nearest 10) to group similar shades
          const qr = Math.round(r / 10) * 10;
          const qg = Math.round(g / 10) * 10;
          const qb = Math.round(b / 10) * 10;

          const rgb = `${qr},${qg},${qb}`;
          colorMap[rgb] = (colorMap[rgb] || 0) + 1;
        }

        // Sort by frequency
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .map(([rgb]) => {
            const [r, g, b] = rgb.split(",").map(Number);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          })
          .slice(0, maxColors);

        URL.revokeObjectURL(objectUrl);
        resolve(sortedColors);
      } catch (error) {
        console.error("Error extracting colors:", error);
        URL.revokeObjectURL(objectUrl);
        resolve([]);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for color extraction"));
    };

    img.src = objectUrl;
  });
}
