const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const db = require('./models/database');

// CORS — permet au Hub BCEG (Netlify) de communiquer avec ce serveur
app.use(function(req, res, next) {
  var allowed = [
    'https://mellow-pithivier-4b32b4.netlify.app',
    'https://bceg-reclamations-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  var origin = req.headers.origin;
  if (allowed.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reclamationsRoutes = require('./routes/reclamations');
const statistiquesRoutes = require('./routes/statistiques');
const enquetesRoutes = require('./routes/enquetes');

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const CATEGORIES = {
  'Comptabilite': ['Contestation d agios','Contestation de date de valeur','Interets non credites','Interets mal calcules','Contestation frais de forcage','Perte de TPE','Litige sur transaction TPE'],
  'Informatique': ['Parametrage comptes BCEGMobile','Compte BCEGMobile non visible','Virement autre banque via BCEGMobile non parvenu','Demande d avis d operation','Extrait de compte non parvenu'],
  'Engagements': ['Main levee sur caution douaniere','Contestation des frais de dossier','Decouvert non parametre','Contestation echeance credit','Conditions particulieres non parametrees'],
  'Digital': ['Difficulte de connexion sur B-Online','Mot de passe B-Online oublie ou bloque','Compte B-Online inaccessible','Demande de dechargement CVP','Remboursement retrait sans carte infructueux','Ajustement solde CVP','Analyse des mouvements CVP','Rechargement CVP non credite','Rechargement compte virtuel infructueux','Virement compte virtuel infructueux','Achat EDAN infructueux','Achat unites telephoniques infructueux','Retrait GAB BCEG infructueux et comptabilise','Transfert GIMAC wallet to wallet infructueux'],
  'Operations': ['Virement intra non parvenu','Virement bilateral non parvenu','Remise cheque non creditee','Cheque non credite','Paiement cheque non reconnu','Contestation de frais','Contestation interet DAT','Versement guichet non credite','Operation non reconnue','Opposition carte non traitee','Operation mal executee','Operation debitee en double','Paiement TPE infructueux et comptabilise','Opposition TPE non traitee','Virement TRF international non parvenu','Rapatriement non recu','Contestation taux de devise','Demande de sort de virement'],
  'Commercial': ['Cloture de compte','Changement de gestionnaire','Duree de traitement de dossier','Agios trop percu'],
  'Achats et Logistique': ['Facture impayee','Bon de commande non traite'],
  'Recouvrement et Juridique': ['Attestation d endettement','Attestation de fin de credit','Trop percu contentieux','Mainlevee deblocage garantie'],
  'Monetique': ['Code de retrait illisible','Paiement internet VISA infructueux','Paiement TPE VISA infructueux','Retrait GAB infructueux','Demande d images','Remboursement paiement internet','Paiements non reconnus','Contestation solde CVP','Transfert GIMAC wallet infructueux']
};

// =============================================
// ROUTES PUBLIQUES (sans connexion)
// =============================================

app.get('/depot-reclamation', (req, res) => {
  var agencesHTML = ['Agence Okoume (Siege)','Agence Movingui','Agence Bilinga','Point Cash Tali','Point Cash Akanda','Bureau Ozigo (Port-Gentil)','Agence Azobe']
    .map(function(a){ return '<option>' + a + '</option>'; }).join('');
  var catsHTML = Object.entries(CATEGORIES).map(function(entry) {
    return '<optgroup label="' + entry[0] + '">' +
      entry[1].map(function(c){ return '<option value="' + entry[0] + '|' + c + '">' + c + '</option>'; }).join('') +
      '</optgroup>';
  }).join('');

  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Deposer une reclamation — BCEG</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#f3f6f3,#e8ede8);min-height:100vh;}.container{max-width:640px;margin:0 auto;padding:24px 16px 60px;}header{background:linear-gradient(135deg,#4d553d,#3a4130);color:white;padding:20px 24px;}.intro{background:white;border-radius:20px;padding:24px;margin-bottom:20px;border-left:6px solid #c0622a;box-shadow:0 8px 32px rgba(0,0,0,0.1);margin-top:20px;}.intro h2{color:#c0622a;font-size:20px;font-weight:800;margin-bottom:8px;}.intro p{color:#666;font-size:14px;line-height:1.6;}.card{background:white;border-radius:16px;padding:22px;margin-bottom:14px;box-shadow:0 4px 16px rgba(0,0,0,0.06);}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}label{display:block;font-weight:700;font-size:12px;color:#555;margin-bottom:7px;text-transform:uppercase;}.form-group{margin-bottom:14px;}input,select,textarea{width:100%;padding:13px 14px;border:2px solid #e8e8e8;border-radius:10px;font-size:14px;font-family:inherit;transition:all 0.2s;background:#fafafa;}input:focus,select:focus,textarea:focus{outline:none;border-color:#4d553d;}textarea{resize:vertical;min-height:110px;}textarea::placeholder{color:#aaa;}.submit-btn{width:100%;padding:18px;background:linear-gradient(135deg,#c0622a,#e07b39);color:white;border:none;border-radius:14px;font-size:17px;font-weight:800;cursor:pointer;}.success{display:none;text-align:center;background:white;border-radius:24px;padding:48px 24px;}.numero{font-size:28px;font-weight:800;color:#4d553d;background:#e8ede8;padding:16px 28px;border-radius:12px;display:inline-block;margin:20px 0;letter-spacing:3px;font-family:monospace;}</style></head>
<body><header><h1 style="font-size:22px;font-weight:800;">BCEG</h1><p style="font-size:12px;color:#c8d4c8;margin-top:2px;">Banque pour le Commerce et l'Entrepreneuriat du Gabon</p></header>
<div class="container">
<div class="intro"><h2>⚠️ Deposer une reclamation</h2><p>Notre equipe vous repondra dans les <strong>48 heures ouvrables</strong>.</p></div>
<form id="f">
<div class="card"><h3 style="font-size:13px;font-weight:800;color:#4d553d;text-transform:uppercase;margin-bottom:16px;">👤 Vos informations</h3>
<div class="grid2"><div class="form-group"><label>Nom complet *</label><input type="text" name="nom_client" required placeholder="ONDO Jean-Baptiste"></div><div class="form-group"><label>Telephone *</label><input type="tel" name="telephone_client" required placeholder="06 12 34 56"></div></div>
<div class="grid2"><div class="form-group"><label>Email (optionnel)</label><input type="email" name="email_client" placeholder="votre@email.com"></div><div class="form-group"><label>Type de client</label><select name="type_client"><option>Particulier</option><option>Entreprise inf. 500 MF</option><option>Entreprise sup. 500 MF</option><option>Institutionnel</option><option>Fournisseur</option></select></div></div></div>
<div class="card"><h3 style="font-size:13px;font-weight:800;color:#4d553d;text-transform:uppercase;margin-bottom:16px;">🏦 Votre reclamation</h3>
<div class="grid2"><div class="form-group"><label>Agence *</label><select name="agence" required><option value="">-- Selectionnez --</option>${agencesHTML}</select></div><div class="form-group"><label>Canal</label><select name="canal"><option>Application BCEG Hub</option><option>Oral (en agence)</option><option>Telephone</option><option>Email</option></select></div></div>
<div class="form-group"><label>Categorie *</label><select name="categorie" required><option value="">-- Selectionnez le type de probleme --</option>${catsHTML}</select></div>
<div class="form-group"><label>Description *</label><textarea name="description" required placeholder="Decrivez votre probleme en detail..."></textarea></div></div>
<button type="submit" class="submit-btn">Envoyer ma reclamation →</button>
</form>
<div class="success" id="ok"><div style="font-size:72px;margin-bottom:16px;">✅</div><h2 style="font-size:26px;font-weight:800;color:#4d553d;margin-bottom:12px;">Reclamation enregistree !</h2><p style="color:#666;">Votre numero de suivi :</p><div class="numero" id="num"></div><p style="color:#666;font-size:14px;">Notre equipe vous contactera dans les <strong>48h ouvrables</strong>.</p></div>
</div>
<script>document.getElementById('f').addEventListener('submit',function(e){e.preventDefault();var btn=this.querySelector('.submit-btn');btn.textContent='Envoi...';btn.disabled=true;var fd=new FormData(e.target);fetch('/depot-reclamation/soumettre',{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(d){document.getElementById('num').textContent=d.numero||'REC-000000';e.target.style.display='none';document.querySelector('.intro').style.display='none';document.getElementById('ok').style.display='block';window.scrollTo(0,0);}).catch(function(){btn.textContent='Envoyer ma reclamation';btn.disabled=false;alert('Erreur, reessayez.');});});</script>
</body></html>`);
});

app.post('/depot-reclamation/soumettre', upload.single('fichier'), (req, res) => {
  const numero = 'REC-' + Date.now().toString().slice(-6);
  const catParts = (req.body.categorie||'').split('|');
  const departement = catParts[0] || '';
  const categorie = catParts[1] || req.body.categorie;

  db.run(`INSERT INTO reclamations (numero_suivi, nom_client, telephone_client, email_client, type_client, agence, canal, departement_assigne, categorie, description, statut)
    VALUES (?,?,?,?,?,?,?,?,?,?,'Nouvelle')`,
    [numero, req.body.nom_client||'Client Hub', req.body.telephone_client||'', req.body.email_client||'',
     req.body.type_client||'Particulier', req.body.agence||'', req.body.canal||'Application BCEG Hub',
     departement, categorie, req.body.description||''],
    function(err) {
      if (err) { console.log('DB error:', err.message); return res.status(500).json({ error: 'Erreur', numero: 'REC-'+Date.now().toString().slice(-6) }); }
      res.json({ success: true, numero });
    }
  );
});

app.get('/enquete-client/:numero', (req, res) => {
  req.url = '/client/' + req.params.numero;
  enquetesRoutes(req, res, function(){});
});

app.post('/enquetes/soumettre/:numero', (req, res, next) => {
  enquetesRoutes(req, res, next);
});

app.get('/fichier/:filename', (req, res) => {
  var filePath = path.join(__dirname, 'uploads', req.params.filename);
  var fs = require('fs');
  if (fs.existsSync(filePath)) res.sendFile(path.resolve(filePath));
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
