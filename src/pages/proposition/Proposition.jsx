import React, { useState } from 'react';
import axios from 'axios';
import './Proposition.css';
console.clear();
const Proposition = () => {
  const [titre_livre, setTitle] = useState('');
  const [auteur, setAuthor] = useState('');
  const [genre, setGenre] = useState('');

  const handleProposalSubmit = (e) => {
    e.preventDefault();

    // Récupérer les informations de l'utilisateur à partir du local storage
    const Id_user = localStorage.getItem('Id_user');
    const Prenom = localStorage.getItem('Prenom');
    const Nom = localStorage.getItem('Nom');
    const user_id_user = Id_user;
    const user_name = `${Prenom} ${Nom}`;
    const prenom = Prenom;

    if (!user_id_user || !user_name || !prenom) {
      alert('Erreur: Les informations de l\'utilisateur sont manquantes.');
      return;
    }

    // Créer la charge utile (payload) pour l'API
    const proposalData = {
      titre_livre,
      auteur,
      genre,
      user_id_user,
      user_name,
      prenom
    };

    // Envoyer la requête au backend
    axios.post('http://10.11.100.2:8000/app/proposition', proposalData)
      .then(response => {
        alert('Livre proposé avec succès!');
        // Réinitialiser le formulaire après le succès
        setTitle('');
        setAuthor('');
        setGenre('');
      })
      .catch(error => {
        console.error('Erreur lors de la proposition du livre:', error);
        alert('Erreur lors de la proposition du livre. Veuillez réessayer.');
      });
  };

  return (
    <div className="proposal-page-container">
      <div className="proposal-page-content">
        <h2>Proposer un Livre</h2>
        <form onSubmit={handleProposalSubmit} className="proposal-form">
          <label>Titre:</label>
          <input
            type="text"
            name="title"
            value={titre_livre}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-input"
          />
          <label>Auteur:</label>
          <input
            type="text"
            name="author"
            value={auteur}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="text-input"
          />
          <label>Genre:</label>
          <input
            type="text"
            name="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            className="text-input"
          />
          <button type="submit" className="proposal-button">Proposer</button>
        </form>
      </div>
    </div>
  );
};

export default Proposition;
