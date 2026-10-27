/**
 * RiteClick FaceGate - API Service
 * 
 * Handles client-side image resizing and communication with
 * the AWS API Gateway endpoint.
 * 
 * Note: No AWS SDK or AWS credentials are used in the browser.
 * Communication is strictly via standard HTTP fetch() to API Gateway.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Resizes an image to a maximum dimension and compresses it as JPEG.
 * This keeps the payload size small and optimal for API Gateway & Lambda.
 * 
 * @param {Blob|File|string} source - File object, Blob, or base64 data URL
 * @param {number} maxDimension - Max width or height in pixels (default: 800)
 * @param {number} quality - JPEG quality between 0 and 1 (default: 0.85)
 * @returns {Promise<string>} Base64 Data URL (e.g. data:image/jpeg;base64,...)
 */
export function resizeImage(source, maxDimension = 800, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Scale dimensions down if either exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // Draw onto an offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Unable to process the image. Please try another image.'));
    };

    // Load source into Image object
    if (source instanceof Blob || source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Invalid image source provided.'));
    }
  });
}

/**
 * Sends the image to the AWS API Gateway /verify endpoint.
 * 
 * Expected payload:
 * {
 *   "image": "BASE64_STRING"
 * }
 * 
 * @param {string} dataUrlOrBase64 - Image data URL or raw base64 string
 * @returns {Promise<Object>} Verification response from API Gateway
 */
export async function verifyFace(dataUrlOrBase64) {
  // Strip the 'data:image/...;base64,' prefix if present to send clean base64 bytes
  const base64Data = dataUrlOrBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  // Validate that an API URL is configured
  if (!API_BASE_URL || API_BASE_URL.includes('YOUR_API_GATEWAY_URL')) {
    throw new Error('API Gateway URL not configured. Please set VITE_API_BASE_URL in your .env file.');
  }

  // Ensure clean URL without trailing slash
  const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/verify`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // If it was our configuration error, preserve it for helpful developer debugging
    if (error.message.includes('API Gateway URL not configured')) {
      throw error;
    }

    // Otherwise, mask raw AWS errors with user-friendly security message
    console.error('API Verification error:', error);
    throw new Error('Verification failed. Please try again.');
  }
}
