import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Utilisation de useParams pour récupérer le matricule

// Assurez-vous d'importer le fichier CSS correspondant

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Archiveplus() {
  const [archives, setArchives] = useState([]);
  const [error, setError] = useState(null);
  const { matricule } = useParams(); // Récupérer le matricule de l'URL
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/app/archiveplus?matricule=${matricule}`);
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setArchives(response.data);
        }
      } catch (error) {
        console.error('Error fetching archives:', error);
        setError('Une erreur s\'est produite lors de la récupération des archives.');
      }
    };

    fetchData();
  }, [matricule]);

  const totalPages = Math.ceil(archives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, archives.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  return (
    <div className='search-pag'>
      <div className='archiveplus'>
        <h1>Archive:</h1>
        <div className="results">
          {error && <p className="error">{error}</p>}
          {archives.length > 0 ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Contrat</th>
                    <th>Sexe</th>
                    <th>Direction</th>
                    <th>Date debut Agence</th>
                    <th>Date d'archive</th>
                    <th>STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {archives.slice(startIndex, endIndex).map((archive, index) => (
                    <tr key={index}>
                      <td>{archive.Mat_employe}</td>
                      <td>{archive.Nom_employe}</td>
                      <td>{archive.Prenom_employe}</td>
                      <td>{archive.Type_contrat_Id_type_contrat}</td>
                      <td>{archive.Sexe}</td>
                      <td>{archive.Direction_code}</td>
                      <td>{formatDate(archive.Date_debut_c)}</td>
                      <td>{formatDate(archive.archived_date)}</td>
                      <td className={new Date(archive.Date_fin_c) <= new Date() ? 'bg-danger' : 'bg-success'}>
                        {new Date(archive.Date_fin_c) <= new Date() ? "INACTIF" : "ACTIF"}
                      </td>
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
    </div>
  );
}

export default Archiveplus;
