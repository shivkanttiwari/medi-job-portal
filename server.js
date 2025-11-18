// Simple contact API using nodemailer
require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve index.html and styles.css

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify transporter
transporter.verify().then(() => {
  console.log('SMTP transporter verified');
}).catch(err => {
  console.warn('SMTP verify failed:', err.message);
});

app.get('/ping', (req, res) => res.send('ok'));

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).send('Missing name, email or message');
  }

  const to = process.env.TO_EMAIL || 'shivkant.tiwari123@gmai.com';
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Website Contact" <${from}>`,
    to,
    subject: `Website contact from ${name || 'Unknown'}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
      '',
      `Sent at: ${new Date().toISOString()}`
    ].join('\n')
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Message sent');
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).send('Failed to send email');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});