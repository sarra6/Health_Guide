const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');

exports.getAll = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { userId: req.user.id },
      order: [['date', 'ASC']]
    });
    res.json(appts);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getUpcoming = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { userId: req.user.id, status: 'upcoming', date: { [Op.gte]: new Date() } },
      order: [['date', 'ASC']],
      limit: 5
    });
    res.json(appts);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, userId: req.user.id });
    res.status(201).json(appt);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const [n] = await Appointment.update(req.body, { where: { id: req.params.id, userId: req.user.id } });
    if (!n) return res.status(404).json({ error: 'Not found.' });
    res.json(await Appointment.findByPk(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
