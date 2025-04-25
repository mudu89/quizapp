console.log(process.env)

const APP_ENV = process.env.REACT_APP_APP_ENV || 'development'; // Default to 'development'

console.log('APP_ENV:', APP_ENV);
console.log('API_URL:', process.env.REACT_APP_API_URL);
console.log('WS_URL:', process.env.REACT_APP_WS_URL);

export const API_URL = APP_ENV === 'production' ? process.env.REACT_APP_API_URL : 'http://127.0.0.1:8000';
  
export const WS_URL = APP_ENV === 'production' ? process.env.REACT_APP_WS_URL : 'ws://127.0.0.1:8000/ws';