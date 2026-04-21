const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { authMiddleware, roleRequired } = require('../middleware/auth');
const { genererCSS } = require('./dashboard');

// LISTE ENQUETES POST-RECLAMATION
router.get('/', authMiddleware, roleRequired(['qualite', 'direction']), (req, res) => {
  const user = req.user;
  db.all(`SELECT e.*, r.numero_suivi, r.nom_client, r.agence, r.categorie
          FROM enquetes_post e
          LEFT JOIN reclamations r ON r.id = e.reclamation_id
          ORDER BY e.date_reponse DESC`, [], function(err, enquetes) {
    enquetes = enquetes || [];
    const css = genererCSS();

    var rows = enquetes.map(function(e) {
      var satReponse = e.satisfaction_reponse ? '⭐'.repeat(e.satisfaction_reponse) + ' (' + e.satisfaction_reponse + '/5)' : '-';
      var satDelai = e.satisfaction_delai ? '⭐'.repeat(e.satisfaction_delai) + ' (' + e.satisfaction_delai + '/5)' : '-';
      return '<tr>'
        + '<td><b style="color:#4d553d;font-family:monospace;">' + (e.numero_suivi||'-') + '</b></td>'
        + '<td><b>' + (e.nom_client||'-') + '</b></td>'
        + '<td>' + (e.agence||'-') + '</td>'
        + '<td>' + (e.canal_reclamation||'-') + '</td>'
        + '<td>' + (e.reponse_recue ? '✅ Oui' : '❌ Non') + '</td>'
        + '<td>' + satReponse + '</td>'
        + '<td>' + satDelai + '</td>'
        + '<td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (e.remarques||'-') + '</td>'
        + '<td>' + (e.date_reponse||'-').toString().substring(0,10) + '</td>'
        + '</tr>';
    }).join('');

    var moyReponse = enquetes.length > 0 && enquetes.filter(function(e){return e.satisfaction_reponse;}).length > 0
      ? (enquetes.reduce(function(s,e){return s+(e.satisfaction_reponse||0);},0) / enquetes.filter(function(e){return e.satisfaction_reponse;}).length).toFixed(1)
      : '-';
    var moyDelai = enquetes.length > 0 && enquetes.filter(function(e){return e.satisfaction_delai;}).length > 0
      ? (enquetes.reduce(function(s,e){return s+(e.satisfaction_delai||0);},0) / enquetes.filter(function(e){return e.satisfaction_delai;}).length).toFixed(1)
      : '-';

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Enquetes Post-Reclamation — BCEG</title>
<style>${css}</style>
</head>
<body>
<header>
  <div><h1>BCEG — Enquetes Post-Reclamation</h1><p>Satisfaction clients apres traitement</p></div>
  <div class="header-right">
    <span class="user-badge">👤 ${user.prenom} ${user.nom}</span>
    <a href="/logout" class="logout">Deconnexion</a>
  </div>
</header>
<nav class="nav">
  <a href="/dashboard" class="nav-item">📋 Reclamations</a>
  <a href="/statistiques" class="nav-item">📊 Statistiques</a>
  <a href="/enquetes" class="nav-item active">📝 Enquetes post</a>
</nav>
<div class="container">
  <div class="kpi-grid">
    <div class="kpi vert"><div class="lb">Enquetes recues</div><div class="vl">${enquetes.length}</div></div>
    <div class="kpi bleu"><div class="lb">Satisfaction reponse</div><div class="vl">${moyReponse}<span style="font-size:18px;">/5</span></div></div>
    <div class="kpi orange"><div class="lb">Satisfaction delai</div><div class="vl">${moyDelai}<span style="font-size:18px;">/5</span></div></div>
  </div>

  <div class="card">
    <div class="card-hdr"><h3>📝 Enquetes de satisfaction post-reclamation</h3></div>
    ${enquetes.length === 0
      ? '<div class="empty">Aucune enquete pour l\'instant.<br><span style="font-size:12px;">Les enquetes apparaissent quand une reclamation est cloturee et que le client repond.</span></div>'
      : '<div style="overflow-x:auto;"><table><thead><tr><th>N° Suivi</th><th>Client</th><th>Agence</th><th>Canal</th><th>Reponse recue</th><th>Sat. Reponse</th><th>Sat. Delai</th><th>Remarques</th><th>Date</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
    }
  </div>

  <div class="card">
    <div class="card-hdr"><h3>🔗 Lien enquete client</h3></div>
    <p style="font-size:14px;color:#555;margin-bottom:12px;">Partagez ce lien avec le client apres cloture de sa reclamation :</p>
    <div style="background:#f0f3f0;border-radius:10px;padding:14px;font-family:monospace;font-size:13px;color:#4d553d;">
      https://bceg-reclamations-production.up.railway.app/enquete-client/[NUMERO_SUIVI]
    </div>
  </div>
</div>
</body></html>`);
  });
});

// FORMULAIRE ENQUETE CLIENT (accessible sans connexion)
router.get('/client/:numero', (req, res) => {
  const numero = req.params.numero;
  db.get('SELECT * FROM reclamations WHERE numero_suivi = ?', [numero], function(err, rec) {
    if (!rec) return res.status(404).send('Reclamation non trouvee');

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Votre avis — BCEG</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#f3f6f3,#e8ede8);min-height:100vh;}
header{background:linear-gradient(135deg,#4d553d,#3a4130);color:white;padding:20px 24px;}
header h1{font-size:22px;font-weight:800;}header p{font-size:12px;color:#c8d4c8;margin-top:2px;}
.container{max-width:600px;margin:0 auto;padding:24px 16px 60px;}
.card{background:white;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);}
.card h2{color:#4d553d;font-size:18px;font-weight:800;margin-bottom:8px;}
.card p{color:#666;font-size:14px;line-height:1.6;}
.question{font-weight:700;font-size:14px;color:#333;margin-bottom:12px;}
.stars{display:flex;gap:8px;}
.star-btn{flex:1;padding:10px 6px;border:2px solid #ddd;border-radius:10px;background:white;cursor:pointer;text-align:center;font-size:12px;font-weight:600;transition:all 0.2s;}
.star-btn.selected{border-color:#4d553d;background:#4d553d;color:white;}
select,textarea,input{width:100%;padding:12px;border:2px solid #e8e8e8;border-radius:10px;font-size:14px;font-family:inherit;margin-top:4px;}
textarea{resize:vertical;min-height:80px;}
.btn{width:100%;padding:16px;background:linear-gradient(135deg,#4d553d,#3a4130);color:white;border:none;border-radius:12px;font-size:17px;font-weight:800;cursor:pointer;margin-top:8px;}
.success{text-align:center;background:white;border-radius:20px;padding:40px;display:none;}
</style>
</head>
<body>
<header><h1>BCEG</h1><p>Banque pour le Commerce et l'Entrepreneuriat du Gabon</p></header>
<div class="container">
  <div class="card">
    <h2>Votre avis nous interesse !</h2>
    <p>Votre reclamation <b>${numero}</b> a ete traitee. Prenez 2 minutes pour nous donner votre avis.</p>
  </div>
  <form id="form">
    <div class="card">
      <div class="question">Par quel canal avez-vous transmis votre reclamation ?</div>
      <select name="canal"><option>Mail</option><option>Courrier</option><option>Telephone</option><option>Oral</option><option>Autre</option></select>
    </div>
    <div class="card">
      <div class="question">Avez-vous recu une reponse a votre reclamation ?</div>
      <select name="reponse_recue" onchange="toggleQ5(this.value)">
        <option value="1">Oui</option><option value="0">Non</option>
      </select>
    </div>
    <div class="card" id="q5">
      <div class="question">Etes-vous satisfait(e) de la reponse ?</div>
      <div class="stars" id="stars-reponse">
        ${[1,2,3,4,5].map(function(n){ return '<button type="button" class="star-btn" onclick="selectNote(\'reponse\','+n+')">'+n+'/5</button>'; }).join('')}
      </div>
      <input type="hidden" name="satisfaction_reponse" id="satisfaction_reponse">
    </div>
    <div class="card">
      <div class="question">Etes-vous satisfait(e) des delais de traitement ?</div>
      <div class="stars" id="stars-delai">
        ${[1,2,3,4,5].map(function(n){ return '<button type="button" class="star-btn" onclick="selectNote(\'delai\','+n+')">'+n+'/5</button>'; }).join('')}
      </div>
      <input type="hidden" name="satisfaction_delai" id="satisfaction_delai">
    </div>
    <div class="card">
      <div class="question">Vos remarques et suggestions</div>
      <textarea name="remarques" placeholder="Partagez votre experience..."></textarea>
    </div>
    <button type="submit" class="btn">Envoyer mon avis</button>
  </form>
  <div class="success" id="success">
    <div style="font-size:60px;margin-bottom:16px;">🎉</div>
    <h2 style="color:#4d553d;font-size:22px;margin-bottom:8px;">Merci pour votre avis !</h2>
    <p style="color:#666;">Votre retour nous aide a ameliorer nos services.</p>
  </div>
</div>
<script>
function selectNote(type, val) {
  document.getElementById('satisfaction_' + type).value = val;
  document.getElementById('stars-' + type).querySelectorAll('.star-btn').forEach(function(btn, i) {
    btn.classList.toggle('selected', i < val);
  });
}
function toggleQ5(val) {
  document.getElementById('q5').style.display = val === '1' ? 'block' : 'none';
}
document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {
    canal: e.target.canal.value,
    reponse_recue: e.target.reponse_recue.value,
    satisfaction_reponse: e.target.satisfaction_reponse.value || null,
    satisfaction_delai: e.target.satisfaction_delai.value || null,
    remarques: e.target.remarques.value
  };
  fetch('/enquetes/soumettre/${numero}', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
  .then(function() {
    e.target.style.display = 'none';
    document.querySelector('.card').style.display = 'none';
    document.getElementById('success').style.display = 'block';
  });
});
</script>
</body></html>`);
  });
});

// SOUMISSION ENQUETE CLIENT
router.post('/soumettre/:numero', (req, res) => {
  const numero = req.params.numero;
  db.get('SELECT id FROM reclamations WHERE numero_suivi = ?', [numero], function(err, rec) {
    if (!rec) return res.status(404).json({ error: 'Non trouve' });
    db.run(`INSERT INTO enquetes_post (reclamation_id, canal_reclamation, reponse_recue, satisfaction_reponse, satisfaction_delai, remarques)
      VALUES (?,?,?,?,?,?)`,
      [rec.id, req.body.canal, req.body.reponse_recue, req.body.satisfaction_reponse||null, req.body.satisfaction_delai||null, req.body.remarques],
      function(err) {
        res.json({ success: true });
      }
    );
  });
});

module.exports = router;
