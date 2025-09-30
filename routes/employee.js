const express = require("express");
const { records } = require("../models/records");

const router = express.Router();

// Checkin
router.post("/checkin", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const userId = req.user.id;

  const existing = records.find(r => r.userId === userId && r.date === today);
  if (existing && existing.checkin) return res.status(400).json({ msg: "Ya marcaste checkin" });

  records.push({ userId, date: today, checkin: new Date(), checkout: null, workedHours: 0 });
  res.json({ msg: "Checkin registrado" });
});

// Checkout
router.post("/checkout", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const record = records.find(r => r.userId === req.user.id && r.date === today);

  if (!record || !record.checkin) return res.status(400).json({ msg: "No hiciste checkin" });
  if (record.checkout) return res.status(400).json({ msg: "Ya hiciste checkout" });

  record.checkout = new Date();
  record.workedHours = (record.checkout - new Date(record.checkin)) / (1000 * 60 * 60);
  res.json({ msg: "Checkout registrado", workedHours: record.workedHours });
});

// Ver historial propio
router.get("/history", (req, res) => {
  const userHistory = records.filter(r => r.userId === req.user.id);
  res.json(userHistory);
});

module.exports = router;
