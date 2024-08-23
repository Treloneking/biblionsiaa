import React, { useState, useEffect } from 'react';
import axios from 'axios';
console.clear();


function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Reserver() {
  const [emprunts, setEmprunt] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut
  

  useEffect(() => {
    const fetchData = async () => {
      try {
<<<<<<< HEAD
        const response = await axios.get('http://10.11.100.2:8000/app/reserver');
=======
        const response = await axios.get('http://localhost:5000/app/reserver');
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setEmprunt(response.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Une erreur s\'est produite lors de la récupération des emprunts.');
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(emprunts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, emprunts.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };



  return (
    <div className='search-pag'>
      <h1>Reservation de livre:</h1>

      <div className="results">
        {error && <p className="error">{error}</p>}
        {emprunts.length > 0 ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Titre du livre</th>
                  <th>Date emprunt</th>
                  <th>Date retour</th>
                  <th>Nom emprunteur</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.slice(startIndex, endIndex).map((emprunt, index) => (
                  <tr key={index}>
                    <td>{emprunt.Titre}</td>
                    <td>{formatDate(emprunt.date_emprunt)}</td>
                    <td>{formatDate(emprunt.date_retour)}</td>
                    <td>{emprunt.Nom} {emprunt.Prenom}</td>
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

export default Reserver;
