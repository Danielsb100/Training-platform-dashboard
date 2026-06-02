const prisma = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    
    // Return the value directly or null if not found
    res.json({ data: setting ? setting.value : null });
  } catch (err) {
    console.error('Error fetching system setting:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    res.json({ data: setting.value });
  } catch (err) {
    console.error('Error updating system setting:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

const fs = require('fs');
const path = require('path');

// Magic bytes signatures for image files
const IMAGE_SIGNATURES = {
  'ffd8ff':   { ext: '.jpg',  mime: 'image/jpeg' },    // JPEG
  '89504e47': { ext: '.png',  mime: 'image/png' },     // PNG
  '47494638': { ext: '.gif',  mime: 'image/gif' },     // GIF
  '52494646': { ext: '.webp', mime: 'image/webp' },    // WebP (RIFF header)
};

function validateImageMagicBytes(filePath) {
  const buffer = Buffer.alloc(8);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);
  
  const hex = buffer.toString('hex').toLowerCase();
  
  for (const [signature, info] of Object.entries(IMAGE_SIGNATURES)) {
    if (hex.startsWith(signature)) {
      return info;
    }
  }
  return null;
}

exports.uploadPublicImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Validate the actual file content via magic bytes (not just extension/MIME)
    const imageInfo = validateImageMagicBytes(req.file.path);
    if (!imageInfo) {
      // Delete the suspicious file immediately
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(400).json({ error: 'Invalid file: the uploaded file is not a valid image (JPEG, PNG, GIF, or WebP).' });
    }

    const publicDir = path.join(__dirname, '../public/image/uploads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Use the REAL extension based on magic bytes, not the user-provided one
    const fileName = `carousel_${Date.now()}${imageInfo.ext}`;
    const targetPath = path.join(publicDir, fileName);

    fs.renameSync(req.file.path, targetPath);

    const publicUrl = `/image/uploads/${fileName}`;

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Error uploading public image:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ error: 'Failed to upload public image' });
  }
};
