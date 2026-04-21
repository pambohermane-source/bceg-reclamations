const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const CATEGORIES = {
  'Comptabilite': ['Generalite','Contestation d agios','Contestation de date de valeur','Interets non credites','Interets mal calcules','Contestation frais de forcage'],
  'Informatique': ['Generalite','Parametrage comptes BGFIMobile','Compte BGFIMobile non visible','Virement autre banque via BGFIMobile non parvenu','Demande d avis d operation','Extrait de compte non parvenu'],
  'Engagements': ['Generalite','Main levee sur caution douaniere','Contestation des frais de dossier','Decouvert non parametre','Contestation echeance credit','Conditions particulieres non parametrees'],
  'Digital': ['Generalite','Demande de dechargement CVP','Remboursement retrait sans carte infructueux','Ajustement solde CVP','Analyse des mouvements CVP','Rechargement CVP non credite','Rechargement compte virtuel infructueux','Virement compte virtuel infructueux','Achat EDAN infructueux','Achat unites telephoniques infructueux','Retrait GAB BGFI infructueux et comptabilise','Transfert GIMAC wallet infructueux'],
  'Operations': ['Virement intra non parvenu','Virement bilateral non parvenu','Remise cheque non creditee','Cheque non credite','Paiement cheque non reconnu','Contestation de frais','Contestation interet DAT','Versement guichet non credite','Operation non reconnue','Opposition carte non traitee','Operation mal executee','Operation debitee en double','Virement TRF international non parvenu','Rapatriement non recu','Contestation taux de devise','Demande de sort de virement']
};

const STATUTS_COULEURS = {
  'Nouvelle': '#e74c3c',
  'Affectee': '#f39c12',
  'En traitement': '#2d6a9f',
  'Complement requis': '#7b3fa0',
  'Traitee': '#27ae60',
  'Rejetee': '#888',
  'Cloturee': '#4d553d'
};

function statsBadge(statut) {
  var c = STATUTS_COULEURS[statut] || '#888';
  return '<span style="background:'+c+'22;color:'+c+';padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">'+statut+'</span>';
}

