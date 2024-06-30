//SidebarData.jsx
import { title } from 'process';
import React from 'react';
import * as IoIcons from "react-icons/io";
export const SidebarData =[


    {
        title: 'Home',
        path: '/app/acceuil',
        icon: <IoIcons.IoIosHome/>,
        cName:"nav-text"
    },
{
    title: "Favoris",
    path: "/app/favoris",
    icon: <IoIcons.IoIosStar/>,
    cName: "nav-text"
},
{
    title: "contact",
    path: "/app/contact",
    icon: <IoIcons.IoIosPeople/>,
    cName: "nav-text"
}
]