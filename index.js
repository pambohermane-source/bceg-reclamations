const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const db = require('./models/database');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reclamationsRoutes = require('./routes/reclamations');
const statistiquesRoutes = require('./routes/statistiques');
const enquetesRoutes = require('./routes/enquetes');
const { CATEGORIES } = require('./routes/dashboard');

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const AGENCES = ['Agence Okoume (Siege)','Agence Movingui','Agence Bilinga','Point Cash Tali','Point Cash Akanda','Bureau Ozigo (Port-Gentil)','Agence Azobe'];

// =============================================
// ROUTES PUBLIQUES (sans connexion)
// =============================================

app.get('/depot-reclamation', (req, res) => {
  var agencesHTML = AGENCES.map(function(a){ return '<option>' + a + '</option>'; }).join('');
  var cats = {
    'Comptabilite': ['Generalite','Contestation d agios','Contestation de date de valeur','Interets non credites','Interets mal calcules','Contestation frais de forcage','Perte de TPE','Litige sur transaction TPE'],
    'Informatique': ['Generalite','Parametrage comptes sur BCEGMobile','Compte BCEGMobile non visible','Virement autre banque via BCEGMobile non parvenu','Demande d avis d operation','Extrait de compte non parvenu'],
    'Engagements': ['Generalite','Main levee sur caution douaniere','Contestation des frais de dossier','Decouvert non parametre','Contestation echeance credit','Conditions particulieres non parametrees'],
    'Digital': ['Generalite','Difficulte de connexion sur B-Online','Mot de passe B-Online oublie ou bloque','Compte B-Online inaccessible','Demande de dechargement CVP','Remboursement retrait sans carte infructueux','Ajustement solde CVP','Analyse des mouvements CVP','Rechargement CVP non credite','Rechargement compte virtuel infructueux','Virement compte virtuel infructueux','Achat EDAN infructueux','Achat unites telephoniques infructueux','Retrait GAB BCEG infructueux et comptabilise','Transfert GIMAC wallet to wallet infructueux'],
    'Operations': ['Virement intra non parvenu','Virement bilateral non parvenu','Remise cheque non creditee','Cheque non credite','Paiement cheque non reconnu','Contestation de frais','Contestation interet DAT','Versement guichet non credite','Operation non reconnue','Opposition carte non traitee','Operation mal executee','Operation debitee en double','Paiement TPE infructueux et comptabilise','Opposition TPE non traitee','Virement TRF international non parvenu','Rapatriement non recu','Contestation taux de devise','Demande de sort de virement']
  };
  var catsHTML = Object.entries(cats).map(function(entry) {
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
header h1{font-size:22px;font-weight:800;}header p{font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px;}
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
input:focus,select:focus,textarea:focus{outline:none;border-color:#4d553d;background:white;}
textarea{resize:vertical;min-height:110px;}
.upload-zone{border:2px dashed #c8d4c8;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all 0.2s;}
.upload-zone:hover{border-color:#4d553d;background:#f3f6f3;}
.upload-zone .icon{font-size:32px;margin-bottom:8px;}
.upload-zone p{color:#888;font-size:13px;}
.hint{font-size:11px;color:#aaa;margin-top:4px;}
input[type=file]{display:none;}
.file-ok{background:#e8ede8;color:#4d553d;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;margin-top:10px;display:none;}
.submit-btn{width:100%;padding:18px;background:linear-gradient(135deg,#c0622a,#e07b39);color:white;border:none;border-radius:14px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(192,98,42,0.35);transition:all 0.2s;}
.submit-btn:hover{transform:translateY(-2px);}
.note{text-align:center;font-size:12px;color:#aaa;margin-top:14px;line-height:1.6;}
.success{display:none;text-align:center;background:white;border-radius:24px;padding:48px 24px;box-shadow:0 16px 64px rgba(0,0,0,0.12);}
.numero-suivi{font-size:28px;font-weight:800;color:#4d553d;background:#e8ede8;padding:16px 28px;border-radius:12px;display:inline-block;margin:20px 0;letter-spacing:3px;font-family:monospace;}
</style>
</head>
<body>
<header>
  <div><h1>BCEG</h1><p>Banque pour le Commerce et l'Entrepreneuriat du Gabon</p></div>
  <div style="font-size:28px;">📋</div>
</header>
<div class="container">
  <div class="intro">
    <h2>⚠️ Deposer une reclamation</h2>
    <p>Vous avez rencontre un probleme avec nos services ? Notre equipe vous repondra dans les <strong>48 heures ouvrables</strong>.</p>
  </div>
  <form id="reclamationForm">
    <div class="card">
      <h3>👤 Vos informations</h3>
      <div class="grid2">
        <div class="form-group"><label>Nom complet *</label><input type="text" name="nom_client" placeholder="ONDO Jean-Baptiste" required></div>
        <div class="form-group"><label>Telephone *</label><input type="tel" name="telephone_client" placeholder="06 12 34 56" required></div>
      </div>
      <div class="grid2">
        <div class="form-group"><label>Email (optionnel)</label><input type="email" name="email_client" placeholder="votre@email.com"></div>
        <div class="form-group"><label>Type de client</label>
          <select name="type_client"><option>Particulier</option><option>Entreprise moins de 500 MF</option><option>Entreprise plus de 500 MF</option><option>Institutionnel</option><option>Non client</option></select>
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
          <select name="canal"><option>Oral (en agence)</option><option>Telephone</option><option>Email</option><option>Autre</option></select>
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
        <p class="hint">PDF, Photo — maximum 10 Mo</p>
      </div>
      <input type="file" id="fichier" name="fichier" accept=".pdf,.jpg,.jpeg,.png">
      <div class="file-ok" id="fileOk"></div>
    </div>
    <button type="submit" class="submit-btn">Envoyer ma reclamation →</button>
    <p class="note">🔒 Vos informations sont confidentielles.</p>
  </form>
  <div class="success" id="successScreen">
    <div style="font-size:72px;margin-bottom:16px;">✅</div>
    <h2 style="font-size:26px;font-weight:800;color:#4d553d;margin-bottom:12px;">Reclamation enregistree !</h2>
    <p style="color:#666;font-size:15px;">Votre reclamation a bien ete recue.<br>Voici votre numero de suivi :</p>
    <div class="numero-suivi" id="numeroSuivi"></div>
    <p style="color:#666;font-size:14px;">Notre equipe vous contactera dans les <strong>48 heures ouvrables</strong>.</p>
    <br><p style="color:#4d553d;font-weight:800;font-size:16px;">Merci de votre confiance. 🙏</p>
  </div>
</div>
<script>
function afficherFichier(input) {
  if (input.files && input.files[0]) {
    var ok = document.getElementById('fileOk');
    ok.textContent = 'Fichier : ' + input.files[0].name;
    ok.style.display = 'block';
  }
}
document.getElementById('fichier').addEventListener('change', function(){ afficherFichier(this); });
document.getElementById('reclamationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var btn = this.querySelector('.submit-btn');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  var formData = new FormData(e.target);
  fetch('/depot-reclamation/soumettre', { method: 'POST', body: formData })
  .then(function(r){ return r.json(); })
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

app.post('/depot-reclamation/soumettre', upload.single('fichier'), (req, res) => {
  const numero = 'REC-' + Date.now().toString().slice(-6);
  const catParts = (req.body.categorie||'').split('|');
  const departement = catParts[0] || '';
  const categorie = catParts[1] || req.body.categorie;

  db.run(`INSERT INTO reclamations (numero_suivi, nom_client, telephone_client, email_client, type_client, agence, canal, departement_assigne, categorie, description, statut)
    VALUES (?,?,?,?,?,?,?,?,?,?,'Nouvelle')`,
    [numero, req.body.nom_client, req.body.telephone_client||'', req.body.email_client||'',
     req.body.type_client||'Particulier', req.body.agence, req.body.canal||'Autre',
     departement, categorie, req.body.description],
    function(err) {
      if (err) { console.log('DB error:', err.message); return res.status(500).json({ error: 'Erreur', numero: 'REC-'+Date.now().toString().slice(-6) }); }
      res.json({ success: true, numero });
    }
  );
});

// Route enquete client publique
app.get('/enquete-client/:numero', (req, res) => {
  req.url = '/client/' + req.params.numero;
  enquetesRoutes(req, res, function(){});
});

app.post('/enquetes/soumettre/:numero', (req, res, next) => {
  enquetesRoutes(req, res, next);
});

// Servir les fichiers uploads (accessible connecte)
const fs = require('fs');
app.get('/fichier/:filename', (req, res) => {
  var filePath = require('path').join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) res.sendFile(require('path').resolve(filePath));
  else res.status(404).send('Fichier non trouve');
});

// =============================================
// ROUTES PROTEGEES
// =============================================
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reclamation', reclamationsRoutes);
app.use('/statistiques', statistiquesRoutes);
app.use('/enquetes', enquetesRoutes);

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('BCEG Reclamations demarre sur le port ' + PORT);
});
