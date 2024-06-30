import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './../../component/navbar/navbar.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import '../facebi/navix.css';
import axios from 'axios';

function Navix() {
    const [Books, setBooks] = useState([]);
    const [sidebar, setSidebar] = useState(false);
    const [Prenom, setPrenom] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const history = useHistory();
    const showSidebar = () => setSidebar(!sidebar);

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

        axios.get('http://localhost:5000/app')
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => {
                console.error('Error fetching books:', error);
            });
    }, []);

    const handleLogOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('Prenom');
        window.location.reload();
    };

    const openPopup = (book) => {
        setSelectedBook(book);
        setShowFullSummary(false); // Reset show full summary when opening a new popup
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

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
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
                <br/> disponible 24 heures sur 24, 7 jours sur 7. Que vous soyez un étudiant, un chercheur, ou simplement
                <br/> un passionné de lecture, vous trouverez ici tout ce dont vous avez besoin pour nourrir votre esprit et enrichir votre savoir.
                </a>
            </div>
            <div className='face-biblio'> 
                <div className='title'><h2>Livres proposés</h2></div>

                {Array.isArray(Books) && Books.length > 0 ? (
                    <Slider {...settings}>
                        {Books.map((item, index) => (
                            <div key={index} className="card" onClick={() => openPopup(item)}>
                                <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                <h3>{item.Titre}</h3>
                                <p>{item.Auteur}</p>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>Aucun livre disponible</p>
                )}
                
                <div className='middle'>
                    <h1>A la découverte du milieu professionnel avec des écritures</h1>
                </div>
                <div className='title'><h2>Entrepreneuriat</h2></div>
                {Array.isArray(Books) && Books.length > 0 ? (
                    <Slider {...settings}>
                        {Books.map((item, index) => (
                            <div key={index} className="card" onClick={() => openPopup(item)}>
                                <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                <h3>{item.Titre}</h3>
                                <p>{item.Auteur}</p>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>Aucun livre disponible</p>
                )}
                <div className='title'><h2>Biographie</h2></div>
                {Array.isArray(Books) && Books.length > 0 ? (
                    <Slider {...settings}>
                        {Books.map((item, index) => (
                            <div key={index} className="card" onClick={() => openPopup(item)}>
                                <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                <h3>{item.Titre}</h3>
                                <p>{item.Auteur}</p>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>Aucun livre disponible</p>
                )}
                <div className='title'><h2>Finance</h2></div>
                {Array.isArray(Books) && Books.length > 0 ? (
                    <Slider {...settings}>
                        {Books.map((item, index) => (
                            <div key={index} className="card" onClick={() => openPopup(item)}>
                                <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                <h3>{item.Titre}</h3>
                                <p>{item.Auteur}</p>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>Aucun livre disponible</p>
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
                                <p><strong>Genre:</strong> {selectedBook.Genre_Id_genre}</p>
                                <p><strong>Date de publication:</strong> {selectedBook.Date_publication}</p>
                                <p>
                                    <strong>Résumé:</strong> 
                                    {showFullSummary ? selectedBook.resume : truncateSummary(selectedBook.resume, 100)}
                                    {!showFullSummary && selectedBook.resume && selectedBook.resume.length > 100 && (
                                        <span className="more-link" onClick={toggleFullSummary}>plus</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="popup-footer">
                            <button className='lire'>Lire</button>
                            <button className='reserver' onClick={() => handleReserver(selectedBook)}>Reserver</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navix;
