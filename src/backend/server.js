
// Importez dotenv et chargez les variables d'environnement
require('dotenv').config({ path: '../../.env' });

// Récupérez la clé secrète JWT depuis les variables d'environnement
const jwtSecret = process.env.JWT_SECRET;

// Vérifiez si la clé secrète JWT est définie
if (!jwtSecret) {
  console.error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
  process.exit(1); // Arrête le processus Node en cas d'erreur critique
}

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'biblio'
});

// Middleware pour parser le corps des requêtes
app.use(bodyParser.json());
app.use(cors());

// Route de connexion
app.post('/login', (req, res) => {
  const { Id_user, Mot_de_passe } = req.body;

  const sql = 'SELECT Id_user ,Prenom, Nom FROM utilisateur WHERE Id_user = ? AND Mot_de_passe = ?';
  const values = [Id_user, Mot_de_passe];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de serveur' });
    }

    if (results.length > 0) {
      const jwtSecret = process.env.JWT_SECRET;
      const { Prenom, Nom, Id_user } = results[0];
      const token = jwt.sign({ Id_user, Prenom, Nom }, jwtSecret, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Connexion réussie', token, Id_user,Prenom, Nom });
    } else {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  });
});

// Middleware pour vérifier les tokens JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


app.get('/app', (req, res) => {
  const query = 'SELECT * FROM livre'; 
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching books:', err);
          res.status(500).send('Error fetching books');
          return;
      }
      const books = results.map(book => {
        return {
            ...book,
            photo: book.photo ? Buffer.from(book.photo).toString('base64') : null
        };
    });

    res.json(books);
});
});
app.get('/app/favoris', (req, res) => {
  const userId = req.query.userId; // Get user ID from query parameters
  const page = parseInt(req.query.page) || 1; // Get page number from query parameters
  const limit = parseInt(req.query.limit) || 5; // Get limit from query parameters
  const offset = (page - 1) * limit; // Calculate offset

  const query = `
      SELECT * FROM livre
      WHERE user_id = ?
      LIMIT ?, ?
  `;

  db.query(query, [userId, offset, limit], (err, results) => {
      if (err) {
          console.error('Error fetching books:', err);
          res.status(500).send('Error fetching books');
          return;
      }

      const totalQuery = `
          SELECT COUNT(*) AS total FROM livre
          WHERE user_id = ?
      `;

      db.query(totalQuery, [userId], (err, countResults) => {
          if (err) {
              console.error('Error fetching total count:', err);
              res.status(500).send('Error fetching total count');
              return;
          }

          const total = countResults[0].total;
          const books = results.map(book => ({
              ...book,
              photo: book.photo ? Buffer.from(book.photo).toString('base64') : null
          }));

          res.json({ favorites: books, total });
      });
  });
});



app.post('/app/reservation', (req, res) => {
  const { date_emprunt, User_Id_user, Livre_Id_livre } = req.body;

  const query = `INSERT INTO emprunter (date_emprunt, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?)`;
  const values = [date_emprunt, User_Id_user, Livre_Id_livre];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'insertion de la réservation :', error);
      return res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
    }

    res.status(201).json({ message: 'Réservation réussie', results });
  });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
