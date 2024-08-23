// Acceuil.jsx
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from '../../component/navbar/navbar';
import Registerperso from '../enregistrement/registerperso';

import Navix from '../facebi/navix';
import './acceuil.css';
import Proposition from '../proposition/Proposition';
import Demande from '../demnde/demande';
import Livre from '../Ajout livre/livre';
import Reserver from '../reservation/reservation';
<<<<<<< HEAD
import SeLivre from '../sortie/sortie';
=======
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598

function Acceuil() {
  return (
    <div>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/app/acceuil" component={Navix} />
          <Route path="/app/proposition" component={Proposition} />
          <Route path="/app/reservation" component={Registerperso} />
          <Route path="/app/demande" component={Demande}/>
          <Route path="/app/ajout-livre" component={Livre}/>
          <Route path="/app/reserver" component={Reserver}/>
<<<<<<< HEAD
          <Route path="/app/selivre" component={SeLivre}/>
=======
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
        </Switch>
      </Router>
    </div>
  );
}

export default Acceuil;