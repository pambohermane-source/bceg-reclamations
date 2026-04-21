const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { SECRET } = require('../middleware/auth');

const VERT = '#4d553d';

const roleLabels = {
  'cec': 'Charge Ecoute Client',
  'qualite': 'Charge Qualite',
  'departement': 'Departement',
  'direction': 'Direction'
};

router.get('/login', (req, res) => {
  const error = req.query.error;
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Connexion — BCEG Reclamations</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#2c3e25 0%,#4d553d 50%,#3a4130 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;}
.login-container{background:white;border-radius:24px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 32px 80px rgba(0,0,0,0.3);}
.logo{text-align:center;margin-bottom:32px;}
.logo h1{font-size:42px;font-weight:900;color:#4d553d;letter-spacing:-2px;}
.logo p{font-size:13px;color:#aaa;margin-top:4px;}
.titre{font-size:22px;font-weight:800;color:#2c2c2c;margin-bottom:8px;}
.sous-titre{font-size:13px;color:#888;margin-bottom:28px;}
label{display:block;font-size:13px;font-weight:700;color:#444;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;}
input{width:100%;padding:14px 16px;border:2px solid #e8e8e8;border-radius:12px;font-size:15px;font-family:inherit;transition:all 0.2s;background:#fafafa;margin-bottom:16px;}
input:focus{outline:none;border-color:#4d553d;background:white;box-shadow:0 0 0 4px rgba(77,85,61,0.1);}
.btn{width:100%;padding:16px;background:linear-gradient(135deg,#4d553d,#3a4130);color:white;border:none;border-radius:12px;font-size:17px;font-weight:800;cursor:pointer;transition:all 0.2s;margin-top:8px;}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(77,85,61,0.4);}
.error{background:#fde8e8;color:#c0392b;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:600;margin-bottom:20px;border-left:4px solid #e74c3c;}
.footer-note{text-align:center;font-size:12px;color:#aaa;margin-top:24px;}
.divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
.divider hr{flex:1;border:none;border-top:1px solid #eee;}
.divider span{font-size:12px;color:#bbb;}
</style>
</head>
<body>
<div class="login-container">
  <div class="logo">
    <h1>BCEG</h1>
    <p>Banque pour le Commerce et l'Entrepreneuriat du Gabon</p>
  </div>
  ${error ? '<div class="error">Email ou mot de passe incorrect. Veuillez reessayer.</div>' : ''}
  <div class="titre">Connexion</div>
  <div class="sous-titre">Plateforme de gestion des reclamations clients</div>
  <form method="POST" action="/login">
    <label>Adresse email</label>
    <input type="email" name="email" placeholder="votre@bceg.ga" required autofocus>
    <label>Mot de passe</label>
    <input type="password" name="mot_de_passe" placeholder="••••••••••" required>
    <button type="submit" class="btn">Se connecter</button>
  </form>
  <p class="footer-note">Acces reserve au personnel BCEG autorise</p>
</div>
</body></html>`);
});

router.post('/login', (req, res) => {
  const { email, mot_de_passe } = req.body;
  db.get('SELECT * FROM utilisateurs WHERE email = ? AND actif = 1', [email], function(err, user) {
    if (!user) return res.redirect('/login?error=1');
    if (!bcrypt.compareSync(mot_de_passe, user.mot_de_passe)) return res.redirect('/login?error=1');

    db.run('UPDATE utilisateurs SET derniere_connexion = datetime("now") WHERE id = ?', [user.id]);

    const token = jwt.sign({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      departement: user.departement
    }, SECRET, { expiresIn: '8h' });

    res.cookie('token', token, { httpOnly: true, maxAge: 8*60*60*1000 });
    res.redirect('/dashboard');
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
