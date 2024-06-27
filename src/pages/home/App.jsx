// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Acceuil from '../acceuil/acceuil';
import Login from '../login/login';
import PrivateRoute from './PrivateRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié (token présent dans localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false); // Assurez-vous que l'utilisateur est déconnecté si le token est absent
    }
  }, []);

  const handleLogin = () => {
    // Appelé lors de la connexion réussie pour mettre à jour l'état d'authentification
    setIsAuthenticated(true);
  };

  return (
    <div className='fondside'>
      <Router>
        <Switch>
          {/* Route pour la page d'accueil */}
          <PrivateRoute path="/app" component={Acceuil} isAuthenticated={isAuthenticated} />
          {/* Route pour la page de connexion */}
          <Route path="/">
            {isAuthenticated ? <Redirect to="/app" /> : <Login onLogin={handleLogin} />}
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
