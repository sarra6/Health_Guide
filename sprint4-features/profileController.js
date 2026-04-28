const HealthProfile = require('../models/HealthProfile');

exports.getProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) profile = await HealthProfile.create({ userId: req.user.id });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const [, [updated]] = await HealthProfile.upsert(
      { ...req.body, userId: req.user.id },
      { returning: true }
    );
    const profile = await HealthProfile.findOne({ where: { userId: req.user.id } });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
