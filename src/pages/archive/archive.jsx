import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory} from 'react-router-dom';
import './../recherche/recherche.css'
function Archive() {
  const [employes, setemployes] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/archive');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setemployes(response.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Une erreur s\'est produite lors de la récupération des employes.');
      }
    };
  
    fetchData();
  }, []); 
  const totalPages = Math.ceil(employes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, employes.length);
  const handleMoreInfo = (matricule) => {
    history.push(`/app/archiveplus?matricule=${matricule}`);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };
  return (<div className='search-pag'>
    <h1>Archive:</h1>
    
    <div className="results">
{error && <p className="error">{error}</p>}
{employes.length > 0 ? (
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
          <th>Telephone</th>
          <th>STATUT</th>
          <th>&nbsp;&nbsp;&nbsp;...</th>
        </tr>
      </thead>
      <tbody>
        {employes.slice(startIndex, endIndex).map((employe, index) => (
          <tr key={index}>
            <td>{employe.Mat_employe}</td>
            <td>{employe.Nom_employe}</td>
            <td>{employe.Prenom_employe}</td>
            <td>{(employe.Type_contrat_Id_type_contrat)}</td>
            <td>{employe.Sexe}</td>
            <td>{employe.Direction_code}</td>
            <td>{employe.Telephone}</td>
            <td className={new Date(employe.Date_fin_c) <= new Date() ? 'bg-danger' : 'bg-success'}>
                        {new Date(employe.Date_fin_c) <= new Date() ? "INACTIF" : "ACTIF"}
                    </td>
            <td>
              <button  className="bouton" onClick={() => handleMoreInfo(employe.Mat_employe)}>Plus</button>
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
);
}

export default Archive;


