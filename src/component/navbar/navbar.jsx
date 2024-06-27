import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './navbar.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import { SidebarData } from '../sidebar/SidebarData';
import { IconContext } from 'react-icons';
import axios from 'axios';

function Navbar() {
    const [Books, setBooks] = useState([]);
    const [sidebar, setSidebar] = useState(false);
    const history = useHistory();
    const showSidebar = () => setSidebar(!sidebar);
    const [Prenom, setPrenom] = useState(null);

    const handleNotification = () => {
        history.push(`/app/notification`);
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

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
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
            <IconContext.Provider value={{ color: 'rgba(0, 0, 0, 0.712)' }}>
                <div className='nav-bar'>
                    <Link to="/app" className='menu-bars'>
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
                    <marquee><p className='bienvenue'><FaIcons.FaBook />Bienvenue à la Bibliotheque Numérique de NSIA Mr/Mme {Prenom}<FaIcons.FaBook /></p></marquee>
                    <div className='nav-bar-icons'>
                        <IoIcons.IoMdNotificationsOutline values={{color:'rgba(0, 0, 0, 0.712)'}} className='notification-icon' onClick={handleNotification} />
                    </div>
                </div>
                <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                    <ul className='nav-menu-items' onClick={showSidebar}>
                        <li className='navbar-toggle'>
                            <Link to='#' className='menu-bars'>
                                <AiIcons.AiOutlineClose />
                            </Link>
                        </li>
                        {SidebarData.map((item, index) => (
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        ))}
                        <button className="boutonlogout" onClick={handleLogOut}> <FaIcons.FaSignOutAlt/><a>Deconnexion</a> </button>
                    </ul>
                </nav>
            </IconContext.Provider>
            <div className='face-biblio'> 
                <div className='title'><h2>livre proposé</h2></div>
                {Array.isArray(Books) && Books.length > 0 ? (
                    <Slider {...settings}>
                        {Books.map((item, index) => (
                            <div key={index} className="card">
                                <img src={`data:image/jpeg;base64,${item.photo}`} alt={item.Titre} className="book-image" />
                                <h3>{item.Titre}</h3>
                                <p>{item.Auteur}</p>
                                <p>{item.Date_publication}</p>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p>Aucun livre disponible</p>
                )}
                <div></div>
            </div>
        </>
    );
}

export default Navbar;
