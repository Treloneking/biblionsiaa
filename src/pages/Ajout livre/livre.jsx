import React, { useState } from 'react';
import axios from 'axios';
import './livre.css';
console.clear();
const Livre = () => {
  const [bookData, setBookData] = useState({
    titre: '',
    auteur: '',
    genre: '',
    datePublication: '',
    description: '',
    photo: null, // Ajouter l'état pour la photo
  });
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in bookData) {
      formData.append(key, bookData[key]);
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
          <label htmlFor="titre">Titre:</label>
          <input type="text" id="titre" name="titre" value={bookData.titre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="auteur">Auteur:</label>
          <input type="text" id="auteur" name="auteur" value={bookData.auteur} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Genre:</label>
          <input type="text" id="genre" name="genre" value={bookData.genre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="datePublication">Date de Publication:</label>
          <input type="date" id="datePublication" name="datePublication" value={bookData.datePublication} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" value={bookData.description} onChange={handleChange} required />
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
