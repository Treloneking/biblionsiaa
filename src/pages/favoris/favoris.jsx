import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './favoris.css'; // Assurez-vous d'avoir le fichier CSS pour le style

const Favoris = () => {
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const userId = localStorage.getItem('Id_user'); // Suppose que l'ID utilisateur est stocké dans le local storage
                const response = await axios.get(`/app/favoris`, {
                    params: {
                        userId: userId,
                        page: currentPage + 1,
                        limit: itemsPerPage
                    }
                });
                setFavorites(response.data.favorites);
                setPageCount(Math.ceil(response.data.total / itemsPerPage));
            } catch (error) {
                console.error('Erreur lors de la récupération des livres favoris:', error);
            }
        };

        fetchFavorites();
    }, [currentPage]);

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    return (
        <div>
            <h2>Mes Livres Favoris</h2>
            <div className="cards-container">
                {favorites.map(book => (
                    <div key={book.Id_livre} className="card">
                        <img src={`data:image/jpeg;base64,${book.photo}`} alt={book.titre} />
                        <div className="card-body">
                            <h5 className="card-title">{book.resume}</h5>
                            <p className="card-text">{book.Auteur}</p>
                        </div>
                    </div>
                ))}
            </div>
            <ReactPaginate
                previousLabel={'Précédent'}
                nextLabel={'Suivant'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
            />
        </div>
    );
};

export default Favoris;
