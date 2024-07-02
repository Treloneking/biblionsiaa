// login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './login.css';
import logo from './../../assets/images/logo (1).png';

const Login = ({ onLogin }) => {
  const [Id_user, setIdUser] = useState('');
  const [Mot_de_passe, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { Id_user, Mot_de_passe });
      if (response.status === 200) {
        // Stocker le token JWT dans le localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('Prenom',response.data.Prenom);
        localStorage.setItem('Nom',response.data.Nom);
        localStorage.setItem('Id_user',response.data.Id_user);
        // Appeler la fonction onLogin pour mettre à jour l'état d'authentification dans App.jsx
        onLogin();
        // Rediriger vers /app en cas de succès
        history.push('/app/acceuil');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Identifiants invalides');
      } else {
        setError('Erreur de connexion au serveur');
      }
    }
  };

  return (
    <div className='loginBackground'>
      <form onSubmit={handleSubmit} className='formulaireconnect'>
        <div className='logo1'>
          <br /><br />
          <img src={logo} width={100} height={100} alt="Logo" />
        </div>
        <div>
          <label htmlFor="Id_user">ID Utilisateur:</label>
          <input
            type="text"
            id="Id_user"
            value={Id_user}
            onChange={(e) => setIdUser(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="Mot_de_passe">Mot de Passe:</label>
          <input
            type="password"
            id="Mot_de_passe"
            value={Mot_de_passe}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className='bouton'>Se Connecter</button>
      </form>
    </div>
  );
};

export default Login;