function genererCSS() {
  return `*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Segoe UI,Arial,sans-serif;background:#f0f3f0;color:#2c2c2c;}
header{background:linear-gradient(135deg,#4d553d,#3a4130);color:white;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.2);}
header h1{font-size:20px;font-weight:800;}
header p{font-size:11px;color:rgba(255,255,255,0.65);}
.header-right{display:flex;align-items:center;gap:16px;}
.user-badge{background:rgba(255,255,255,0.15);border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;}
.logout{color:rgba(255,255,255,0.7);text-decoration:none;font-size:12px;}
.logout:hover{color:white;}
.nav{background:#3a4130;display:flex;padding:0 28px;gap:4px;}
.nav-item{padding:14px 20px;color:rgba(255,255,255,0.5);cursor:pointer;font-size:13px;font-weight:700;border-bottom:3px solid transparent;text-decoration:none;display:inline-block;}
.nav-item:hover{color:rgba(255,255,255,0.8);}
.nav-item.active{color:white;border-bottom-color:#a6aa9e;}
.badge-nav{background:#e74c3c;color:white;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:800;margin-left:4px;}
.container{max-width:1300px;margin:0 auto;padding:24px 20px;}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;}
.kpi{background:white;border-radius:14px;padding:18px 20px;box-shadow:0 4px 16px rgba(0,0,0,0.06);position:relative;overflow:hidden;}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;}
.kpi.vert::before{background:#4d553d;}
.kpi.rouge::before{background:#e74c3c;}
.kpi.orange::before{background:#f39c12;}
.kpi.bleu::before{background:#2d6a9f;}
.kpi.violet::before{background:#7b3fa0;}
.kpi .lb{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700;}
.kpi .vl{font-size:34px;font-weight:800;color:#2c2c2c;}
.kpi .sb{font-size:12px;color:#aaa;margin-top:4px;}
.card{background:white;border-radius:14px;padding:20px;box-shadow:0 4px 16px rgba(0,0,0,0.06);margin-bottom:20px;}
.card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.card-hdr h3{font-size:15px;font-weight:800;color:#2c2c2c;}
.btn-primary{background:linear-gradient(135deg,#4d553d,#3a4130);color:white;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;transition:all 0.2s;}
.btn-primary:hover{transform:translateY(-1px);}
.btn-orange{background:linear-gradient(135deg,#c0622a,#e07b39);color:white;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;}
table{width:100%;border-collapse:collapse;font-size:12px;}
th{background:#f8f9f8;color:#555;padding:11px 10px;text-align:left;font-weight:800;text-transform:uppercase;font-size:11px;border-bottom:2px solid #e8ede8;}
td{padding:10px 10px;border-bottom:1px solid #f5f5f5;vertical-align:middle;}
tr:hover td{background:#fafcfa;}
.tag{display:inline-block;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:600;}
.tag.vert{background:#e8ede8;color:#4d553d;}
.tag.bleu{background:#e8f4fd;color:#2d6a9f;}
.alerte{background:#fde8e8;border-left:4px solid #e74c3c;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#c0392b;font-weight:600;}
.empty{text-align:center;color:#aaa;padding:48px;font-size:14px;}
.form-group{margin-bottom:16px;}
.form-group label{display:block;font-weight:700;font-size:13px;color:#444;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:12px 14px;border:2px solid #e8e8e8;border-radius:10px;font-size:14px;font-family:inherit;transition:all 0.2s;background:#fafafa;}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:#4d553d;background:white;}
.form-group textarea{resize:vertical;min-height:100px;}
.modal{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;}
.modal.open{display:flex;}
.modal-content{background:white;border-radius:20px;padding:32px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,0.3);}
.modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.modal-header h2{font-size:20px;font-weight:800;color:#2c2c2c;}
.close-btn{background:none;border:none;font-size:24px;cursor:pointer;color:#aaa;}
.close-btn:hover{color:#333;}`;
}

