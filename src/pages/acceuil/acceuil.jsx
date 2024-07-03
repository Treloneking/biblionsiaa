// Acceuil.jsx
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from '../../component/navbar/navbar';
import Registerperso from '../enregistrement/registerperso';
import Notif from '../../component/notif/notif';
import Navix from '../facebi/navix';
import SidebarData from '../../component/sidebar/SidebarData'; // Import par défaut de SidebarData
import './acceuil.css';
import Proposition from '../proposition/Proposition';
import Demande from '../demnde/demande';
import Livre from '../Ajout livre/livre';
import Reserver from '../reservation/reservation';


function Acceuil() {
  return (
    <div>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/app/acceuil" component={Navix} />
          <Route path="/app/proposition" component={Proposition} />
          <Route path="/app/reservation" component={Registerperso} />
          <Route path="/app/notification" component={Notif} />
          <Route path="/app/demande" component={Demande}/>
          <Route path="/app/ajout-livre" component={Livre}/>
          <Route path="/app/reserver" component={Reserver}/>
        </Switch>
      </Router>
    </div>
  );
}

export default Acceuil;
