require('dotenv').config({ path: '../../.env' });
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const schedule = require('node-schedule');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'biblio'
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    return;
  }
  console.log('Connecté à la base de données');
});

// Configuration de Nodemailer
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
const job = schedule.scheduleJob('00 08 * * *', function() {
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
