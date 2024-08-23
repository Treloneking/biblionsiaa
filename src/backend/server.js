// Importez dotenv et chargez les variables d'environnement
require('dotenv').config({ path: '../../.env' });

// Récupérez la clé secrète JWT depuis les variables d'environnement
const jwtSecret = process.env.JWT_SECRET;

// Vérifiez si la clé secrète JWT est définie
if (!jwtSecret) {
  console.error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
  process.exit(1); // Arrête le processus Node en cas d'erreur critique
}

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const ldap = require('ldapjs');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
<<<<<<< HEAD
const fs = require('fs');
const app = express();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const port = 8000;
=======
const app = express();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const port = 5000;
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
const jwt = require('jsonwebtoken');
const { authenticate } = require('ldap-authentication');
const cors = require('cors');
var ActiveDirectory = require('activedirectory');

// Configuration de la connexion à la base de données
<<<<<<< HEAD
let db;

function handleDisconnect() {
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'biblio'
    });

    db.connect(err => {
        if (err) {
            console.error('Erreur lors de la connexion à la base de données:', err);
            setTimeout(handleDisconnect, 2000); // Reconnexion après 2 secondes
        } else {
            console.log('Connecté à la base de données.');
        }
    });

    db.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Connexion à la base de données perdue. Reconnexion en cours...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = db;


=======
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'biblio'
});
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598


// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Route de connexion
// Endpoint pour la connexion
app.post('/login', async (req, res) => {
  const { Id_user, Mot_de_passe } = req.body;

  // Ajouter automatiquement @nsiaassurances.com si non présent
  const domain = '@nsiaassurances.com';
  const username = Id_user.includes(domain) ? Id_user : `${Id_user}${domain}`;

  if (Id_user === 'Bibliothequensia' && Mot_de_passe === 'Administrateurbiblio') {
    // Créer un token JWT pour l'administrateur
    const token = jwt.sign({ Id_user, Prenom: 'Administrateur', Nom: 'Bibliothequensia' }, process.env.JWT_SECRET, { expiresIn: '2s' });
    return res.status(200).json({ message: 'Connexion réussie en tant qu\'administrateur', token, Id_user: 'Bibliothequensia', Prenom: 'Admin', Nom: 'Bibliothequensia' });
  }

  try {
    // Configuration pour l'authentification LDAP
    const config = {
      url: 'ldap://10.10.4.4',
      baseDN: 'dc=nsia,dc=com'
    };

    const ad = new ActiveDirectory(config);
    const password = Mot_de_passe;

    // Extraire le prénom et le nom de l'utilisateur
    const regex = /^([a-zA-Z]+)\.([a-zA-Z]+)@/;
    const matches = username.match(regex);

    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Adresse e-mail non valide' });
    }

    const prenom = matches[1];
    const nom = matches[2];

    // Authenticate
    ad.authenticate(username, password, function(err, auth) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return res.status(500).json({ message: 'Erreur d\'authentification LDAP' });
      }
      if (auth) {
        // Requête SQL pour vérifier si l'utilisateur existe dans la base de données
        db.query('SELECT * FROM utilisateur WHERE Email = ?', [username], async function(error, results, fields) {
          if (error) {
            console.error('Erreur lors de la vérification de l\'utilisateur dans la base de données :', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
          }

          // Si l'utilisateur n'existe pas dans la base de données, l'insérer
          if (results.length === 0) {
            try {
              // Création de l'utilisateur dans la base de données
              db.query('INSERT INTO utilisateur (Nom, Prenom, Email) VALUES (?, ?, ?)', [nom, prenom, username], function(err, results, fields) {
                if (err) {
                  console.error('Erreur lors de la création de l\'utilisateur dans la base de données :', err);
                  return res.status(500).json({ message: 'Erreur interne du serveur' });
                }
                console.log('Utilisateur créé dans la base de données');

                // Récupérer l'ID de l'utilisateur inséré
                const newUserId = results.insertId;
                // Générer le token JWT après la création de l'utilisateur
                const token = jwt.sign({ Id_user: newUserId, username, Prenom: prenom, Nom: nom }, jwtSecret, { expiresIn: '2h' });
                return res.status(200).json({ message: 'Connexion réussie', token, Id_user: newUserId, username, Prenom: prenom, Nom: nom });
              });
            } catch (error) {
              console.error('Erreur lors de la création de l\'utilisateur dans la base de données :', error);
              return res.status(500).json({ message: 'Erreur interne du serveur' });
            }
          } else {
            // Utilisateur trouvé dans la base de données, récupérer l'ID utilisateur
            const existingUserId = results[0].Id_user; // Assurez-vous que 'id' est bien le nom de la colonne de l'ID utilisateur dans votre table
            // Générer le token JWT directement
            const token = jwt.sign({ Id_user: existingUserId, username, Prenom: prenom, Nom: nom }, jwtSecret, { expiresIn: '2h' });
            return res.status(200).json({ message: 'Connexion réussie', token, Id_user: existingUserId, username, Prenom: prenom, Nom: nom });
          }
        });
      } else {
        console.log('Authentication failed!');
        return res.status(401).json({ message: 'Authentification échouée' });
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification LDAP :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
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
<<<<<<< HEAD
LEFT JOIN genre_livre gb ON livre.Id_livre = gb.Livre_Id_livre`;
=======
LEFT JOIN genre_livre gb ON livre.Id_livre = gb.Livre_Id_livre
WHERE statut = 'Disponible'`;
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598

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

  const startDate = new Date(date_emprunt);
  const endDate = new Date(date_retour);
  const daysReserved = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  console.log('Dates de réservation:', date_emprunt, date_retour);
  console.log('Durée de réservation en jours:', daysReserved);

<<<<<<< HEAD
  // Vérifier si la durée de réservation dépasse 7 jours
  if (daysReserved > 7) {
    return res.status(400).json({ message: 'Vous ne pouvez pas réserver un livre pour plus de une semaine.' });
  }

  // Vérifier si l'utilisateur a déjà une réservation dans se_livre
  const checkUserReservationQuery = `
    SELECT * FROM se_livre 
    WHERE User_Id_user = ? 
  `;
  const checkUserReservationValues = [User_Id_user];

  db.query(checkUserReservationQuery, checkUserReservationValues, (checkUserReservationError, checkUserReservationResults) => {
    if (checkUserReservationError) {
      console.error('Erreur lors de la vérification des réservations de l\'utilisateur :', checkUserReservationError);
      return res.status(500).json({ message: 'Erreur lors de la vérification des réservations de l\'utilisateur.' });
    }

    console.log('Résultats de la vérification des réservations de l\'utilisateur:', checkUserReservationResults);

    if (checkUserReservationResults.length > 0) {
      return res.status(400).json({ message: 'Veuillez retourner le livre emprunter, avant de pouvoir en prendre un autre.' });
    }

    const checkCurrentBorrowQuery = `
      SELECT * FROM emprunter 
      WHERE Livre_Id_livre = ? 
    `;
    const checkCurrentBorrowValues = [Livre_Id_livre];

    db.query(checkCurrentBorrowQuery, checkCurrentBorrowValues, (checkCurrentBorrowError, checkCurrentBorrowResults) => {
      if (checkCurrentBorrowError) {
        console.error('Erreur lors de la vérification des emprunts en cours :', checkCurrentBorrowError);
        return res.status(500).json({ message: 'Erreur lors de la vérification des emprunts en cours.' });
      }

      console.log('Résultats de la vérification des emprunts en cours:', checkCurrentBorrowResults);

      if (checkCurrentBorrowResults.length > 0) {
        // Si un emprunt en cours est trouvé, vérifier les conflits de dates avec la file d'attente
        const queueCheckQuery = `
          SELECT * FROM queue 
=======
  // Vérifier si la durée de réservation dépasse 4 jours
  if (daysReserved > 4) {
    return res.status(400).json({ message: 'Vous ne pouvez pas réserver un livre pour plus de 4 jours.' });
  }

  const checkCurrentBorrowQuery = `
    SELECT * FROM emprunter 
    WHERE Livre_Id_livre = ? 
  `;
  const checkCurrentBorrowValues = [Livre_Id_livre];

  db.query(checkCurrentBorrowQuery, checkCurrentBorrowValues, (checkCurrentBorrowError, checkCurrentBorrowResults) => {
    if (checkCurrentBorrowError) {
      console.error('Erreur lors de la vérification des emprunts en cours :', checkCurrentBorrowError);
      return res.status(500).json({ message: 'Erreur lors de la vérification des emprunts en cours.' });
    }

    console.log('Résultats de la vérification des emprunts en cours:', checkCurrentBorrowResults);

    if (checkCurrentBorrowResults.length > 0) {
      // Si un emprunt en cours est trouvé, vérifier les conflits de dates avec la file d'attente
      const queueCheckQuery = `
        SELECT * FROM queue 
        WHERE Livre_Id_livre = ? 
        AND (
          (date_emprunt <= ? AND date_retour >= ?) OR
          (date_emprunt <= ? AND date_retour >= ?) OR
          (date_emprunt >= ? AND date_retour <= ?)
        )
      `;
      const queueCheckValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

      db.query(queueCheckQuery, queueCheckValues, (queueCheckError, queueCheckResults) => {
        if (queueCheckError) {
          console.error('Erreur lors de la vérification des dates de la file d\'attente :', queueCheckError);
          return res.status(500).json({ message: 'Erreur lors de la vérification des dates de la file d\'attente.' });
        }

        console.log('Résultats de la vérification des dates de la file d\'attente:', queueCheckResults);

        if (queueCheckResults.length > 0) {
          return res.status(400).json({ message: 'Il y a déjà une réservation similaire dans la file d\'attente. Veuillez choisir une autre date.' });
        }

        // Vérifier les conflits de dates avec les emprunts existants
        const borrowConflictQuery = `
          SELECT * FROM emprunter 
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
          WHERE Livre_Id_livre = ? 
          AND (
            (date_emprunt <= ? AND date_retour >= ?) OR
            (date_emprunt <= ? AND date_retour >= ?) OR
            (date_emprunt >= ? AND date_retour <= ?)
          )
        `;
<<<<<<< HEAD
        const queueCheckValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

        db.query(queueCheckQuery, queueCheckValues, (queueCheckError, queueCheckResults) => {
          if (queueCheckError) {
            console.error('Erreur lors de la vérification des dates de la file d\'attente :', queueCheckError);
            return res.status(500).json({ message: 'Erreur lors de la vérification des dates de la file d\'attente.' });
          }

          console.log('Résultats de la vérification des dates de la file d\'attente:', queueCheckResults);

          if (queueCheckResults.length > 0) {
            return res.status(400).json({ message: 'Il y a déjà une réservation similaire dans la file d\'attente. Veuillez choisir une autre date.' });
          }

          // Vérifier les conflits de dates avec les emprunts existants
          const borrowConflictQuery = `
            SELECT * FROM emprunter 
=======
        const borrowConflictValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

        db.query(borrowConflictQuery, borrowConflictValues, (borrowConflictError, borrowConflictResults) => {
          if (borrowConflictError) {
            console.error('Erreur lors de la vérification des emprunts existants :', borrowConflictError);
            return res.status(500).json({ message: 'Erreur lors de la vérification des emprunts existants.' });
          }

          console.log('Résultats de la vérification des emprunts existants:', borrowConflictResults);

          if (borrowConflictResults.length > 0) {
            return res.status(400).json({ message: 'Impossible d\'être dans la file d\'attente car cette date est en emprunt.' });
          }

          // Ajouter à la file d'attente si aucune réservation conflictuelle
          const queueQuery = `INSERT INTO queue (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
          const queueValues = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

          db.query(queueQuery, queueValues, (queueError, queueResults) => {
            if (queueError) {
              console.error('Erreur lors de l\'ajout à la file d\'attente :', queueError);
              return res.status(500).json({ message: 'Erreur lors de l\'ajout à la file d\'attente.' });
            }

            console.log('Réservation ajoutée à la file d\'attente:', queueResults);
            return res.status(200).json({ message: 'Il y a déjà un emprunt en cours. Votre réservation a été ajoutée à la file d\'attente.', queueResults });
          });
        });
      });
    } else {
      // Vérifier les réservations existantes pour des conflits de dates
      const checkReservationConflictQuery = `
        SELECT * FROM emprunter 
        WHERE Livre_Id_livre = ? 
        AND (
          (date_emprunt <= ? AND date_retour >= ?) OR
          (date_emprunt <= ? AND date_retour >= ?) OR
          (date_emprunt >= ? AND date_retour <= ?)
        )
      `;
      const checkReservationConflictValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

      db.query(checkReservationConflictQuery, checkReservationConflictValues, (checkError, checkResults) => {
        if (checkError) {
          console.error('Erreur lors de la vérification des réservations existantes :', checkError);
          return res.status(500).json({ message: 'Erreur lors de la vérification des réservations existantes.' });
        }

        console.log('Résultats de la vérification des réservations existantes:', checkResults);

        if (checkResults.length > 0) {
          // Vérifier les conflits de dates avec la file d'attente
          const queueCheckQuery = `
            SELECT * FROM queue 
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
            WHERE Livre_Id_livre = ? 
            AND (
              (date_emprunt <= ? AND date_retour >= ?) OR
              (date_emprunt <= ? AND date_retour >= ?) OR
              (date_emprunt >= ? AND date_retour <= ?)
            )
          `;
<<<<<<< HEAD
          const borrowConflictValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

          db.query(borrowConflictQuery, borrowConflictValues, (borrowConflictError, borrowConflictResults) => {
            if (borrowConflictError) {
              console.error('Erreur lors de la vérification des emprunts existants :', borrowConflictError);
              return res.status(500).json({ message: 'Erreur lors de la vérification des emprunts existants.' });
            }

            console.log('Résultats de la vérification des emprunts existants:', borrowConflictResults);

            if (borrowConflictResults.length > 0) {
              return res.status(400).json({ message: 'Impossible d\'être dans la file d\'attente car cette date est en emprunt.' });
            }

            // Ajouter à la file d'attente si aucune réservation conflictuelle
=======
          const queueCheckValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

          db.query(queueCheckQuery, queueCheckValues, (queueCheckError, queueCheckResults) => {
            if (queueCheckError) {
              console.error('Erreur lors de la vérification des dates de la file d\'attente :', queueCheckError);
              return res.status(500).json({ message: 'Erreur lors de la vérification des dates de la file d\'attente.' });
            }

            console.log('Résultats de la vérification des dates de la file d\'attente:', queueCheckResults);

            if (queueCheckResults.length > 0) {
              return res.status(400).json({ message: 'Il y a déjà une réservation similaire dans la file d\'attente. Veuillez choisir une autre date.' });
            }

            // Ajouter à la file d'attente si une réservation conflictuelle est trouvée
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
            const queueQuery = `INSERT INTO queue (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
            const queueValues = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

            db.query(queueQuery, queueValues, (queueError, queueResults) => {
              if (queueError) {
                console.error('Erreur lors de l\'ajout à la file d\'attente :', queueError);
                return res.status(500).json({ message: 'Erreur lors de l\'ajout à la file d\'attente.' });
              }

              console.log('Réservation ajoutée à la file d\'attente:', queueResults);
<<<<<<< HEAD
              return res.status(200).json({ message: 'Il y a déjà un emprunt en cours. Votre réservation a été ajoutée à la file d\'attente.', queueResults });
            });
          });
        });
      } else {
        // Vérifier les réservations existantes pour des conflits de dates
        const checkReservationConflictQuery = `
          SELECT * FROM emprunter 
          WHERE Livre_Id_livre = ? 
          AND (
            (date_emprunt <= ? AND date_retour >= ?) OR
            (date_emprunt <= ? AND date_retour >= ?) OR
            (date_emprunt >= ? AND date_retour <= ?)
          )
        `;
        const checkReservationConflictValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

        db.query(checkReservationConflictQuery, checkReservationConflictValues, (checkError, checkResults) => {
          if (checkError) {
            console.error('Erreur lors de la vérification des réservations existantes :', checkError);
            return res.status(500).json({ message: 'Erreur lors de la vérification des réservations existantes.' });
          }

          console.log('Résultats de la vérification des réservations existantes:', checkResults);

          if (checkResults.length > 0) {
            // Vérifier les conflits de dates avec la file d'attente
            const queueCheckQuery = `
              SELECT * FROM queue 
              WHERE Livre_Id_livre = ? 
              AND (
                (date_emprunt <= ? AND date_retour >= ?) OR
                (date_emprunt <= ? AND date_retour >= ?) OR
                (date_emprunt >= ? AND date_retour <= ?)
              )
            `;
            const queueCheckValues = [Livre_Id_livre, date_retour, date_emprunt, date_emprunt, date_retour, date_emprunt, date_retour];

            db.query(queueCheckQuery, queueCheckValues, (queueCheckError, queueCheckResults) => {
              if (queueCheckError) {
                console.error('Erreur lors de la vérification des dates de la file d\'attente :', queueCheckError);
                return res.status(500).json({ message: 'Erreur lors de la vérification des dates de la file d\'attente.' });
              }

              console.log('Résultats de la vérification des dates de la file d\'attente:', queueCheckResults);

              if (queueCheckResults.length > 0) {
                return res.status(400).json({ message: 'Il y a déjà une réservation similaire dans la file d\'attente. Veuillez choisir une autre date.' });
              }

              // Ajouter à la file d'attente si une réservation conflictuelle n'est pas trouvée
              const queueQuery = `INSERT INTO queue (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
              const queueValues = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

              db.query(queueQuery, queueValues, (queueError, queueResults) => {
                if (queueError) {
                  console.error('Erreur lors de l\'ajout à la file d\'attente :', queueError);
                  return res.status(500).json({ message: 'Erreur lors de l\'ajout à la file d\'attente.' });
                }

                console.log('Réservation ajoutée à la file d\'attente:', queueResults);
                return res.status(200).json({ message: 'Il y a déjà une réservation en cours pour cette période. Votre réservation a été ajoutée à la file d\'attente.', queueResults });
              });
            });
          } else {
            // Ajouter la réservation si aucune réservation conflictuelle
            const insertReservationQuery = `INSERT INTO emprunter (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
            const insertReservationValues = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

            db.query(insertReservationQuery, insertReservationValues, (insertError, insertResults) => {
              if (insertError) {
                console.error('Erreur lors de l\'ajout de la réservation :', insertError);
                return res.status(500).json({ message: 'Erreur lors de l\'ajout de la réservation.' });
              }

              console.log('Réservation réussie:', insertResults);
              return res.status(200).json({ message: 'Réservation réussie.', insertResults });
            });
          }
        });
      }
    });
  });
});



// se_livre


function checkAndInsertNewEmprunts() {
  const query = `
      INSERT INTO se_livre (date_emprunt,date_retour,User_Id_user,Livre_Id_livre)
      SELECT e.date_emprunt, e.date_retour,e.User_Id_user, e.Livre_Id_livre
      FROM emprunter e
      LEFT JOIN se_livre s
      ON e.date_emprunt = s.date_emprunt
      AND e.User_Id_user = s.User_Id_user
      AND e.Livre_Id_livre = s.Livre_Id_livre
      WHERE s.date_emprunt IS NULL;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Erreur lors de la vérification et de l\'insertion des nouveaux emprunts:', err);
      } else {
      }
  });
}

// Planifier la tâche pour s'exécuter toutes les minutes
schedule.scheduleJob('*/1 * * * *', checkAndInsertNewEmprunts);

// affcihe se_livre

app.get('/app/se_livre', (req, res) => {
  const query = `
    SELECT * 
    FROM se_livre sl
    LEFT JOIN utilisateur u ON sl.User_Id_user = u.Id_user
    LEFT JOIN livre l ON sl.Livre_Id_livre = l.Id_livre
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des enregistrements:', err);
      res.status(500).send('Erreur lors de la récupération des enregistrements');
    } else {
      res.json(results);
=======
              return res.status(200).json({ message: 'Il y a déjà une réservation similaire. Votre réservation a été ajoutée à la file d\'attente.', queueResults });
            });
          });
        } else {
          // Aucun emprunt ni réservation existante conflictuelle, ajouter à la table emprunter
          const insertQuery = `INSERT INTO emprunter (date_emprunt, date_retour, User_Id_user, Livre_Id_livre) VALUES (?, ?, ?, ?)`;
          const insertValues = [date_emprunt, date_retour, User_Id_user, Livre_Id_livre];

          db.query(insertQuery, insertValues, (insertError, insertResults) => {
            if (insertError) {
              console.error('Erreur lors de l\'ajout de la réservation :', insertError);
              return res.status(500).json({ message: 'Erreur lors de l\'ajout de la réservation.' });
            }

            console.log('Réservation ajoutée avec succès:', insertResults);
            return res.status(200).json({ message: 'Réservation ajoutée avec succès.', insertResults });
          });
        }
      });
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
    }
  });
});



