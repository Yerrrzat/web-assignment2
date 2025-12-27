const button = document.getElementById('generate-btn');
const statusEl = document.getElementById('status');
const userCard = document.getElementById('user-card');
const countryCard = document.getElementById('country-card');
const exchangeCard = document.getElementById('exchange-card');
const newsGrid = document.getElementById('news-grid');

function setStatus(message) {
  statusEl.textContent = message;
}

function formatDate(isoDate) {
  if (!isoDate) {
    return 'N/A';
  }
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderUser(data) {
  userCard.innerHTML = `
    <div class="user-header">
      <img src="${data.profilePic}" alt="Profile photo" />
      <div>
        <h3>${data.firstName} ${data.lastName}</h3>
        <p class="muted">${data.gender} ${data.age} years</p>
      </div>
    </div>
    <div class="data-grid">
      <div>
        <p class="label">Date of birth</p>
        <p>${formatDate(data.dob)}</p>
      </div>
      <div>
        <p class="label">City</p>
        <p>${data.city}</p>
      </div>
      <div>
        <p class="label">Country</p>
        <p>${data.country}</p>
      </div>
      <div>
        <p class="label">Address</p>
        <p>${data.address}</p>
      </div>
    </div>
  `;
}

function renderCountry(country) {
  const languageList = country.languages && country.languages.length ? country.languages.join(', ') : 'N/A';
  const currencyLabel = country.currency
    ? `${country.currency.code} ${country.currency.name}`
    : 'N/A';

  countryCard.innerHTML = `
    <div class="country-header">
      <div>
        <h3>${country.name}</h3>
        <p class="muted">Capital: ${country.capital}</p>
      </div>
      ${country.flag ? `<img src="${country.flag}" alt="Flag of ${country.name}" />` : ''}
    </div>
    <div class="data-grid">
      <div>
        <p class="label">Languages</p>
        <p>${languageList}</p>
      </div>
      <div>
        <p class="label">Currency</p>
        <p>${currencyLabel}</p>
      </div>
    </div>
  `;
}

function renderExchange(exchange) {
  if (!exchange.available) {
    exchangeCard.innerHTML = `
      <h3>Exchange Rates</h3>
      <p class="muted">Exchange rate data is unavailable. Check your API key.</p>
    `;
    return;
  }

  exchangeCard.innerHTML = `
    <h3>Exchange Rates</h3>
    <p class="rate">1 ${exchange.base} = ${exchange.toUSD?.toFixed(2) || 'N/A'} USD</p>
    <p class="rate">1 ${exchange.base} = ${exchange.toKZT?.toFixed(2) || 'N/A'} KZT</p>
  `;
}

function renderNews(news) {
  if (!news.length) {
    newsGrid.innerHTML = '<p class="muted">No headlines found. Try again.</p>';
    return;
  }

  newsGrid.innerHTML = news
    .map(article => {
      const image = article.image
        ? `<img src="${article.image}" alt="${article.title}" />`
        : '<div class="image-placeholder">No image</div>';
      return `
        <article class="news-card">
          ${image}
          <div class="news-body">
            <h3>${article.title}</h3>
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">Read full article</a>
          </div>
        </article>
      `;
    })
    .join('');
}

async function getRandomUserReport() {
  setStatus('Fetching data...');
  button.disabled = true;

  try {
    const response = await fetch('/api/user-report');
    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();
    renderUser(data.userData);
    renderCountry(data.countryData);
    renderExchange(data.exchangeData);
    renderNews(data.newsData);
    setStatus('Report ready.');
  } catch (error) {
    setStatus('Something went wrong. Please try again.');
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', getRandomUserReport);
