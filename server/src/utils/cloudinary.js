const cloudinary = require('../config/cloudinary.config');
const env = require('../config/env.config');

/**
 * Upload an image buffer or base64 to Cloudinary
 *
 * @param {string|Buffer} file - Base64 data URI, local path, or remote URL
 * @param {string} folder - Destination folder (e.g. 'dehydrated-fruits/products')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = async (file, folder = 'dehydrated-fruits/products') => {
  // If Cloudinary credentials are fully configured, upload directly via SDK
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('[Cloudinary Upload Error]:', error.message);
      throw error;
    }
  }

  // Graceful fallback for local development before user configures live Cloudinary credentials
  const simulatedId = `${folder.replace(/\//g, '_')}_${Date.now()}`;
  return {
    url: typeof file === 'string' && file.startsWith('http')
      ? file
      : `https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80`,
    publicId: simulatedId,
  };
};

/**
 * Remove an image from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (
    !publicId ||
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('[Cloudinary Deletion Error]:', error.message);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
