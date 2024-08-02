import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { IconContext } from 'react-icons';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import SidebarData from '../sidebar/SidebarData'; // Import par défaut de SidebarData
import './navbar.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function Navbar() {
  const [Books, setBooks] = useState([]);
  const [sidebar, setSidebar] = useState(false);
  const [Prenom, setPrenom] = useState('');
  const [Nom, setNom] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Définir le statut isAdmin
  const history = useHistory();
  const showSidebar = () => setSidebar(!sidebar);

  const handleNotification = () => {
    history.push('/app/notification');
  };

  useEffect(() => {
    const storedPrenom = localStorage.getItem('Prenom');
    const storedNom = localStorage.getItem('Nom');
    setPrenom(storedPrenom);
    setNom(storedNom);

    axios.get('http://localhost:5000/app')
      .then(response => {
        setBooks(response.data);
        // Vérifier si l'utilisateur est admin (exemple basique)
        const storedIdUser = localStorage.getItem('Id_user');
        setIsAdmin(storedIdUser === 'Bibliothequensia');
      })
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('Prenom');
    localStorage.removeItem('Nom');
    localStorage.removeItem('Id_user');
    localStorage.removeItem('role');
    window.location.reload();
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <>
      <IconContext.Provider value={{ color: 'goldenrod' }}>
        <div className='nav-bar'>
          <div  className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </div>
          <marquee>
            <p className='bienvenue'>
              <FaIcons.FaBook />Bienvenue à la Bibliothèque Numérique de NSIA Mr/Mme {capitalizeFirstLetter(Nom)} {capitalizeFirstLetter(Prenom)}<FaIcons.FaBook />
            </p>
          </marquee>
          <div className='nav-bar-icons'>
            <IoIcons.IoMdNotificationsOutline className='notification-icon' onClick={handleNotification} />
          </div>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            <SidebarData isAdmin={isAdmin} /> {/* Utilisation de SidebarData avec isAdmin */}
            <button className="boutonlogout" onClick={handleLogOut}>
              <FaIcons.FaSignOutAlt /><a>Deconnexion</a>
            </button>
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
