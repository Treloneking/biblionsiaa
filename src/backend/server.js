
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

  const sql = 'SELECT Prenom FROM utilisateur WHERE Id_user = ? AND Mot_de_passe = ?';
  const values = [Id_user, Mot_de_passe];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de serveur' });
    }

    if (results.length > 0) {
      const jwtSecret = process.env.JWT_SECRET;
      const Prenom = results[0].Prenom;
      const token = jwt.sign({ Id_user, Prenom }, jwtSecret, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Connexion réussie', token, Prenom });
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

app.get('/app/plusinfo', (req, res) => {
  const { matricule } = req.query;
  const sql = `
    SELECT 
      e.Mat_employe, e.Nom_employe, e.Prenom_employe, e.Email, e.Telephone, 
      e.Date_naissance, e.Nationnalite, e.Sexe, e.Compte_Id_compte, 
      d.Chef_direction, d.Nom_direction,
      t.Date_debut,t.Date_fin,
      a.Nom_agence,a.Lieu_agence,
      c.N_contrat,c.Date_debut_c,c.Date_fin_c,
      c.Type_contrat_Id_type_contrat
    FROM Employe e
    LEFT JOIN Travail t ON e.Mat_employe = t.Employe_Mat_employe
    LEFT JOIN Agence a ON t.Agence_Id_agence = a.Id_agence
    LEFT JOIN direction d ON e.Direction_code = d.Code_direction
    LEFT JOIN Contrat c ON e.Mat_employe = c.Employe_Mat_employe
    LEFT JOIN  Type_contrat tc ON tc.Id_type_contrat = c.Type_contrat_Id_type_contrat
    WHERE e.Mat_employe LIKE ?;
  `;
  const query = `%${matricule}%`; // Pour permettre la recherche partielle

  db.query(sql, [query], (err, results) => {
    if (err) {
      console.error('Erreur lors de la recherche:', err);
      res.status(500).json({ error: 'Erreur de serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get('/app/recherche', (req, res) => {
  const { matricule, nom, direction, agence,contrat } = req.query;
  let sql = `
  SELECT e.* ,t.*,c.*
  FROM Employe e
  LEFT JOIN Contrat c ON c.Employe_Mat_employe = e.Mat_employe
  LEFT JOIN Travail t ON t.Employe_Mat_employe = e.Mat_employe
  ORDER BY Nom_employe
`;
  let params = [];

  if (matricule || nom || direction || agence || contrat) {
    sql += 'WHERE ';
    if (matricule) {
      sql += 'e.Mat_employe LIKE ?';
      params.push(`%${matricule}%`);
    }
    if (nom) {
      if (matricule) {
        sql += ' AND ';
      }
      sql += 'e.Nom_employe LIKE ?';
      params.push(`%${nom}%`);
    }
    if (direction) {
      if (matricule || nom) {
        sql += ' AND ';
      }
      sql += 'e.Direction_code LIKE ?';
      params.push(`%${direction}%`);
    }
    if (agence) {
      if (matricule || nom || direction) {
        sql += ' AND ';
      }
      sql += 't.Agence_Id_agence LIKE ?';
      params.push(`%${agence}%`);
    }
    if (contrat) {
      if (matricule||nom||direction||agence){
        sql += ' AND ';
      }
      sql += 'c.Type_contrat_Id_type_contrat LIKE ?';
      params.push(`%${contrat}%`);
    }

    
  }

  db.query(sql, params, (err, results) => {

    if (err) {
      return res.status(500).json({ error: 'Erreur de la base de données' });
    }
    res.json(results);
  });
});

app.put('/app/modification', (req, res) => {
  const { Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, Mat_employe,N_contrat } = req.body;
  const sql = `
    UPDATE employe
    JOIN contrat ON contrat.Employe_Mat_employe = employe.Mat_employe
    SET Date_debut_c = ?, Date_fin_c = ?, Type_contrat_Id_type_contrat = ?
    WHERE Mat_employe = ?
  `;
  const values = [Mat_employe,N_contrat,Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, ];
  const valuess = [Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, Mat_employe];
  const archiveQuery = `
  INSERT INTO archive (
   Employe_Mat_employe,
   Contrat_N_contrat,
   Date_debut_c,
   Date_fin_c,
   Type_contrat_Id_type_contrat
  ) VALUES (?,?,?,?,?)
`;
db.query(archiveQuery, [
  Mat_employe,
  N_contrat,
  Date_debut_c,
  Date_fin_c,
  Type_contrat_Id_type_contrat
  
], (err, results) => {
  if (err) {
    return db.rollback(() => {
      res.status(500).json({ error: err.message });
    });
  }

});

    db.query(sql, valuess, (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des données :', err);
        res.status(500).json({ error: 'Erreur de serveur' });
      } else {
        res.status(200).json({ message: 'Données mises à jour avec succès' });
      }
    });

  });
/*});*/
app.get('/app/archiveplus', (req, res) => {
  const matricule = req.query.matricule; // Récupérer le matricule de la requête
  const query = `
    SELECT a.*,e.*,c.N_contrat,c.Date_debut_c,c.Date_fin_c
FROM archive a
LEFT JOIN employe e ON e.Mat_employe = a.Employe_Mat_employe
LEFT JOIN contrat c ON c.N_contrat = a.Contrat_N_contrat
WHERE Mat_employe=?
  `;
  console.log(matricule)
  db.query(query, [matricule], (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des archives.' });
    } else {
      res.json(results);
    }
  });
});



app.get('/app/archive', (req, res) => {
  const query = `
  SELECT e.*,c.*,t.*
FROM employe e
LEFT JOIN travail t ON t.Employe_Mat_employe = e.Mat_employe
LEFT JOIN contrat c ON c.Employe_Mat_employe = e.Mat_employe
ORDER BY Nom_employe
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

app.get('/app/contrat', (req, res) => {
  const query = `
    SELECT c.*,e.*,
    DATEDIFF(date_fin_c, NOW()) AS tempsrestant
    FROM contrat c
    LEFT JOIN Employe e ON c.Employe_Mat_employe = e.Mat_employe
    WHERE DATEDIFF(date_fin_c, NOW()) < 10
    ORDER BY Nom_employe
  `;
  
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des contrats.' });
    } else {
      res.json(results);
    }
  });
});


// Route pour l'inscription
app.post('/app/register', (req, res) => {
  const {
    Mat_employe,
    Nom_employe,
    Prenom_employe,
    Email,
    Telephone,
    Date_naissance,
    Nationnalite,
    Sexe,
    Compte_Id_compte,
    N_contrat,
    Date_debut_c,
    Date_fin_c,
    Date_debut,
    Date_fin,
    Type_contrat_Id_type_contrat,
    Direction_code,
    Id_agence
  } = req.body;


  // Début de la transaction pour insérer dans les deux tables
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Insertion dans la table Employe
    const employeQuery = `
      INSERT INTO Employe (
        Mat_employe, 
        Nom_employe, 
        Prenom_employe, 
        Email, 
        Telephone, 
        Date_naissance, 
        Nationnalite, 
        Sexe, 
        Compte_Id_compte,
        Direction_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(employeQuery, [
      Mat_employe,
      Nom_employe,
      Prenom_employe,
      Email,
      Telephone,
      Date_naissance,
      Nationnalite,
      Sexe,
      Compte_Id_compte,
      Direction_code
    ], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      const employeId = results.insertId;
      
      // Insertion dans la table Contrat
      const contratQuery = `
        INSERT INTO Contrat (
          N_contrat,
          Date_debut_c,
          Date_fin_c,
          Type_contrat_Id_type_contrat,
          Employe_Mat_employe
        ) VALUES (?, ?, ?, ?, ?)
      `;
      db.query(contratQuery, [
        N_contrat,
        Date_debut_c,
        Date_fin_c,
        Type_contrat_Id_type_contrat,
        Mat_employe
      ], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Insertion dans la table Travail
        const travailQuery = `
          INSERT INTO Travail (
            Employe_Mat_employe,
            Agence_Id_agence,
            Date_debut,
            Date_fin
          ) VALUES (?, ?, ?, ?)
        `;
        db.query(travailQuery, [
          Mat_employe,
          Id_agence,
          Date_debut,
          Date_fin
        ], (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }
          const archiveQuery = `
        INSERT INTO archive (
         Employe_Mat_employe,
         Contrat_N_contrat,
         Date_debut_c,
         Date_fin_c,
         Type_contrat_Id_type_contrat
        ) VALUES (?,?,?,?,?)
      `;
      db.query(archiveQuery, [
        Mat_employe,
        N_contrat,
        Date_debut_c,
        Date_fin_c,
        Type_contrat_Id_type_contrat
        
      ], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

          
          // Valider la transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }
            res.status(200).json({ msg: 'Utilisateur et contrat ajoutés avec succès' });
          });
        });
      });
    });
    });
  });
});





app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
