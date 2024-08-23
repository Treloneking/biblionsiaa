const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost', // Adresse de votre serveur MySQL
  user: 'root', // Nom d'utilisateur MySQL
  password: '', // Mot de passe MySQL
  database: 'biblio' // Nom de la base de données
});

// Connecter à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err.stack);
    return;
  }
  console.log('Connecté à la base de données en tant que l\'id', db.threadId);
});

const router = express.Router();
// Route de connexion
router.post('/login', (req, res) => {
  const { id_user, mot_de_passe } = req.body;
  const query = 'SELECT * FROM utilisateur WHERE id_user = ?';
  db.query(query, [id_user], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const utilisateur = results[0];
    const isMatch = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { utilisateur: { id: utilisateur.id_user } };
    jwt.sign(payload, 'secret', { expiresIn: 3 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  });
});

module.exports = router;
