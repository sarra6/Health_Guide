const Medication = require('../models/Medication');

exports.getAll = async (req, res) => {
  try {
    const meds = await Medication.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(meds);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const med = await Medication.create({ ...req.body, userId: req.user.id });
    res.status(201).json(med);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const [n] = await Medication.update(req.body, { where: { id: req.params.id, userId: req.user.id } });
    if (!n) return res.status(404).json({ error: 'Not found.' });
    res.json(await Medication.findByPk(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.markTaken = async (req, res) => {
  try {
    await Medication.update({ takenToday: true, lastTaken: new Date() }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Marked as taken.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Medication.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
