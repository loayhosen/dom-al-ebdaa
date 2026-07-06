// test.js - لاختبار الاتصال بقاعدة البيانات
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 جاري محاولة الاتصال بقاعدة البيانات...');
console.log('📌 الرابط:', process.env.MONGO_URI ? '✅ موجود' : '❌ غير موجود');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ ✅ ✅ نجح الاتصال بقاعدة البيانات!');
  console.log(`📦 قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
  console.log(`🔗 المضيف: ${mongoose.connection.host}`);
  process.exit(0);
})
.catch(err => {
  console.log('❌ ❌ ❌ فشل الاتصال:');
  console.log(err.message);
  process.exit(1);
});