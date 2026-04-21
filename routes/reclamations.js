// Envoi notification email/sms inline
function envoyerNotification(reclamationId, type) {
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'pambohermane@gmail.com', pass: 'uompfxcdhqjpjhcf' }
  });
  var db2 = require('../models/database');
  db2.get('SELECT * FROM reclamations WHERE id = ?', [reclamationId], function(err, rec) {
    if (!rec) return;
    var messages = {
      creation: { sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' enregistree', texte: 'Bonjour ' + rec.nom_client + ',\n\nVotre reclamation ' + rec.numero_suivi + ' a bien ete enregistree.\n\nCordialement,\nService Clients BCEG' },
      affectation: { sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' en cours', texte: 'Bonjour ' + rec.nom_client + ',\n\nVotre reclamation ' + rec.numero_suivi + ' est en cours de traitement.\n\nCordialement,\nService Clients BCEG' },
      cloture: { sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' cloturee', texte: 'Bonjour ' + rec.nom_client + ',\n\nVotre reclamation ' + rec.numero_suivi + ' a ete cloturee. Merci de votre confiance.\n\nCordialement,\nService Clients BCEG' }
    };
    var msg = messages[type];
    if (!msg) return;
    if (rec.email_client && rec.email_client.includes('@')) {
      transporter.sendMail({ from: '"BCEG Service Clients" <pambohermane@gmail.com>', to: rec.email_client, subject: msg.sujet, text: msg.texte }, function(err) {
        if (err) console.log('Email error:', err.message);
        else console.log('Email envoye a', rec.email_client);
      });
    }
    db2.run('INSERT INTO notifications (reclamation_id, destinataire, type, message, statut) VALUES (?,?,?,?,?)',
      [reclamationId, rec.email_client||rec.telephone_client||'', type, msg.texte, rec.email_client?'envoye':'en_attente_sms']);
  });
}

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');
const dashboardModule = require('./dashboard');
const CATEGORIES = dashboardModule.CATEGORIES;
const statsBadge = dashboardModule.statsBadge;
const genererCSS = dashboardModule.genererCSS;

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random()*1E9) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 } });

const AGENCES = ['Agence Okoume (Siege)','Agence Movingui','Agence Bilinga','Point Cash Tali','Point Cash Akanda','Bureau Ozigo (Port-Gentil)','Agence Azobe'];
const DEPARTEMENTS = ['Comptabilite','Informatique','Engagements','Digital','Operations'];

