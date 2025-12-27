const axios = require('axios');

const RANDOM_USER_URL = 'https://randomuser.me/api/';
const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/name/';
const EXCHANGE_URL = 'https://v6.exchangerate-api.com/v6';
const NEWS_URL = 'https://newsapi.org/v2/everything';

const RESTCOUNTRIES_KEY = process.env.RESTCOUNTRIES_API_KEY || process.env.RESTCOUNTRIES_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const EXCHANGE_RATE_KEY = process.env.EXCHANGE_RATE_KEY || '';

function pickFirst(values, fallback = 'N/A') {
  if (!values || values.length === 0) {
    return fallback;
  }
  return values[0];
}

async function fetchCountryRaw(countryName) {
  const headers = RESTCOUNTRIES_KEY ? { 'x-api-key': RESTCOUNTRIES_KEY } : {};
  try {
    const response = await axios.get(`${REST_COUNTRIES_URL}${encodeURIComponent(countryName)}`, {
      params: { fullText: true },
      headers
    });
    return response.data[0];
  } catch (error) {
    try {
      const response = await axios.get(`${REST_COUNTRIES_URL}${encodeURIComponent(countryName)}`, {
        headers
      });
      return response.data[0];
    } catch (fallbackError) {
      return null;
    }
  }
}

function cleanCountryData(country) {
  if (!country) {
    return {
      name: 'N/A',
      capital: 'N/A',
      languages: [],
      currency: { code: 'N/A', name: 'N/A', symbol: '' },
      flag: ''
    };
  }

  const currencyCode = pickFirst(Object.keys(country.currencies || {}), 'N/A');
  const currencyInfo = currencyCode !== 'N/A' ? country.currencies[currencyCode] : null;

  return {
    name: country.name?.common || 'N/A',
    capital: pickFirst(country.capital, 'N/A'),
    languages: Object.values(country.languages || {}),
    currency: {
      code: currencyCode,
      name: currencyInfo?.name || 'N/A',
      symbol: currencyInfo?.symbol || ''
    },
    flag: country.flags?.svg || country.flags?.png || ''
  };
}

async function fetchExchangeRates(currencyCode) {
  if (!EXCHANGE_RATE_KEY || currencyCode === 'N/A') {
    return { available: false, base: currencyCode, toUSD: null, toKZT: null };
  }

  try {
    const response = await axios.get(`${EXCHANGE_URL}/${EXCHANGE_RATE_KEY}/latest/${currencyCode}`);
    const rates = response.data.conversion_rates || {};

    return {
      available: true,
      base: currencyCode,
      toUSD: rates.USD || null,
      toKZT: rates.KZT || null
    };
  } catch (error) {
    return { available: false, base: currencyCode, toUSD: null, toKZT: null };
  }
}

async function fetchNews(countryName) {
  if (!NEWS_API_KEY) {
    return [];
  }

  try {
    const response = await axios.get(NEWS_URL, {
      params: {
        qInTitle: countryName,
        language: 'en',
        pageSize: 20,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY
      }
    });

    const lowerCountry = countryName.toLowerCase();
    return (response.data.articles || [])
      .filter(article => (article.title || '').toLowerCase().includes(lowerCountry))
      .map(article => ({
        title: article.title,
        image: article.urlToImage,
        description: article.description,
        url: article.url
      }))
      .slice(0, 5);
  } catch (error) {
    return [];
  }
}

async function buildUserReport() {
  const userRes = await axios.get(RANDOM_USER_URL);
  const user = userRes.data.results[0];

  const userData = {
    firstName: user.name.first,
    lastName: user.name.last,
    gender: user.gender,
    profilePic: user.picture.large,
    age: user.dob.age,
    dob: user.dob.date,
    city: user.location.city,
    country: user.location.country,
    address: `${user.location.street.number} ${user.location.street.name}`
  };

  const countryRaw = await fetchCountryRaw(userData.country);
  const countryData = cleanCountryData(countryRaw);
  const exchangeData = await fetchExchangeRates(countryData.currency.code);
  const newsData = await fetchNews(userData.country);

  return { userData, countryData, exchangeData, newsData };
}

module.exports = { buildUserReport };
