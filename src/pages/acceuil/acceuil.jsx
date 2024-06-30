import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from '../../component/navbar/navbar';
import Registerperso from '../enregistrement/registerperso';
import Notif from '../../component/notif/notif';
import Navix from '../facebi/navix';
import Favoris from '../favoris/favoris';
import './acceuil.css';


function Acceuil() {
  return (
    <div>
      <Router>
        <Navbar />
        
        <Switch>
          <Route path ="/app/acceuil"component={Navix}/> 
          <Route path="/app/favoris" component={Favoris} />
          <Route path="/app/reservation" component={Registerperso} />
          <Route path="/app/notification" component={Notif} />
        </Switch>
      </Router>
      
    </div>
  );
}

export default Acceuil;