// FORMULAIRE NOUVELLE RECLAMATION
router.get('/nouvelle', authMiddleware, (req, res) => {
  const css = genererCSS();
  const user = req.user;

  var catsHTML = Object.entries(CATEGORIES).map(function(entry) {
    return '<optgroup label="' + entry[0] + '">' +
      entry[1].map(function(c){ return '<option value="' + entry[0] + '|' + c + '">' + c + '</option>'; }).join('') +
      '</optgroup>';
  }).join('');

  var agencesHTML = AGENCES.map(function(a){ return '<option>' + a + '</option>'; }).join('');

  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Nouvelle Reclamation — BCEG</title>
<style>${css}</style>
</head>
<body>
<header>
  <div><h1>BCEG — Gestion des Reclamations</h1><p>Saisie d'une nouvelle reclamation</p></div>
  <div class="header-right">
    <span class="user-badge">👤 ${user.prenom} ${user.nom}</span>
    <a href="/logout" class="logout">Deconnexion</a>
  </div>
</header>
<div class="container" style="max-width:800px;">
  <div style="margin-bottom:20px;"><a href="/dashboard" style="color:#4d553d;text-decoration:none;font-weight:700;">← Retour au tableau de bord</a></div>

  <div class="card">
    <div class="card-hdr"><h3>📝 Nouvelle reclamation client</h3></div>
    <form method="POST" action="/reclamation/creer" enctype="multipart/form-data">

      <h4 style="color:#4d553d;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Informations client</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group"><label>Nom complet du client *</label><input type="text" name="nom_client" required placeholder="Ex : ONDO Jean-Baptiste"></div>
        <div class="form-group"><label>Telephone</label><input type="tel" name="telephone_client" placeholder="Ex : 06 12 34 56"></div>
        <div class="form-group"><label>Email client</label><input type="email" name="email_client" placeholder="client@email.com"></div>
        <div class="form-group"><label>Type de client</label>
          <select name="type_client">
            <option>Particulier</option>
            <option>Entreprise moins de 500 MF</option>
            <option>Entreprise plus de 500 MF</option>
            <option>Institutionnel</option>
            <option>Non client</option>
          </select>
        </div>
        <div class="form-group"><label>Agence concernee *</label>
          <select name="agence" required><option value="">-- Selectionnez --</option>${agencesHTML}</select>
        </div>
        <div class="form-group"><label>Canal de reception</label>
          <select name="canal">
            <option>Oral (en agence)</option>
            <option>Telephone</option>
            <option>Email</option>
            <option>Courrier</option>
            <option>Autre</option>
          </select>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <h4 style="color:#4d553d;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Details de la reclamation</h4>

      <div class="form-group"><label>Categorie de la reclamation *</label>
        <select name="categorie" required><option value="">-- Selectionnez un theme --</option>${catsHTML}</select>
      </div>
      <div class="form-group"><label>Description detaillee *</label>
        <textarea name="description" required placeholder="Decrivez la reclamation avec le maximum de details : date des faits, montant concerne, operations impliquees..."></textarea>
      </div>
      <div class="form-group"><label>Priorite</label>
        <select name="priorite">
          <option>Normale</option>
          <option>Haute</option>
          <option>Urgente</option>
        </select>
      </div>
      <div class="form-group"><label>Joindre un document justificatif (optionnel)</label>
        <input type="file" name="fichier" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx">
        <p style="font-size:12px;color:#aaa;margin-top:6px;">PDF, Image, Excel, Word — max 10 Mo</p>
      </div>

      <div style="display:flex;gap:12px;margin-top:8px;">
        <button type="submit" class="btn-primary" style="padding:14px 28px;font-size:15px;">Enregistrer la reclamation</button>
        <a href="/dashboard" style="padding:14px 28px;background:#f0f0f0;color:#555;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">Annuler</a>
      </div>
    </form>
  </div>
</div>
</body></html>`);
});

// CREATION RECLAMATION
router.post('/creer', authMiddleware, upload.single('fichier'), (req, res) => {
  const user = req.user;
  const numero = 'REC-' + Date.now().toString().slice(-6);
  const catParts = (req.body.categorie||'').split('|');
  const departement = catParts[0] || '';
  const categorie = catParts[1] || req.body.categorie;

  db.run(`INSERT INTO reclamations (numero_suivi, initiateur_id, nom_client, telephone_client, email_client, type_client, agence, canal, departement_assigne, categorie, description, priorite)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [numero, user.id, req.body.nom_client, req.body.telephone_client||'', req.body.email_client||'',
     req.body.type_client, req.body.agence, req.body.canal, departement, categorie, req.body.description, req.body.priorite||'Normale'],
    function(err) {
      if (err) return res.redirect('/dashboard?error=1');
      const recId = this.lastID;

      if (req.file) {
        db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action, commentaire, fichier_nom, fichier_path) VALUES (?,?,?,?,?,?)',
          [recId, user.id, 'creation', 'Reclamation creee avec document joint', req.file.originalname, req.file.filename]);
      } else {
        db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action) VALUES (?,?,?)',
          [recId, user.id, 'creation']);
      }

      db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message) VALUES (?,?,?,?)',
        [recId, req.body.email_client||'', 'client', 'Votre reclamation ' + numero + ' a bien ete enregistree. Nous vous repondrons dans les meilleurs delais.']);

      try { envoyerNotification(recId, 'creation'); } catch(e) { console.log('Notif err:', e.message); }
      res.redirect('/reclamation/' + recId + '?success=1');
    }
  );
});

