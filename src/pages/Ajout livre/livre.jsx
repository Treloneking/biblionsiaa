import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './livre.css';
import { useHistory } from 'react-router-dom';

const Livre = () => {
  const [bookData, setBookData] = useState({
    Titre: '',
    Auteur: '',
    genres: [],
    Date_publication: '',
    resume: '',
    photo: null,
  });
  const history = useHistory();
  const [genres, setGenres] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://10.11.100.2:8000/app/genres');
        setGenres(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error.message);
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

  const handleCheckboxChange = (genreId) => {
    setBookData((prevData) => {
      const newGenres = prevData.genres.includes(genreId)
        ? prevData.genres.filter((id) => id !== genreId)
        : [...prevData.genres, genreId];
      return { ...prevData, genres: newGenres };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in bookData) {
      if (key === "genres") {
        formData.append(key, JSON.stringify(bookData['genres']));

      } else {
        formData.append(key, bookData[key]);
      }
    }

    try {
      console.log(formData);
      const response = await axios.post('http://10.11.100.2:8000/app/ajout-livre',formData);
      setMessage(response.data.message);
      alert('livre ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error.response?.data || error.message);
      setMessage('Erreur lors de l\'ajout du livre');
    }
    history.push('/app/acceuil')
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
          <label>Genres:</label>
          <div className="checkbox-group">
            {genres.map((genre) => (
              <div key={genre.Id_genre} className="checkbox-container">
                <label>
                  {genre.Id_genre}
                  <input
                    type="checkbox"
                    value={genre.Id_genre}
                    checked={bookData.genres.includes(genre.Id_genre)}
                    onChange={() => handleCheckboxChange(genre.Id_genre)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="Date_publication">Date de Publication:</label>
          <input type="date" id="Date_publication" name="Date_publication" value={bookData.Date_publication} onChange={handleChange} required />
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
