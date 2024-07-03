import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './demande.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Demande() {
  const [propositions, setPropositions] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/demande');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setPropositions(response.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Une erreur s\'est produite lors de la récupération des propositions.');
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(propositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, propositions.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  const handleMoreInfoClick = async (propositionId) => {
    try {
      const response = await axios.get(`http://localhost:5000/app/okay/${propositionId}`);
      // Utilisez la réponse pour afficher les détails supplémentaires, par exemple en ouvrant une modal ou une nouvelle page
      console.log('Détails de la proposition:', response.data);
    } catch (error) {
      console.error('Error fetching proposition details:', error);
      // Gérer les erreurs de requête ici
    }
  };

  return (
    <div className='search-pag'>
      <h1>Proposition de livre:</h1>

      <div className="results">
        {error && <p className="error">{error}</p>}
        {propositions.length > 0 ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Titre du livre</th>
                  <th>Date de la demande</th>
                  <th>Nom lecteur</th>
                  <th>Auteur</th>
                  <th>Genre</th>
                </tr>
              </thead>
              <tbody>
                {propositions.slice(startIndex, endIndex).map((proposition, index) => (
                  <tr key={index}>
                    <td>{proposition.titre_livre}</td>
                    <td>{formatDate(proposition.date_demande)}</td>
                    <td>{proposition.user_name}</td>
                    <td>{proposition.auteur}</td>
                    <td>{proposition.genre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              {currentPage > 1 && (
                <button onClick={() => handlePageChange(currentPage - 1)}>Précédent</button>
              )}
              <span>{currentPage}</span>
              {currentPage < totalPages && (
                <button onClick={() => handlePageChange(currentPage + 1)}>Suivant</button>
              )}
            </div>

            <div>
              <label htmlFor="itemsPerPage">Items par page:</label>
              <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        ) : (
          <p>Aucun résultat trouvé</p>
        )}
      </div>
    </div>
  );
}

export default Demande;
