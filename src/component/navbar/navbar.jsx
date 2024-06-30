import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { IconContext } from 'react-icons';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import { SidebarData } from '../sidebar/SidebarData';
import './navbar.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function Navbar() {
  const [Books, setBooks] = useState([]);
  const [sidebar, setSidebar] = useState(false);
  const [Prenom, setPrenom] = useState('');
  const [Nom, setNom] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
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
      .then(response => setBooks(response.data))
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('Prenom');
    localStorage.removeItem('Nom');
    localStorage.removeItem('Id_user');
    window.location.reload();
  };

  const openPopup = (book) => {
    setSelectedBook(book);
  };

  const closePopup = () => {
    setSelectedBook(null);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  return (
    <>
      <IconContext.Provider value={{ color: 'rgba(0, 0, 0, 0.712)' }}>
        <div className='nav-bar'>
          <Link to="/app" className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
          <marquee>
            <p className='bienvenue'>
              <FaIcons.FaBook />Bienvenue à la Bibliotheque Numérique de NSIA Mr/Mme {Nom} {Prenom}<FaIcons.FaBook />
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
            {SidebarData.map((item, index) => (
              <li key={index} className={item.cName}>
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
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
