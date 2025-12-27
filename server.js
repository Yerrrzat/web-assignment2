const express = require('express');
const path = require('path');
require('dotenv').config();

const { buildUserReport } = require('./core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/user-report', async (req, res) => {
  try {
    const report = await buildUserReport();
    res.json(report);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
