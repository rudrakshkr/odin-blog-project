const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");

function uploadMiddleware(folderName) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            const folderPath = `${folderName.trim()}`;
            const publicId = `${file.fieldname}-${Date.now()}`;

            return {
                folder: folderPath,
                public_id: publicId,
                resource_type: 'auto'
            };
        },
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024
        },
    });
}

module.exports = uploadMiddleware;