// API configuration for development and production
const config = {
    API_BASE_URL: import.meta.env.PROD 
      ? 'https://hyperformrscraper-production-f882.up.railway.app'  // Your Railway URL
      : 'http://localhost:5003'
  };
  
  export default config;