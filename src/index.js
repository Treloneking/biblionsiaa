import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './dont touch/reportWebVitals';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import App from './pages/home/App';
<<<<<<< HEAD
// console.clear();
=======
console.clear();
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
// Configurer Axios pour inclure le token dans les en-têtes de toutes les requêtes
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
  <React.StrictMode>
      <App />
  </React.StrictMode>
  </Router>
);

reportWebVitals();
