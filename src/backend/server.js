
// Importez dotenv et chargez les variables d'environnement
require('dotenv').config({ path: '../../.env' });

// Récupérez la clé secrète JWT depuis les variables d'environnement
const jwtSecret = process.env.JWT_SECRET;

// Vérifiez si la clé secrète JWT est définie
if (!jwtSecret) {
  console.error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
  process.exit(1); // Arrête le processus Node en cas d'erreur critique
}
const ldap = require('ldapjs');
const express = require('express');
const multer = require('multer');
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Route de connexion
// Endpoint pour la connexion
app.post('/login', (req, res) => {
  const { Id_user, Mot_de_passe } = req.body;

  // Vérifier si l'utilisateur est administrateur
  if (Id_user === 'Bibliothequensia' && Mot_de_passe === 'Administrateurbiblio') {
    // Créer un token JWT pour l'administrateur
    const token = jwt.sign({ Id_user, Prenom: 'Administrateur', Nom: 'Bibliothequensia' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Connexion réussie en tant qu\'administrateur', token, Id_user: 'Bibliothequensia', Prenom: 'Admin', Nom: 'Bibliothequensia' });
  }

  // Sinon, chercher l'utilisateur dans la base de données
  const sql = 'SELECT Id_user, Prenom, Nom FROM utilisateur WHERE Id_user = ? AND Mot_de_passe = ?';
  const values = [Id_user, Mot_de_passe];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de serveur' });
    }

    if (results.length > 0) {
      const { Prenom, Nom, Id_user } = results[0];
      const token = jwt.sign({ Id_user, Prenom, Nom }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Connexion réussie', token, Id_user, Prenom, Nom });
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
  const { genre } = req.query;
  let query = `SELECT * 
FROM livre
LEFT JOIN genre_livre gb ON livre.Id_livre = gb.Livre_Id_livre
WHERE statut = 'Disponible'`;

  if (genre) {
    query += ` AND gb.Genre_Id_genre = '${genre}'`;
  }

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

app.post('/app/proposition', (req, res) => {
  const { titre_livre, auteur, genre, user_id_user, user_name } = req.body;

  if (!titre_livre || !auteur || !genre || !user_id_user || !user_name) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  const query = 'INSERT INTO proposition (titre_livre, auteur, genre, user_id_user, user_name) VALUES (?, ?, ?, ?, ?)';
  const values = [titre_livre, auteur, genre, user_id_user, user_name];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'insertion de la proposition :', err);
      return res.status(500).json({ message: 'Erreur lors de la création de la proposition.' });
    }

    res.status(201).json({ message: 'Proposition réussie', results });
  });
});


app.post('/app/reservation', (req, res) => {
  const { date_emprunt, date_retour, User_Id_user, Livre_Id_livre } = req.body;

  // Calculate the number of days between date_emprunt and date_retour
  const startDate = new Date(date_emprunt);
  const endDate = new Date(date_retour);
  const daysReserved = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  if (daysReserved > 4) {
    return res.status(400).json({ message: 'Vous ne pouvez pas réserver un livre pour plus de 4 jours' });
  }

  // Vérifiez si une réservation existe déjà pour ce livre et ces dates
  const checkQuery = `SELECT * FROM emprunter WHERE Livre_Id_livre = ? AND ((date_emprunt BETWEEN ? AND ?) OR (date_retour BETWEEN ? AND ?))`;
  const checkValues = [Livre_Id_livre, date_emprunt, date_retour, date_emprunt, date_retour];

  db.query(checkQuery, checkValues, (checkError, checkResults) => {
    if (checkError) {
      console.error('Erreur lors de la vérification des réservations existantes :', checkError);
      return res.status(500).json({ message: 'Erreur lors de la vérification des réservations existantes' });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({ message: 'Ce livre est déjà réservé pour les dates spécifiées' });
    }

    // Si aucune réservation n'existe pour ces dates, insérez la nouvelle réservation
    const query = `INSERT INTO emprunter (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
    const values = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'insertion de la réservation :', error);
        return res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
      }

      res.status(201).json({ message: 'Réservation réussie', results });
    });
  });
});
app.get('/app/demande', (req, res) => {
  const query = `
  SELECT * FROM proposition
  `;
  
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des archives.' });
    } else {
      res.json(results);
    }
  });
});

app.get('/app/Reserver', (req, res) => {
  const query = `
  SELECT *
FROM emprunter e
LEFT JOIN livre l ON e.Livre_Id_livre = l.Id_livre
LEFT JOIN utilisateur u ON e.User_Id_user = u.Id_user;

  `;
  
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des archives.' });
    } else {
      res.json(results);
    }
  });
});

app.post('/app/ajout-livre', upload.single('photo'), (req, res) => {
  const { Titre, Date_publication, Auteur, genre,resume } = req.body;
  const photo = req.file.buffer; // Le fichier photo est maintenant dans req.file.buffer

  const sql = 'INSERT INTO livres (Titre, Date_publication, Auteur, genre,  photo, resume,) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [Titre,Date_publication, Auteur, genre, photo, resume];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting book:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion du livre' });
    }
    return res.status(200).json({ message: 'Livre inséré avec succès' });
  });
});

app.listen(port, () => {
  console.log(`Bonjour chef le serveur a démarré sur le port ${port}`);
});
