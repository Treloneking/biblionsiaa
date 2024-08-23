import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './queueList.css';

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

const QueueList = ({ bookId }) => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the JWT token from local storage
        const response = await axios.get('http://10.11.100.2:8000/app/queue', {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the token to the request headers
          },
          params: { bookId }, // Add the bookId as a query parameter
        });
        setQueue(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de la file d\'attente : ', error);
      }
    };

    fetchQueue();
  }, [bookId]);

  return (
    <div className="queue-list-container">
      <h2>File d'attente</h2>
      {queue.length > 0 ? (
        <table className="queue-table">
          <thead>
            <tr>
              <th>Nom de l'utilisateur</th>
              <th>Prénom de l'utilisateur</th>
              <th>Titre du livre</th>
              <th>Date d'emprunt</th>
              <th>Date de retour</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.user_nom}</td>
                <td>{reservation.user_prenom}</td>
                <td>{reservation.livre_titre}</td>
                <td>{formatDate(reservation.date_emprunt)}</td>
                <td>{formatDate(reservation.date_retour)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucune réservation en attente.</p>
      )}
    </div>
  );
};

export default QueueList;