// DETAIL RECLAMATION
router.get('/:id', authMiddleware, (req, res) => {
  const user = req.user;
  db.get('SELECT r.*, u.prenom || " " || u.nom as initiateur_nom FROM reclamations r LEFT JOIN utilisateurs u ON u.id = r.initiateur_id WHERE r.id = ?',
    [req.params.id], function(err, rec) {
    if (!rec) return res.redirect('/dashboard');

    db.all('SELECT t.*, u.prenom || " " || u.nom as auteur_nom, u.role as auteur_role FROM traitements t LEFT JOIN utilisateurs u ON u.id = t.utilisateur_id WHERE t.reclamation_id = ? ORDER BY t.date_action ASC',
      [rec.id], function(err2, traitements) {
      traitements = traitements || [];
      const css = genererCSS();
      const success = req.query.success;

      var agencesHTML = AGENCES.map(function(a){ return '<option>' + a + '</option>'; }).join('');
      var deptsHTML = DEPARTEMENTS.map(function(d){ return '<option value="' + d + '" ' + (rec.departement_assigne===d?'selected':'') + '>' + d + '</option>'; }).join('');

      var historiqueHTML = traitements.map(function(t) {
        var icon = t.action==='creation'?'📝':t.action==='affectation'?'➡️':t.action==='traitement'?'✅':t.action==='rejet'?'❌':'💬';
        var fichierBtn = t.fichier_path ? '<br><a href="/fichier/' + t.fichier_path + '" target="_blank" style="color:#2d6a9f;font-size:12px;">📎 ' + t.fichier_nom + '</a>' : '';
        return '<div style="display:flex;gap:12px;margin-bottom:16px;">'
          + '<div style="font-size:20px;flex-shrink:0;">' + icon + '</div>'
          + '<div style="background:#f8f9f8;border-radius:10px;padding:12px 16px;flex:1;">'
          + '<div style="font-size:12px;color:#aaa;margin-bottom:4px;">' + (t.date_action||'').toString().substring(0,16) + ' — <b>' + (t.auteur_nom||'Systeme') + '</b></div>'
          + '<div style="font-size:14px;">' + (t.commentaire||t.action) + fichierBtn + '</div>'
          + '</div></div>';
      }).join('');

      // Actions selon le role
      var actionsHTML = '';
      if (user.role === 'cec' && rec.statut === 'Nouvelle') {
        actionsHTML = `<div class="card" style="border-top:4px solid #f39c12;">
          <div class="card-hdr"><h3>➡️ Affecter au departement</h3></div>
          <form method="POST" action="/reclamation/${rec.id}/affecter">
            <div class="form-group"><label>Departement</label><select name="departement" required><option value="">-- Selectionnez --</option>${deptsHTML}</select></div>
            <div class="form-group"><label>Commentaire (optionnel)</label><textarea name="commentaire" placeholder="Instructions particulieres pour le departement..."></textarea></div>
            <button type="submit" class="btn-orange">Affecter la reclamation</button>
          </form>
        </div>`;
      } else if (user.role === 'departement' && ['Affectee','En traitement','Complement requis'].includes(rec.statut)) {
        actionsHTML = `<div class="card" style="border-top:4px solid #2d6a9f;">
          <div class="card-hdr"><h3>✅ Traiter la reclamation</h3></div>
          <form method="POST" action="/reclamation/${rec.id}/traiter" enctype="multipart/form-data">
            <div class="form-group"><label>Decision *</label>
              <select name="decision" required>
                <option value="valide">Valide — Reclamation traitee avec succes</option>
                <option value="rejete">Rejete — Reclamation non fondee</option>
                <option value="complement">Complement requis — Informations manquantes</option>
              </select>
            </div>
            <div class="form-group"><label>Explication et reponse au client *</label><textarea name="commentaire" required placeholder="Decrivez le traitement effectue et la reponse a apporter au client..."></textarea></div>
            <div class="form-group"><label>Joindre un justificatif (capture, bon, note...)</label><input type="file" name="fichier" accept=".pdf,.jpg,.jpeg,.png,.xlsx"></div>
            <button type="submit" class="btn-primary">Soumettre le traitement</button>
          </form>
        </div>`;
      } else if (user.role === 'qualite' && rec.statut === 'Traitee') {
        actionsHTML = `<div class="card" style="border-top:4px solid #4d553d;">
          <div class="card-hdr"><h3>✅ Cloturer la reclamation</h3></div>
          <form method="POST" action="/reclamation/${rec.id}/cloturer">
            <div class="form-group"><label>Statut final</label>
              <select name="statut_final">
                <option value="Cloturee">Cloturee — Traitement satisfaisant</option>
                <option value="Rejetee">Rejetee — Reclamation non fondee</option>
              </select>
            </div>
            <div class="form-group"><label>Commentaire qualite</label><textarea name="commentaire" placeholder="Observation qualite sur le traitement..."></textarea></div>
            <button type="submit" class="btn-primary">Cloturer et notifier le client</button>
          </form>
        </div>`;
      }

      res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${rec.numero_suivi} — BCEG Reclamations</title>
<style>${css}</style>
</head>
<body>
<header>
  <div><h1>BCEG — Reclamation ${rec.numero_suivi}</h1><p>${rec.nom_client}</p></div>
  <div class="header-right">
    <span class="user-badge">👤 ${user.prenom} ${user.nom}</span>
    <a href="/logout" class="logout">Deconnexion</a>
  </div>
</header>
<div class="container" style="max-width:1000px;">
  <div style="margin-bottom:20px;"><a href="/dashboard" style="color:#4d553d;text-decoration:none;font-weight:700;">← Retour au tableau de bord</a></div>
  ${success?'<div style="background:#e8f5e9;border-left:4px solid #27ae60;border-radius:10px;padding:12px 16px;margin-bottom:20px;color:#2e7d32;font-weight:600;">✅ Reclamation enregistree avec succes — N° de suivi : <b>' + rec.numero_suivi + '</b></div>':''}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
    <div class="card">
      <div class="card-hdr"><h3>📋 Informations client</h3></div>
      <table style="font-size:13px;">
        <tr><td style="color:#888;padding:6px 0;width:140px;">Numero de suivi</td><td><b style="color:#4d553d;font-family:monospace;">${rec.numero_suivi}</b></td></tr>
        <tr><td style="color:#888;padding:6px 0;">Client</td><td><b>${rec.nom_client}</b></td></tr>
        <tr><td style="color:#888;padding:6px 0;">Telephone</td><td>${rec.telephone_client||'—'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Email</td><td>${rec.email_client||'—'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Type client</td><td>${rec.type_client||'—'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Agence</td><td>${rec.agence||'—'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Canal</td><td>${rec.canal||'—'}</td></tr>
      </table>
    </div>
    <div class="card">
      <div class="card-hdr"><h3>⚙️ Statut du traitement</h3></div>
      <table style="font-size:13px;">
        <tr><td style="color:#888;padding:6px 0;width:140px;">Statut</td><td>${statsBadge(rec.statut)}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Priorite</td><td><b>${rec.priorite||'Normale'}</b></td></tr>
        <tr><td style="color:#888;padding:6px 0;">Departement</td><td>${rec.departement_assigne?'<span class="tag bleu">'+rec.departement_assigne+'</span>':'<span style="color:#aaa;">Non affectee</span>'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Categorie</td><td>${rec.categorie||'—'}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Date reception</td><td>${(rec.date_reception||'').toString().substring(0,16)}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Initiateur</td><td>${rec.initiateur_nom||'—'}</td></tr>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-hdr"><h3>📄 Description de la reclamation</h3></div>
    <p style="font-size:14px;line-height:1.7;color:#444;">${rec.description}</p>
  </div>

  ${actionsHTML}

  <div class="card">
    <div class="card-hdr"><h3>🕐 Historique du traitement</h3></div>
    ${historiqueHTML||'<div class="empty">Aucun historique</div>'}
  </div>
</div>
</body></html>`);
    });
  });
});

// AFFECTER
router.post('/:id/affecter', authMiddleware, (req, res) => {
  const user = req.user;
  const { departement, commentaire } = req.body;
  db.run('UPDATE reclamations SET statut="Affectee", departement_assigne=?, cec_id=?, date_affectation=datetime("now") WHERE id=?',
    [departement, user.id, req.params.id], function(err) {
      db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action, commentaire) VALUES (?,?,?,?)',
        [req.params.id, user.id, 'affectation', 'Reclamation affectee au departement ' + departement + (commentaire?'. Note : '+commentaire:'')]);
      try { envoyerNotification(req.params.id, 'affectation'); } catch(e) {}
      res.redirect('/reclamation/' + req.params.id);
    }
  );
});

// TRAITER
router.post('/:id/traiter', authMiddleware, upload.single('fichier'), (req, res) => {
  const user = req.user;
  const { decision, commentaire } = req.body;
  var statut = decision === 'valide' ? 'Traitee' : decision === 'rejete' ? 'Rejetee' : 'Complement requis';
  var action = decision === 'valide' ? 'traitement' : decision === 'rejete' ? 'rejet' : 'complement';

  db.run('UPDATE reclamations SET statut=?, date_traitement=datetime("now") WHERE id=?', [statut, req.params.id], function(err) {
    var fichierNom = req.file ? req.file.originalname : null;
    var fichierPath = req.file ? req.file.filename : null;
    db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action, commentaire, fichier_nom, fichier_path) VALUES (?,?,?,?,?,?)',
      [req.params.id, user.id, action, commentaire, fichierNom, fichierPath]);
    res.redirect('/reclamation/' + req.params.id);
  });
});

// CLOTURER
router.post('/:id/cloturer', authMiddleware, (req, res) => {
  const user = req.user;
  const { statut_final, commentaire } = req.body;
  db.run('UPDATE reclamations SET statut=?, date_cloture=datetime("now") WHERE id=?', [statut_final, req.params.id], function(err) {
    db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action, commentaire) VALUES (?,?,?,?)',
      [req.params.id, user.id, 'cloture', commentaire||'Reclamation cloturee par la Qualite']);

    db.get('SELECT * FROM reclamations WHERE id=?', [req.params.id], function(err2, rec) {
      if (rec && rec.email_client) {
        db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message) VALUES (?,?,?,?)',
          [req.params.id, rec.email_client, 'client_cloture', 'Votre reclamation ' + rec.numero_suivi + ' a ete ' + statut_final.toLowerCase() + '. Merci de votre confiance.']);
      }
    });
    try { envoyerNotification(req.params.id, 'cloture'); } catch(e) {}
    res.redirect('/reclamation/' + req.params.id);
  });
});

// SERVIR FICHIERS
router.get('/fichier/:filename', authMiddleware, (req, res) => {
  var filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).send('Fichier non trouve');
});

module.exports = router;

// ============================================================
// PAGE PUBLIQUE - DEPOT RECLAMATION CLIENT (sans connexion)
// ============================================================
router.get('/public', (req, res) => {
  var agencesHTML = ['Agence Okoume (Siege)','Agence Movingui','Agence Bilinga','Point Cash Tali','Point Cash Akanda','Bureau Ozigo (Port-Gentil)','Agence Azobe']
    .map(function(a){ return '<option>' + a + '</option>'; }).join('');

  var catsHTML = Object.entries(CATEGORIES).map(function(entry) {
    return '<optgroup label="' + entry[0] + '">' +
      entry[1].map(function(c){ return '<option value="' + entry[0] + '|' + c + '">' + c + '</option>'; }).join('') +
      '</optgroup>';
  }).join('');

  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Deposer une reclamation — BCEG</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#f3f6f3,#e8ede8);min-height:100vh;color:#2c2c2c;}
header{background:linear-gradient(135deg,#4d553d,#3a4130);color:white;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;}
header h1{font-size:22px;font-weight:800;}
header p{font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px;}
.container{max-width:640px;margin:0 auto;padding:24px 16px 60px;}
.intro{background:white;border-radius:20px;padding:24px;margin-bottom:20px;border-left:6px solid #c0622a;box-shadow:0 8px 32px rgba(0,0,0,0.1);}
.intro h2{color:#c0622a;font-size:20px;font-weight:800;margin-bottom:8px;}
.intro p{color:#666;font-size:14px;line-height:1.6;}
.card{background:white;border-radius:16px;padding:22px;margin-bottom:14px;box-shadow:0 4px 16px rgba(0,0,0,0.06);}
.card h3{font-size:13px;font-weight:800;color:#4d553d;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #e8ede8;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:500px){.grid2{grid-template-columns:1fr;}}
.form-group{margin-bottom:14px;}
.form-group label{display:block;font-weight:700;font-size:12px;color:#555;margin-bottom:7px;text-transform:uppercase;letter-spacing:0.5px;}
input,select,textarea{width:100%;padding:13px 14px;border:2px solid #e8e8e8;border-radius:10px;font-size:14px;font-family:inherit;transition:all 0.2s;background:#fafafa;}
input:focus,select:focus,textarea:focus{outline:none;border-color:#4d553d;background:white;box-shadow:0 0 0 3px rgba(77,85,61,0.1);}
textarea{resize:vertical;min-height:110px;}
.upload-zone{border:2px dashed #c8d4c8;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all 0.2s;}
.upload-zone:hover{border-color:#4d553d;background:#f3f6f3;}
.upload-zone .icon{font-size:32px;margin-bottom:8px;}
.upload-zone p{color:#888;font-size:13px;}
.upload-zone .hint{font-size:11px;color:#aaa;margin-top:4px;}
input[type=file]{display:none;}
.file-ok{background:#e8ede8;color:#4d553d;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;margin-top:10px;display:none;}
.submit-btn{width:100%;padding:18px;background:linear-gradient(135deg,#4d553d,#3a4130);color:white;border:none;border-radius:14px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(77,85,61,0.35);transition:all 0.2s;}
.submit-btn:hover{transform:translateY(-2px);}
.note{text-align:center;font-size:12px;color:#aaa;margin-top:14px;line-height:1.6;}
.success{display:none;text-align:center;background:white;border-radius:24px;padding:48px 24px;box-shadow:0 16px 64px rgba(0,0,0,0.12);}
.numero-suivi{font-size:28px;font-weight:800;color:#4d553d;background:#e8ede8;padding:16px 28px;border-radius:12px;display:inline-block;margin:20px 0;letter-spacing:3px;font-family:monospace;}
</style>
</head>
<body>
<header>
  <div>
    <h1>BCEG</h1>
    <p>Banque pour le Commerce et l'Entrepreneuriat du Gabon</p>
  </div>
  <div style="font-size:28px;">📋</div>
</header>
<div class="container">
  <div class="intro">
    <h2>⚠️ Deposer une reclamation</h2>
    <p>Vous avez rencontre un probleme avec nos services ? Decrivez-le ici. Notre equipe prendra en charge votre reclamation dans les <strong>48 heures ouvrables</strong>.</p>
  </div>

  <form id="reclamationForm" enctype="multipart/form-data">

    <div class="card">
      <h3>👤 Vos informations</h3>
      <div class="grid2">
        <div class="form-group"><label>Nom complet *</label><input type="text" name="nom_client" placeholder="ONDO Jean-Baptiste" required></div>
        <div class="form-group"><label>Telephone *</label><input type="tel" name="telephone_client" placeholder="06 12 34 56" required></div>
      </div>
      <div class="grid2">
        <div class="form-group"><label>Email (optionnel)</label><input type="email" name="email_client" placeholder="votre@email.com"></div>
        <div class="form-group"><label>Type de client</label>
          <select name="type_client">
            <option>Particulier</option>
            <option>Entreprise moins de 500 MF</option>
            <option>Entreprise plus de 500 MF</option>
            <option>Institutionnel</option>
            <option>Non client</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>🏦 Votre reclamation</h3>
      <div class="grid2">
        <div class="form-group"><label>Agence concernee *</label>
          <select name="agence" required><option value="">-- Selectionnez --</option>${agencesHTML}</select>
        </div>
        <div class="form-group"><label>Canal de contact</label>
          <select name="canal">
            <option>Oral (en agence)</option>
            <option>Telephone</option>
            <option>Email</option>
            <option>Autre</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Categorie de la reclamation *</label>
        <select name="categorie" required><option value="">-- Selectionnez le type de probleme --</option>${catsHTML}</select>
      </div>
      <div class="form-group"><label>Description detaillee *</label>
        <textarea name="description" required placeholder="Decrivez votre probleme en detail : date, montant concerne, operations impliquees..."></textarea>
      </div>
    </div>

    <div class="card">
      <h3>📎 Document justificatif (optionnel)</h3>
      <div class="upload-zone" onclick="document.getElementById('fichier').click()">
        <div class="icon">📎</div>
        <p>Cliquez pour ajouter un document</p>
        <p class="hint">PDF, Photo, Image — maximum 10 Mo</p>
      </div>
      <input type="file" id="fichier" name="fichier" accept=".pdf,.jpg,.jpeg,.png" onchange="afficherFichier(this)">
      <div class="file-ok" id="fileOk"></div>
    </div>

    <button type="submit" class="submit-btn">Envoyer ma reclamation →</button>
    <p class="note">🔒 Vos informations sont confidentielles et utilisees uniquement pour le traitement de votre reclamation.</p>
  </form>

  <div class="success" id="successScreen">
    <div style="font-size:72px;margin-bottom:16px;">✅</div>
    <h2 style="font-size:26px;font-weight:800;color:#4d553d;margin-bottom:12px;">Reclamation enregistree !</h2>
    <p style="color:#666;font-size:15px;">Votre reclamation a bien ete recue.<br>Voici votre numero de suivi :</p>
    <div class="numero-suivi" id="numeroSuivi"></div>
    <p style="color:#666;font-size:14px;">Conservez ce numero — Notre equipe vous contactera<br>dans les <strong>48 heures ouvrables</strong>.</p>
    <br>
    <p style="color:#4d553d;font-weight:800;font-size:16px;">Merci de votre confiance. 🙏</p>
  </div>
</div>

<script>
function afficherFichier(input) {
  if (input.files && input.files[0]) {
    var ok = document.getElementById('fileOk');
    ok.textContent = '✓ ' + input.files[0].name;
    ok.style.display = 'block';
  }
}
document.getElementById('reclamationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var btn = this.querySelector('.submit-btn');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  var formData = new FormData(e.target);
  fetch('/reclamation/public/soumettre', { method: 'POST', body: formData })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    document.getElementById('numeroSuivi').textContent = data.numero || 'REC-000000';
    e.target.style.display = 'none';
    document.querySelector('.intro').style.display = 'none';
    document.getElementById('successScreen').style.display = 'block';
    window.scrollTo(0, 0);
  }).catch(function() {
    btn.textContent = 'Envoyer ma reclamation →';
    btn.disabled = false;
    alert('Une erreur est survenue. Veuillez reessayer.');
  });
});
</script>
</body></html>`);
});

// SOUMISSION PUBLIQUE
router.post('/public/soumettre', upload.single('fichier'), (req, res) => {
  const numero = 'REC-' + Date.now().toString().slice(-6);
  const catParts = (req.body.categorie||'').split('|');
  const departement = catParts[0] || '';
  const categorie = catParts[1] || req.body.categorie;

  db.run(`INSERT INTO reclamations (numero_suivi, nom_client, telephone_client, email_client, type_client, agence, canal, departement_assigne, categorie, description, statut)
    VALUES (?,?,?,?,?,?,?,?,?,?,'Nouvelle')`,
    [numero, req.body.nom_client, req.body.telephone_client||'', req.body.email_client||'',
     req.body.type_client, req.body.agence, req.body.canal, departement, categorie, req.body.description],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur', numero: 'REC-'+Date.now().toString().slice(-6) });
      const recId = this.lastID;

      if (req.file) {
        db.run('INSERT INTO traitements (reclamation_id, utilisateur_id, action, fichier_nom, fichier_path) VALUES (?,?,?,?,?)',
          [recId, 0, 'creation_client', req.file.originalname, req.file.filename]);
      }

      db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message, statut) VALUES (?,?,?,?,?)',
        [recId, req.body.telephone_client||'', 'creation', 'Reclamation ' + numero + ' enregistree', 'envoye']);

      try { envoyerNotification(recId, 'creation'); } catch(e) {}

      res.json({ success: true, numero });
    }
  );
});
