import fetch from 'node-fetch';

const apiKey = '114c5875dded01477a93591386cbf149';
const url = new URL('https://gnews.io/api/v4/search');

// Test different parameters
url.searchParams.append('q', 'stock market OR "S&P 500" OR nasdaq OR "dow jones"');
url.searchParams.append('lang', 'en');
url.searchParams.append('country', 'us');
url.searchParams.append('max', '10');
url.searchParams.append('sortby', 'publishedAt');
// Try without date filter first
url.searchParams.append('apikey', apiKey);

console.log('Testing URL:', url.toString());

fetch(url)
  .then(res => res.json())
  .then(data => console.log('Results:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('Error:', err)); 