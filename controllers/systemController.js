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