router.get('/', authMiddleware, (req, res) => {
  const user = req.user;

  var query = '';
  var params = [];

  if (user.role === 'cec' || user.role === 'qualite' || user.role === 'direction') {
    query = 'SELECT r.*, u.prenom || " " || u.nom as initiateur_nom FROM reclamations r LEFT JOIN utilisateurs u ON u.id = r.initiateur_id ORDER BY r.date_reception DESC';
  } else if (user.role === 'departement') {
    var depts = (user.departement || '').split(',').map(function(d){ return d.trim(); });
    var placeholders = depts.map(function(){ return '?'; }).join(',');
    query = 'SELECT r.*, u.prenom || " " || u.nom as initiateur_nom FROM reclamations r LEFT JOIN utilisateurs u ON u.id = r.initiateur_id WHERE r.departement_assigne IN (' + placeholders + ') ORDER BY r.date_reception DESC';
    params = depts;
  }

  db.all(query, params, function(err, reclamations) {
    reclamations = reclamations || [];

    var total = reclamations.length;
    var nouvelles = reclamations.filter(function(r){ return r.statut === 'Nouvelle'; }).length;
    var enCours = reclamations.filter(function(r){ return ['Affectee','En traitement','Complement requis'].includes(r.statut); }).length;
    var traitees = reclamations.filter(function(r){ return r.statut === 'Traitee' || r.statut === 'Cloturee'; }).length;

    var rows = reclamations.slice(0, 30).map(function(r) {
      var actions = '';
      if (user.role === 'cec') {
        actions = '<a href="/reclamation/' + r.id + '" class="btn-primary" style="padding:4px 10px;font-size:11px;">Voir</a>';
        if (r.statut === 'Nouvelle') {
          actions += ' <a href="/reclamation/' + r.id + '/affecter" class="btn-orange" style="padding:4px 10px;font-size:11px;">Affecter</a>';
        }
      } else if (user.role === 'departement') {
        actions = '<a href="/reclamation/' + r.id + '" class="btn-primary" style="padding:4px 10px;font-size:11px;">Traiter</a>';
      } else {
        actions = '<a href="/reclamation/' + r.id + '" class="btn-primary" style="padding:4px 10px;font-size:11px;">Voir</a>';
      }
      return '<tr>'
        + '<td><b style="color:#4d553d;font-family:monospace;">' + r.numero_suivi + '</b></td>'
        + '<td>' + (r.date_reception||'').toString().substring(0,10) + '</td>'
        + '<td><b>' + r.nom_client + '</b></td>'
        + '<td>' + (r.agence||'-') + '</td>'
        + '<td><span class="tag bleu">' + (r.departement_assigne||'Non affectee') + '</span></td>'
        + '<td>' + (r.categorie||'-').substring(0,30) + '</td>'
        + '<td>' + statsBadge(r.statut) + '</td>'
        + '<td>' + actions + '</td>'
        + '</tr>';
    }).join('');

    var titreRole = {
      'cec': 'Espace Charge Ecoute Client',
      'qualite': 'Espace Charge Qualite',
      'departement': 'Espace ' + (user.departement||'Departement'),
      'direction': 'Espace Direction'
    };

    var css = genererCSS();

    var nouvBtn = user.role === 'cec' || user.role === 'qualite'
      ? '<a href="/reclamation/nouvelle" class="btn-primary">+ Nouvelle reclamation</a>'
      : '';

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard — BCEG Reclamations</title>
<style>${css}</style>
</head>
<body>
<header>
  <div>
    <h1>BCEG — Gestion des Reclamations</h1>
    <p>${titreRole[user.role]||'Tableau de bord'}</p>
  </div>
  <div class="header-right">
    <span class="user-badge">👤 ${user.prenom} ${user.nom}</span>
    <a href="/logout" class="logout">Deconnexion</a>
  </div>
</header>
<nav class="nav">
  <a href="/dashboard" class="nav-item active">📋 Reclamations${nouvelles>0?'<span class="badge-nav">'+nouvelles+'</span>':''}</a>
  ${user.role==='cec'||user.role==='qualite'?'<a href="/reclamation/nouvelle" class="nav-item">+ Nouvelle</a>':''}
  ${user.role==='qualite'||user.role==='direction'?'<a href="/statistiques" class="nav-item">📊 Statistiques</a>':''}
  ${user.role==='qualite'?'<a href="/enquetes" class="nav-item">📝 Enquetes post</a>':''}
</nav>
<div class="container">
  ${nouvelles>0&&user.role==='cec'?'<div class="alerte">⚠️ <b>'+nouvelles+' nouvelle(s) reclamation(s)</b> en attente d\'affectation</div>':''}

  <div class="kpi-grid">
    <div class="kpi vert"><div class="lb">Total</div><div class="vl">${total}</div><div class="sb">reclamations</div></div>
    <div class="kpi rouge"><div class="lb">Nouvelles</div><div class="vl">${nouvelles}</div><div class="sb">a traiter</div></div>
    <div class="kpi orange"><div class="lb">En cours</div><div class="vl">${enCours}</div><div class="sb">en traitement</div></div>
    <div class="kpi vert"><div class="lb">Traitees</div><div class="vl">${traitees}</div><div class="sb">resolues</div></div>
  </div>

  <div class="card">
    <div class="card-hdr">
      <h3>📋 Liste des reclamations</h3>
      ${nouvBtn}
    </div>
    ${rows.length===0?'<div class="empty">Aucune reclamation pour l\'instant</div>':
    '<div style="overflow-x:auto;"><table><thead><tr><th>N° Suivi</th><th>Date</th><th>Client</th><th>Agence</th><th>Departement</th><th>Categorie</th><th>Statut</th><th>Actions</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
  </div>
</div>
</body></html>`);
  });
});

module.exports = router;
module.exports.CATEGORIES = CATEGORIES;
module.exports.statsBadge = statsBadge;
module.exports.genererCSS = genererCSS;
