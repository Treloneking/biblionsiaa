import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Acceuil from '../acceuil/acceuil';
import Login from '../login/login';
import PrivateRoute from './PrivateRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className='fondside'>
      <Router>
        <Switch>
          <PrivateRoute path="/app" component={Acceuil} isAuthenticated={isAuthenticated} />
          <Route path="/">
            {isAuthenticated ? <Redirect to="/app" /> : <Login onLogin={handleLogin} />}
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
