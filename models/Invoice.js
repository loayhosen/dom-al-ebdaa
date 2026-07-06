const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  clientName: { type: String, required: true },
  taxNumber: String,
  date: String,
  items: [{ name: String, price: Number, qty: Number }],
  discount: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  note: String,
  total: Number,
  afterDiscount: Number,
  tax: Number,
  finalTotal: Number,
  read: { type: Boolean, default: false },
  type: { type: String, default: 'invoice' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);