<<<<<<< HEAD
=======






>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
// teste automatisme
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Fonction pour mettre à jour les réservations en retard
const updateOverdueReservations = () => {
  const currentDate = new Date();
  const formattedCurrentDate = formatDate(currentDate);

  // Vérifiez les livres en retard dans la table emprunter
  db.query(
    'SELECT * FROM emprunter WHERE date_retour < ?',
    [formattedCurrentDate],
    (error, overdueResults) => {
      if (error) {
        console.error('Erreur lors de la requête de livres en retard:', error);
        return;
      }

      if (!Array.isArray(overdueResults)) {
        console.error('Les résultats de la requête ne sont pas un tableau');
        return;
      }
<<<<<<< HEAD
=======

      console.log('overdueResults:', overdueResults);

>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
      for (const overdue of overdueResults) {
        const { Livre_Id_livre, id_emprunt } = overdue;

        // Trouvez la date la plus proche dans la table queue
        db.query(
          'SELECT * FROM queue WHERE Livre_Id_livre = ? ORDER BY date_emprunt ASC LIMIT 1',
          [Livre_Id_livre],
          (error, closestDateResults) => {
            if (error) {
              console.error('Erreur lors de la requête de la date la plus proche:', error);
              return;
            }

            if (!Array.isArray(closestDateResults)) {
              console.error('Les résultats de la requête ne sont pas un tableau');
              return;
            }

            console.log('closestDateResults:', closestDateResults);

            if (closestDateResults.length > 0) {
              const closestDate = closestDateResults[0];
              const formattedDateEmprunt = formatDate(closestDate.date_emprunt);
              const formattedDateRetour = formatDate(closestDate.date_retour);

              // Mettez à jour la table emprunter avec les informations de la table queue
              db.query(
                'UPDATE emprunter SET date_emprunt = ?, date_retour = ?, User_Id_user = ? WHERE id_emprunt = ?',
                [formattedDateEmprunt, formattedDateRetour, closestDate.User_Id_user, id_emprunt],
                (error) => {
                  if (error) {
                    console.error('Erreur lors de la mise à jour de la table emprunter:', error);
                    return;
                  }

                  // Supprimez l'entrée mise à jour de la table queue
                  db.query(
                    'DELETE FROM queue WHERE Livre_Id_livre = ? AND date_emprunt = ?',
                    [Livre_Id_livre, formattedDateEmprunt],
                    (error) => {
                      if (error) {
                        console.error('Erreur lors de la suppression de la table queue:', error);
                        return;
                      }
                    }
                  );
                }
              );
            }
          }
        );
      }
    }
  );
};

