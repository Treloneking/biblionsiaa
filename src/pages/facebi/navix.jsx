import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "./bargate.css";
import axios from 'axios';
import Rater from 'react-rater'; // Import Rater from react-rater
import 'react-rater/lib/react-rater.css'; // Import the default CSS for Rater
import './navix.css';
console.clear();

function Navix() {
    const [Books, setBooks] = useState([]);
    const [Prenom, setPrenom] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [genre, setGenre] = useState('');
    const history = useHistory();

    const handleReserver = (book) => {
        if (book && book.Id_livre) {
            history.push({
                pathname: `/app/reservation/${book.Id_livre}`,
                state: { book }
            });
        } else {
            console.error('Book id is undefined:', book);
        }
    };

    useEffect(() => {
        const storedPrenom = localStorage.getItem('Prenom');
        setPrenom(storedPrenom);
        fetchBooks();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [genre]);

    const fetchBooks = () => {
<<<<<<< HEAD
        let url = 'http://10.11.100.2:8000/app';
=======
        let url = 'http://localhost:5000/app';
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
        if (genre) {
            url += `?genre=${genre}`;
        }

        axios.get(url)
            .then(response => {
                const books = response.data;
                const aggregatedBooks = books.reduce((acc, book) => {
                    const existingBook = acc.find(b => b.Id_livre === book.Id_livre);
                    if (existingBook) {
                        existingBook.genres.push(book.Genre_Id_genre);
                    } else {
                        acc.push({ ...book, genres: [book.Genre_Id_genre] });
                    }
                    return acc;
                }, []);
                setBooks(aggregatedBooks);
            })
            .catch(error => {
                console.error('Error fetching books:', error);
            });
    };

    const openPopup = (book) => {
        setSelectedBook(book);
        setShowFullSummary(false);
    };

    const closePopup = () => {
        setSelectedBook(null);
    };

    const toggleFullSummary = () => {
        setShowFullSummary(!showFullSummary);
    };

    const truncateSummary = (summary, limit) => {
        if (!summary) return '';
        if (summary.length <= limit) {
            return summary;
        }
        return summary.slice(0, limit) + '... ';
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleGenreChange = (event) => {
        setGenre(event.target.value);
    };

    const filteredBooks = Books.filter(book =>
        book.Titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: Math.min(filteredBooks.length, 4),
        slidesToScroll: 4,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(filteredBooks.length, 3),
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: Math.min(filteredBooks.length, 2),
                    slidesToScroll: 1,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <>
            <div className='intro'>
                <a className='texte'>Découvrez un monde de connaissances à portée de clic! Notre bibliothèque en ligne 
                <br/>vous offre un accès illimité à une vaste collection de livres, articles, et ressources académiques,
                <br/> disponible 24 heures sur 24, 7 jours sur 7. 
                </a>
            </div>
            <div className='face-biblio'> 
                <div className='title'><h2>Livres proposés</h2></div>

                <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                <select onChange={handleGenreChange} value={genre} className="genre-select">
                    <option value="">Tous les genres</option>
                    <option value="Biographie">Biographie</option>
                    <option value="Business">Business</option>
                    <option value="Communication">Communication</option>
                    <option value="Développement personnel">Développement personnel</option>
                    <option value="Éducation">Éducation</option>
                    <option value="Entrepreneuriat">Entrepreneuriat</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Finance">Finance</option>
                    <option value="Finance personnelle">Finance personnelle</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Innovation">Innovation</option>
                    <option value="Inspiration">Inspiration</option>
                    <option value="Management">Management</option>
                    <option value="Médecine">Médecine</option>
                    <option value="Motivation">Motivation</option>
                    <option value="Non-fiction">Non-fiction</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Productivité">Productivité</option>
                    <option value="Psychologie">Psychologie</option>
                    <option value="Science">Science</option>
                    <option value="Technologie">Technologie</option>
                </select>

                {Array.isArray(filteredBooks) && filteredBooks.length > 0 ? (
                    filteredBooks.length === 1 ? (
                        <div className="single-book">
                            <div className="card" onClick={() => openPopup(filteredBooks[0])}>
                                <img src={`data:image/jpeg;base64,${filteredBooks[0].photo}`} alt={filteredBooks[0].Titre} className="book-image" />
                                <h3>{filteredBooks[0].Titre}</h3>
                                <p>{filteredBooks[0].Auteur}</p>
                            </div>
                        </div>
                    ) : (
                        <Slider {...settings}>
                            {filteredBooks.map((item, index) => (
                                <div key={index} className="card" onClick={() => openPopup(item)}>
                                    <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                    <h3>{item.Titre}</h3>
                                    <p>{item.Auteur}</p>
                                </div>
                            ))}
                        </Slider>
                    )
                ) : (
                    <p>Aucun livre disponible sur ce titre</p>
                )}
            </div>

            {selectedBook && (
                <div className="popup">
                    <div className="popup-inner">
                        <button className="close-btn" onClick={closePopup}>&times;</button>
                        <div className="popup-content">
                            <img src={`data:image/jpeg;base64,${selectedBook.photo}`} alt={selectedBook.Titre} />
                            <div className="popup-details">
                                <h2>{selectedBook.Titre}</h2>
                                <p><strong>Auteur:</strong> {selectedBook.Auteur}</p>
                                <p><strong>Genres:</strong> {selectedBook.genres.join(', ')}</p>
                                <p><strong>Date de publication:</strong> {selectedBook.Date_publication}</p>
                                <p>
                                    <strong>Résumé: </strong> 
                                    {showFullSummary ? selectedBook.resume : truncateSummary(selectedBook.resume, 100)}
                                    {!showFullSummary && selectedBook.resume && selectedBook.resume.length > 100 && (
                                        <span className="more-link" onClick={toggleFullSummary}>plus</span>
                                    )}
                                </p>
                                {/* Add the rating component here */}
                                <strong>Comment avez vous trouvez le livre? </strong>
                                <div className="rating">
                                    <Rater total={5} rating={selectedBook.rating || 0} interactive={true} />
                                </div>
                            </div>
                            <div className="popup-footer">
                                <button className='lire'>Lire</button>
                                <button className='reserver' onClick={() => handleReserver(selectedBook)}>Réserver</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navix;
