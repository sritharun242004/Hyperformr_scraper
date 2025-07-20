// API configuration for development and production
const config = {
    API_BASE_URL: import.meta.env.PROD 
      ? 'https://your-railway-app.up.railway.app'  // We'll replace this with actual Railway URL
      : 'http://localhost:5003'
  };
  
  export default config;