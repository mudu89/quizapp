import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';
import Layout from './components/common/Layout';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
 // <React.StrictMode>
    <Layout>
        
      <Router>
          <App />
      </Router>
      
    </Layout>
  //</React.StrictMode>
);