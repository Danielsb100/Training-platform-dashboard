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

exports.uploadPublicImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const publicDir = path.join(__dirname, '../public/image/uploads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const fileExt = path.extname(req.file.originalname) || '.png';
    const fileName = `carousel_${Date.now()}${fileExt}`;
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
