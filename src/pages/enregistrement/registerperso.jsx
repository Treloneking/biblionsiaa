import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import './registerperso.css';

const Registerperso = () => {
  const location = useLocation();
  const { book } = location.state || {};
  const [reservationDate, setReservationDate] = useState('');
  const history = useHistory();

  const handleReservationSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Get the JWT token from local storage
      const response = await axios.post(
        'http://localhost:5000/app/reservation',
        {
          date_emprunt: reservationDate,
          User_Id_user: localStorage.getItem('Id_user'),
          Livre_Id_livre: book.Id_livre,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the token to the request headers
          }
        }
      );

      console.log('Réservation réussie : ', response.data);
      alert('Vous avez réservé ce livre');
      history.push('/app/acceuil');
    } catch (error) {
      console.error('Erreur lors de la réservation : ', error);
      alert('Erreur lors de la réservation. Veuillez vérifier les informations et réessayer.');
    }
  };

  if (!book) {
    return <p>Aucune information sur le livre disponible.</p>;
  }

  return (
    <div className="reservation-page-container">
      <div className="reservation-page-content">
        <img src={`data:image/jpeg;base64,${book.photo}`} alt={book.Titre} className="book-image" />
        <h2>{book.Titre}</h2>
        <p><strong>Auteur:</strong> {book.Auteur}</p>
        <form onSubmit={handleReservationSubmit} className="reservation-form">
          <label>Date de réservation:</label>
          <input
            type="date"
            name="date_reservation"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
            required
            className="date-input"
          />
          <button type="submit" className="reservation-button">Réserver</button>
        </form>
      </div>
    </div>
  );
};

export default Registerperso;
