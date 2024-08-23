import React from 'react';
import * as IoIcons from "react-icons/io";
import { Link } from 'react-router-dom'; // Importer Link depuis react-router-dom

const SidebarData = ({ isAdmin }) => {
  console.log(isAdmin)
  const sidebarItems = [
    
    {
        title: 'Acceuil',
        path: '/app/acceuil',
        icon: <IoIcons.IoIosHome/>,
        cName: 'nav-text'
        
      },
      {
          title: "Envie d'un livre",
          path: '/app/proposition',
          icon: <IoIcons.IoIosPaper/>,
          cName: 'nav-text',
          hidden: isAdmin
        },
        {
          title: 'Demande',
          path: '/app/demande',
          icon: <IoIcons.IoIosPaper/>,
          cName: 'nav-text',
          hidden: !isAdmin
        },
        {
<<<<<<< HEAD
          title:"Sortie Livre",
          path: "/app/selivre",
          icon: <IoIcons.IoIosExit/>,
          cName: "nav-text",
          hidden:!isAdmin
        },
        {
=======
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
            title: 'Livre',
            path: '/app/ajout-livre',
            icon: <IoIcons.IoIosBook/>,
            cName: 'nav-text',
            hidden: !isAdmin
         },
         {
            title: 'Reserver',
            path: '/app/reserver',
            icon: <IoIcons.IoIosPaper/>,
            cName: 'nav-text',
            hidden: !isAdmin
         }
        
    ];

  // Filtrer les éléments visibles dans la barre latérale
  const visibleSidebarItems = sidebarItems.filter(item => !item.hidden);

  return visibleSidebarItems.map((item, index) => (
    <li key={index} className={item.cName}>
      <Link to={item.path}> {/* Utiliser Link ici pour créer des liens */}
        {item.icon}
        <span>{item.title}</span>
      </Link>
    </li>
  ));
};

export default SidebarData;
