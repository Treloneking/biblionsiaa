import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './navbar.css';
import logo from './../../assets/images/logo (1).png';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import { SidebarData } from '../sidebar/SidebarData';
import { IconContext } from 'react-icons';

function Navbar() {
    const [sidebar, setSidebar] = useState(false);
    const history = useHistory();
    const showSidebar = () => setSidebar(!sidebar);
    const [Prenom, setPrenom] = useState(null);

    const handleNotification = () => {
        history.push(`/app/notification`);
    };
    useEffect(() => {
        // Récupère le token depuis le localStorage lors du montage du composant
        const storedPrenom = localStorage.getItem('Prenom');
        setPrenom(storedPrenom);
      }, []);

    const handleLogOut = () => {
        // Supprime le token du stockage local
        localStorage.removeItem('token');
        localStorage.removeItem('Prenom');
        
        // Actualise la page
        window.location.reload();
      };

    return (
        <>
            <IconContext.Provider value={{ color: 'rgba(0, 0, 0, 0.712)' }}>
                <div className='nav-bar'>
            
                    <Link to="/app" className='menu-bars'>
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
          <marquee><p className='bienvenue'>Bienvenue à la Bibliotheque Numérique de NSIA Mr/Mme {Prenom}</p></marquee>
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
        </>
    );
}

export default Navbar;
