const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'reclamations.db'));

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    role TEXT NOT NULL,
    departement TEXT,
    actif INTEGER DEFAULT 1,
    date_creation DATETIME DEFAULT (datetime('now')),
    derniere_connexion DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reclamations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_suivi TEXT UNIQUE NOT NULL,
    initiateur_id INTEGER,
    nom_client TEXT NOT NULL,
    telephone_client TEXT,
    email_client TEXT,
    type_client TEXT,
    agence TEXT,
    canal TEXT,
    departement_assigne TEXT,
    cec_id INTEGER,
    categorie TEXT NOT NULL,
    sous_categorie TEXT,
    description TEXT NOT NULL,
    statut TEXT DEFAULT 'Nouvelle',
    priorite TEXT DEFAULT 'Normale',
    date_reception DATETIME DEFAULT (datetime('now')),
    date_affectation DATETIME,
    date_traitement DATETIME,
    date_cloture DATETIME,
    FOREIGN KEY (initiateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (cec_id) REFERENCES utilisateurs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS traitements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reclamation_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    commentaire TEXT,
    fichier_nom TEXT,
    fichier_path TEXT,
    date_action DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reclamation_id INTEGER,
    destinataire TEXT,
    type TEXT,
    message TEXT,
    statut TEXT DEFAULT 'envoye',
    date_envoi DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enquetes_post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reclamation_id INTEGER,
    canal_reclamation TEXT,
    reponse_recue INTEGER,
    satisfaction_reponse INTEGER,
    raison_insatisfaction TEXT,
    satisfaction_delai INTEGER,
    remarques TEXT,
    date_reponse DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id)
  )`);

  var utilisateurs = [
    { nom: 'OVONO NGUI', prenom: 'Flore Mariane', email: 'f.ovono-ngui@bceg.ga', role: 'cec', departement: null, mdp: 'CEC@bceg2026' },
    { nom: 'OKOME MENIE', prenom: 'Marcelle Theau', email: 'm.okome@bceg.ga', role: 'qualite', departement: null, mdp: 'Qualite@bceg2026' },
    { nom: 'OBAME NGUEMA', prenom: 'Alex', email: 'a.obame@bceg.ga', role: 'departement', departement: 'Comptabilite', mdp: 'Compta@bceg2026' },
    { nom: 'MINKO MOBAME', prenom: 'Fabrice', email: 'f.minko@bgfi.com', role: 'departement', departement: 'Informatique,Digital', mdp: 'Info@bceg2026' },
    { nom: 'YAFAMA', prenom: 'Nina Pelagie', email: 'n.yafama@bceg.ga', role: 'departement', departement: 'Engagements', mdp: 'Engag@bceg2026' },
    { nom: 'MOUYEGHE LIKASSA', prenom: 'Jennifer', email: 'j.likassa@bceg.ga', role: 'departement', departement: 'Operations', mdp: 'Oper@bceg2026' },
    { nom: 'MFOULOUH', prenom: 'Ghislain', email: 'g.mfoulouh@bceg.ga', role: 'direction', departement: 'DGA', mdp: 'DGA@bceg2026' },
    { nom: 'NTOUTOUME', prenom: 'Daisy-Helen', email: 'd.ntoutoume@bceg.ga', role: 'direction', departement: 'DG', mdp: 'DG@bceg2026' },
    { nom: 'PAMBO', prenom: 'Taty Hermane', email: 'h.pambo@bceg.ga', role: 'departement', departement: 'Digital', mdp: 'Digital@bceg2026' }
  ];

  utilisateurs.forEach(function(u) {
    db.get('SELECT id FROM utilisateurs WHERE email = ?', [u.email], function(err, row) {
      if (!row) {
        var hash = bcrypt.hashSync(u.mdp, 10);
        db.run('INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, departement) VALUES (?,?,?,?,?,?)',
          [u.nom, u.prenom, u.email, hash, u.role, u.departement]);
      }
    });
  });

  console.log('Base de donnees reclamations initialisee');
});

module.exports = db;