// Planifiez la tâche pour exécuter la fonction tous les jours à 18h30
<<<<<<< HEAD
schedule.scheduleJob('*/1 * * * *', updateOverdueReservations);
=======
schedule.scheduleJob('30 10 * * *', updateOverdueReservations);
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598

// Gérer les erreurs de connexion à la base de données
db.on('error', (err) => {
  console.error('Erreur de connexion à la base de données:', err);
});
// fin teste





app.get('/app/queue', (req, res) => {
  const { bookId } = req.query;

  const query = `
    SELECT q.*, u.nom AS user_nom, u.prenom AS user_prenom, l.Titre AS livre_titre
    FROM queue q
    JOIN utilisateur u ON q.User_Id_user = u.id_user
    JOIN livre l ON q.Livre_Id_livre = l.Id_livre
    ${bookId ? 'WHERE q.Livre_Id_livre = ?' : ''}
    ORDER BY q.date_emprunt ASC
  `;

  const queryParams = bookId ? [bookId] : [];

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération de la file d\'attente :', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération de la file d\'attente.' });
    }

    res.status(200).json(results);
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

// Backend pour récupérer les genres existants
app.get('/app/genres', (req, res) => {
  const sql = 'SELECT * FROM genre';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching genres:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
    }
    res.status(200).json(results);
  });
});






