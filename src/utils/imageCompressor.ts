export interface CompressionResult {
  base64: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // e.g. 75 (%)
  width: number;
  height: number;
  wasCompressed: boolean;
}

/**
 * Nén và thu nhỏ kích thước hình ảnh trên client trước khi gửi lên AI.
 * Giúp giảm tải mạng từ ~5-15MB xuống ~100-250KB, tăng tốc độ xử lý AI lên gấp 3-5 lần.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<CompressionResult> {
  let sourceUrl = '';
  let originalMime = 'image/jpeg';
  let originalSize = 0;

  if (typeof fileOrDataUrl === 'string') {
    sourceUrl = fileOrDataUrl;
    const match = fileOrDataUrl.match(/^data:([^;]+);base64,/);
    if (match) originalMime = match[1];
    // Estimate size from base64 length
    const clean = fileOrDataUrl.replace(/^data:[^;]+;base64,/, '');
    originalSize = Math.floor((clean.length * 3) / 4);
  } else {
    sourceUrl = URL.createObjectURL(fileOrDataUrl);
    originalMime = fileOrDataUrl.type || 'image/jpeg';
    originalSize = fileOrDataUrl.size;
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(new Error('Không thể tải hình ảnh để nén: ' + err));
      image.src = sourceUrl;
    });

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // Nếu ảnh đã rất nhỏ (< 200KB) và kích thước không quá lớn, giữ nguyên
    if (originalSize > 0 && originalSize < 200 * 1024 && origWidth <= maxDimension && origHeight <= maxDimension) {
      let finalBase64 = '';
      if (typeof fileOrDataUrl === 'string') {
        finalBase64 = fileOrDataUrl;
      } else {
        finalBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
      }
      return {
        base64: finalBase64,
        mimeType: originalMime,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        width: origWidth,
        height: origHeight,
        wasCompressed: false,
      };
    }

    // Tính toán tỷ lệ co giãn giữ nguyên aspect ratio
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // Thiết lập làm nét tốt nhất khi resize
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Với PNG có nền trong suốt, giữ nền trắng nếu chuyển sang JPEG
    // Ưu tiên nén sang WebP (nhẹ và hỗ trợ alpha), fallback sang JPEG
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let outputMime = 'image/webp';
    let blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), outputMime, quality);
    });

    // Nếu trình duyệt không hỗ trợ toBlob webp (trả về null hoặc jpeg)
    if (!blob || blob.type !== 'image/webp') {
      outputMime = 'image/jpeg';
      // Fill nền trắng trước khi export jpeg
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), outputMime, quality);
      });
    }

    if (!blob) {
      throw new Error('Không thể tạo blob ảnh sau khi nén');
    }

    const compressedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob!);
    });

    const compressedSize = blob.size;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const compressionRatio = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    return {
      base64: compressedBase64,
      mimeType: outputMime,
      originalSize,
      compressedSize,
      compressionRatio,
      width: targetWidth,
      height: targetHeight,
      wasCompressed: true,
    };
  } finally {
    // Dọn dẹp object URL nếu được tạo tạm
    if (typeof fileOrDataUrl !== 'string' && sourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(sourceUrl);
    }
  }
}

/**
 * Định dạng dung lượng byte thành chuỗi dễ đọc (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
