// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('axios-rate-limit');
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();
// Marketstack API key from env var
const API_KEY = process.env.MARKETSTACK_API_KEY;
if (!API_KEY) {
  console.warn('Warning: MARKETSTACK_API_KEY is not set. Requests will fail.');
}

// Keep Marketstack HTTP base (free tier uses HTTP)
const BASE_URL = 'http://api.marketstack.com/v1';

// Configure axios with rate limiting
const http = rateLimit(axios.create({
  headers: {
    'User-Agent': 'TrueDalal/1.0 (+https://yourdomain.example)',
    'Accept': 'application/json',
  },
}), {
  maxRequests: 10,
  perMilliseconds: 60000,
});

const retryRequest = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const status = error.response?.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Retrying request (${i + 1}/${retries}) after ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
};

app.use(cors()); // you may restrict this later to your frontend URL
app.use(express.json());

// Proxy endpoint example: fetch EOD for one symbol
app.get('/api/eod/latest', async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols query parameter required' });

  try {
    const url = `${BASE_URL}/eod/latest`;
    const resp = await retryRequest(() => http.get(url, {
      params: { access_key: API_KEY, symbols },
    }));
    return res.json(resp.data);
  } catch (err) {
    console.error('Error fetching eod latest:', err.message);
    if (err.response?.status === 429) return res.status(429).json({ error: 'Rate limit exceeded' });
    return res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Example endpoint that matches your original /api/stocks (7-day history + tickers)
app.get('/api/stocks', async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols query parameter required' });

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const eodResponse = await retryRequest(() =>
      http.get(`${BASE_URL}/eod`, {
        params: {
          access_key: API_KEY,
          symbols,
          date_from: sevenDaysAgo,
          date_to: today,
          limit: 30,
        },
      })
    );

    const tickerResponse = await retryRequest(() =>
      http.get(`${BASE_URL}/tickers`, {
        params: { access_key: API_KEY, symbols },
      })
    );

    return res.json({
      eodData: eodResponse.data.data || [],
      tickerData: tickerResponse.data.data || [],
    });
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait.' });
    }
    return res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
