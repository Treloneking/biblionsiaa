import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import './registerperso.css';

const Registerperso = () => {
  const location = useLocation();
  const { book } = location.state || {};
  const [reservationDate, setReservationDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const history = useHistory();

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.abs(end - start);
    return Math.ceil(difference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  };

  const handleReservationSubmit = async (event) => {
    event.preventDefault();

    const currentDate = new Date();
    const reservation = new Date(reservationDate);
    const returnD = new Date(returnDate);
    const daysReserved = calculateDays(reservationDate, returnDate);

    // Vérifier si les dates sont passées
    if (reservation < currentDate || returnD < currentDate) {
      alert('Les dates de réservation et de retour ne peuvent pas être dans le passé.');
      return;
    }

    // Vérifier si la date de retour est antérieure à la date de réservation
    if (returnD <= reservation) {
      alert('La date de retour doit être postérieure à la date de réservation.');
      return;
    }

    // Vérifier si la durée de réservation dépasse 4 jours
    if (daysReserved > 4) {
      alert('Vous ne pouvez pas réserver un livre pour plus de 4 jours.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the JWT token from local storage
      const response = await axios.post(
        'http://localhost:5000/app/reservation',
        {
          date_emprunt: reservationDate,
          date_retour: returnDate,
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
      alert(`Vous avez réservé ce livre pour ${daysReserved} jours`);
      history.push('/app/acceuil');
    } catch (error) {
      console.error('Erreur lors de la réservation : ', error);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Erreur lors de la réservation. Veuillez vérifier les informations et réessayer.';
      alert(errorMessage);
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
          <label>Date de retour:</label>
          <input
            type="date"
            name="date_retour"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
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
