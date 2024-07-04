import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './livre.css';

const Livre = () => {
  const [bookData, setBookData] = useState({
    Titre: '',
    Auteur: '',
    genres: [], // Utilisation d'un tableau pour stocker les genres sélectionnés
    Date_publication: '',
    resume: '',
    photo: null,
  });
  const [genres, setGenres] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch existing genres from backend
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/genres');
        setGenres(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setBookData((prevData) => ({
      ...prevData,
      photo: e.target.files[0],
    }));
  };

  const handleGenreChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setBookData((prevData) => ({
      ...prevData,
      genres: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in bookData) {
      if (key === 'genres') {
        formData.append(key, JSON.stringify(bookData[key])); // Convertir en chaîne JSON pour envoyer les IDs des genres sélectionnés
      } else {
        formData.append(key, bookData[key]);
      }
    }

    try {
      const response = await axios.post('http://localhost:5000/app/ajout-livre', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error);
      setMessage('Erreur lors de l\'ajout du livre');
    }
  };

  return (
    <div className="add-book-container">
      <h1>Ajouter un Livre</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-book-form">
        <div className="form-group">
          <label htmlFor="Titre">Titre:</label>
          <input type="text" id="Titre" name="Titre" value={bookData.Titre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="Auteur">Auteur:</label>
          <input type="text" id="Auteur" name="Auteur" value={bookData.Auteur} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="genres">Genres:</label>
          <select id="genres" name="genres" multiple value={bookData.genres} onChange={handleGenreChange} required>
            {genres.map(genre => (
              <option key={genre.Id_genre} value={genre.Id_genre}>{genre.Id_genre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="datePublication">Date de Publication:</label>
          <input type="date" id="datePublication" name="Date_publication" value={bookData.Date_publication} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="resume">Description:</label>
          <textarea id="resume" name="resume" value={bookData.resume} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="photo">Photo:</label>
          <input type="file" id="photo" name="photo" onChange={handleFileChange} required />
        </div>
        <button type="submit" className="submit-button">Ajouter le Livre</button>
      </form>
    </div>
  );
};

export default Livre;
