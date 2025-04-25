const APP_ENV = process.env.REACT_APP_APP_ENV || 'development'; // Default to 'development'

export const API_URL = APP_ENV === 'production' ? process.env.API_URL : 'http://127.0.0.1:8000';
  
export const WS_URL = APP_ENV === 'production' ? process.env.WS_URL : 'ws://127.0.0.1:8000/ws';