// email send 

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true pour le port 465, false pour le port 587
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Optionnel pour éviter les erreurs de certificat
  }
});

// Fonction pour envoyer un email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: to,
    subject: subject,
    text: text
  };

  console.log(`Tentative d'envoi d'un email à ${to}`);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erreur lors de l\'envoi de l\'email:', error);
    } else {
      console.log('Email envoyé: ' + info.response);
    }
  });
};

// Planification de la tâche avec node-schedule
<<<<<<< HEAD
const job = schedule.scheduleJob('19 09 * * *', function() {
=======
const job = schedule.scheduleJob('30 08*', function() {
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
  const today = new Date().toISOString().split('T')[0];
  console.log('Date de retour pour la recherche:', today);
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const query = `
    SELECT *
    FROM emprunter e
    LEFT JOIN utilisateur u ON e.User_Id_user = u.Id_user
    LEFT JOIN livre l ON e.Livre_Id_livre = l.Id_livre
    WHERE e.date_retour = ? OR e.date_emprunt = ?`;

  // Pass the `today` value twice for both placeholders in the query
  db.query(query, [today, today], (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return;
    }

    console.log('Résultats de la requête:', results);

    if (results.length === 0) {
      console.log('Aucun utilisateur à notifier aujourd\'hui.');
    } else {
      results.forEach(record => {
        const email = record.Email;
        const prenom = record.Prenom;
        const titre = record.Titre;
        const dater = formatDate(record.date_retour);
        const daterem = formatDate(record.date_emprunt);

        const subject='Rappel: Retour de livre';
        const text=`Bonjour ${prenom},\n\nCeci est un rappel que vous devez retourner le livre intitulé "${titre}" emprunté le "${daterem}".\n\nCordialement,\nVotre Bibliothèque`;
        const subject1='Rappel: Recupération de livre';
        const text2=`Bonjour ${prenom},\n\nCeci est un rappel que vous devez passer recuperer le livre intitulé "${titre}" reservé pour le "${daterem}" .\n\nCordialement,\nVotre Bibliothèque`;

        if (dater == today) {
          sendEmail(email, subject, text);
         } 
         else if (daterem == today) {
          sendEmail(email, subject1, text2);
          }
       else{
          console.log('Informations manquantes pour l\'email');
        }
      });
    }
  });
});
// fin email send 


<<<<<<< HEAD
app.post('/app/ajout-livre', upload.single('photo'), async (req, res) => {
  const { Titre, Auteur, Date_publication, resume, genres: genresStr } = req.body;
  const genres = JSON.parse(genresStr);
  console.log(genres)

  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }

  const photoPath = req.file.path;
  let photoData;

  try {
    photoData = fs.readFileSync(photoPath); // Lire le contenu binaire du fichier
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error.message);
    return res.status(500).json({ message: 'Erreur lors de la lecture du fichier', error: error.message });
  }

  try {
    // Insérer le livre
    const result = await db.query(
      'INSERT INTO Livre (Titre, Auteur, Date_publication, photo, resume) VALUES (?, ?, ?, ?, ?)', 
      [Titre, Auteur, Date_publication, photoData, resume]
    );

    const aa = await db.query(
      'SELECT MAX(Id_livre) as tampe FROM livre', async (error, results, fields) => {
        console.log(results[0].tampe);

        // console.log(bookId)
        const iteratorValue = genres.values();
        const tt = results[0].tampe;
        if (genres.length > 0) {
          for (const val of iteratorValue){
            await db.query('INSERT INTO genre_livre (Livre_Id_livre, Genre_Id_genre) VALUES (?, ?)', [tt,val])
          }
        }
        
      }
    );
    

    res.status(201).json({ message: 'Livre ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lorsd de l\'ajout du livre:', error.message);
    res.status(500).json({ message: 'Erreur lorsd de l\'ajout du livre', error: error.message });
  } finally {
    // Nettoyer le fichier temporaire après l'insertion
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }
});



process.on('uncaughtException', (error) => {
  console.error('Erreur non interceptée:', error);
});

// Écoute des promesses rejetées non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet de promesse non géré:', promise, 'raison:', reason);
});


=======
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
// Add a like
// Backend (Node.js/Express)

app.listen(port, () => {
  console.log(`Bonjour chef le serveur a démarré sur le port ${port}`);
});
<<<<<<< HEAD

// Maintenir le processus en vie
process.stdin.resume();
=======
>>>>>>> 8de12ab82be0507f09cf18cdc43f454b9050a598
