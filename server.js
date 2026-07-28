require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Customer = require('./models/Customer');
const Invoice = require('./models/Invoice');
const Quote = require('./models/Quote');

const app = express();

console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? '✅ موجود' : '❌ غير موجود');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📦 قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
});

// دوال الحصول على العداد التالي
async function getNextInvoiceNumber() {
  const last = await Invoice.findOne().sort({ number: -1 });
  return last ? last.number + 1 : 1000;
}
async function getNextQuoteNumber() {
  const last = await Quote.findOne().sort({ number: -1 });
  return last ? last.number + 1 : 1000;
}

// ----- العملاء -----
app.post('/api/customers', async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Customer.findOne({ name: name.trim() });
    if (existing) return res.json(existing);
    const customer = new Customer({ name: name.trim() });
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف عميل
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }
    await Customer.findByIdAndDelete(id);
    res.json({ success: true, message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- الفواتير -----
app.post('/api/invoices', async (req, res) => {
  try {
    const data = req.body;
    let invoice;
    if (data.id) {
      invoice = await Invoice.findById(data.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      Object.assign(invoice, data);
    } else {
      const number = await getNextInvoiceNumber();
      invoice = new Invoice({ ...data, number, type: 'invoice' });
    }
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const { read } = req.query;
    const filter = {};
    if (read === 'true') filter.read = true;
    else if (read === 'false') filter.read = false;
    const invoices = await Invoice.find(filter).sort({ number: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id/read', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    invoice.read = true;
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- عروض السعر -----
app.post('/api/quotes', async (req, res) => {
  try {
    const data = req.body;
    let quote;
    if (data.id) {
      quote = await Quote.findById(data.id);
      if (!quote) return res.status(404).json({ error: 'Quote not found' });
      Object.assign(quote, data);
    } else {
      const number = await getNextQuoteNumber();
      quote = new Quote({ ...data, number, type: 'quote' });
    }
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quotes', async (req, res) => {
  try {
    const { read } = req.query;
    const filter = {};
    if (read === 'true') filter.read = true;
    else if (read === 'false') filter.read = false;
    const quotes = await Quote.find(filter).sort({ number: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotes/:id/read', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Not found' });
    quote.read = true;
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});