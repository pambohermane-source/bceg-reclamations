const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { authMiddleware, roleRequired } = require('../middleware/auth');
const { genererCSS } = require('./dashboard');

router.get('/', authMiddleware, roleRequired(['qualite', 'direction']), (req, res) => {
  const user = req.user;

  db.all('SELECT * FROM reclamations ORDER BY date_reception DESC', [], function(err, recs) {
    recs = recs || [];

    var total = recs.length;
    var nouvelles = recs.filter(function(r){ return r.statut === 'Nouvelle'; }).length;
    var enCours = recs.filter(function(r){ return ['Affectee','En traitement','Complement requis'].includes(r.statut); }).length;
    var cloturees = recs.filter(function(r){ return r.statut === 'Cloturee'; }).length;
    var rejetees = recs.filter(function(r){ return r.statut === 'Rejetee'; }).length;
    var txResolution = total > 0 ? Math.round((cloturees / total) * 100) : 0;

    // Par departement
    var parDept = {};
    recs.forEach(function(r) {
      var d = r.departement_assigne || 'Non affectee';
      if (!parDept[d]) parDept[d] = { total: 0, cloturees: 0 };
      parDept[d].total++;
      if (r.statut === 'Cloturee') parDept[d].cloturees++;
    });

    // Par categorie top 5
    var parCat = {};
    recs.forEach(function(r) {
      var c = r.categorie || 'Autre';
      parCat[c] = (parCat[c] || 0) + 1;
    });
    var topCats = Object.entries(parCat).sort(function(a,b){ return b[1]-a[1]; }).slice(0, 8);

    // Evolution 30 jours
    var joursMap = {};
    for (var i = 29; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      joursMap[d.toISOString().substring(0, 10)] = 0;
    }
    recs.forEach(function(r) {
      var k = (r.date_reception || '').toString().substring(0, 10);
      if (joursMap[k] !== undefined) joursMap[k]++;
    });
    var maxJour = Math.max.apply(null, Object.values(joursMap)) || 1;

    // Delai moyen de traitement
    var delais = recs.filter(function(r){ return r.date_reception && r.date_cloture; }).map(function(r) {
      var debut = new Date(r.date_reception);
      var fin = new Date(r.date_cloture);
      return Math.round((fin - debut) / (1000 * 60 * 60 * 24));
    });
    var delaiMoyen = delais.length > 0 ? Math.round(delais.reduce(function(a,b){return a+b;},0) / delais.length) : 0;

    // Par priorite
    var parPriorite = { Urgente: 0, Haute: 0, Normale: 0 };
    recs.forEach(function(r) { if (parPriorite[r.priorite] !== undefined) parPriorite[r.priorite]++; });

    var css = genererCSS();

    var deptRows = Object.entries(parDept).sort(function(a,b){ return b[1].total - a[1].total; }).map(function(entry) {
      var nom = entry[0]; var d = entry[1];
      var tx = d.total > 0 ? Math.round((d.cloturees/d.total)*100) : 0;
      var col = tx >= 70 ? '#27ae60' : tx >= 40 ? '#f39c12' : '#e74c3c';
      return '<div style="display:flex;align-items:center;margin-bottom:12px;">'
        + '<div style="width:160px;font-size:13px;font-weight:600;color:#333;flex-shrink:0;">' + nom + '</div>'
        + '<div style="flex:1;background:#f0f3f0;border-radius:8px;height:12px;margin:0 12px;overflow:hidden;">'
        + '<div style="height:12px;border-radius:8px;background:' + col + ';width:' + tx + '%;"></div></div>'
        + '<div style="font-size:13px;font-weight:800;color:' + col + ';width:120px;text-align:right;">' + d.cloturees + '/' + d.total + ' (' + tx + '%)</div>'
        + '</div>';
    }).join('');

    var catRows = topCats.map(function(entry) {
      var pct = total > 0 ? Math.round((entry[1]/total)*100) : 0;
      return '<div style="display:flex;align-items:center;margin-bottom:10px;">'
        + '<div style="width:220px;font-size:12px;color:#555;flex-shrink:0;">' + entry[0].substring(0,35) + '</div>'
        + '<div style="flex:1;background:#f0f3f0;border-radius:6px;height:10px;margin:0 10px;overflow:hidden;">'
        + '<div style="height:10px;border-radius:6px;background:#4d553d;width:' + pct + '%;"></div></div>'
        + '<div style="font-size:12px;font-weight:800;color:#4d553d;width:60px;text-align:right;">' + entry[1] + ' (' + pct + '%)</div>'
        + '</div>';
    }).join('');

    var chartBars = Object.entries(joursMap).map(function(entry) {
      var date = entry[0].substring(5);
      var count = entry[1];
      var h = count > 0 ? Math.max(8, Math.round((count/maxJour)*120)) : 4;
      var col = count > 0 ? '#4d553d' : '#e8ede8';
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">'
        + '<div style="width:100%;border-radius:4px 4px 0 0;background:' + col + ';height:' + h + 'px;min-height:4px;" title="' + date + ': ' + count + ' reclamation(s)"></div>'
        + (date.endsWith('1')||date.endsWith('5')||date.endsWith('0')?'<div style="font-size:9px;color:#aaa;">' + date + '</div>':'<div style="height:14px;"></div>')
        + '</div>';
    }).join('');

    var today = new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'2-digit',month:'long',year:'numeric'});

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Statistiques — BCEG Reclamations</title>
<style>${css}
.stat-big{font-size:48px;font-weight:900;line-height:1;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:20px;}
@media(max-width:900px){.grid3{grid-template-columns:1fr;}}
</style>
</head>
<body>
<header>
  <div><h1>BCEG — Statistiques Reclamations</h1><p>${today}</p></div>
  <div class="header-right">
    <span class="user-badge">👤 ${user.prenom} ${user.nom}</span>
    <a href="/logout" class="logout">Deconnexion</a>
  </div>
</header>
<nav class="nav">
  <a href="/dashboard" class="nav-item">📋 Reclamations</a>
  <a href="/statistiques" class="nav-item active">📊 Statistiques</a>
  ${user.role==='qualite'?'<a href="/enquetes" class="nav-item">📝 Enquetes post</a>':''}
</nav>
<div class="container">

  <!-- KPIs -->
  <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
    <div class="kpi vert"><div class="lb">Total reclamations</div><div class="stat-big">${total}</div></div>
    <div class="kpi rouge"><div class="lb">Nouvelles</div><div class="stat-big">${nouvelles}</div></div>
    <div class="kpi orange"><div class="lb">En cours</div><div class="stat-big">${enCours}</div></div>
    <div class="kpi vert"><div class="lb">Cloturees</div><div class="stat-big">${cloturees}</div></div>
    <div class="kpi bleu"><div class="lb">Taux resolution</div><div class="stat-big" style="color:#2d6a9f;">${txResolution}%</div></div>
    <div class="kpi violet"><div class="lb">Delai moyen</div><div class="stat-big" style="color:#7b3fa0;">${delaiMoyen}j</div></div>
  </div>

  <!-- Graphique 30 jours -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-hdr"><h3>📅 Evolution sur 30 jours</h3><a href="/statistiques/export" class="btn-primary">⬇️ Exporter CSV</a></div>
    <div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding:0 8px;">${chartBars}</div>
    <div style="text-align:center;font-size:11px;color:#aaa;margin-top:8px;">Nombre de reclamations recues par jour</div>
  </div>

  <div class="grid3">
    <!-- Par departement -->
    <div class="card" style="grid-column:span 2;">
      <div class="card-hdr"><h3>🏢 Taux de resolution par departement</h3></div>
      ${deptRows || '<div class="empty">Aucune donnee</div>'}
    </div>

    <!-- Par priorite -->
    <div class="card">
      <div class="card-hdr"><h3>🚨 Par priorite</h3></div>
      ${Object.entries(parPriorite).map(function(entry) {
        var col = entry[0]==='Urgente'?'#e74c3c':entry[0]==='Haute'?'#f39c12':'#4d553d';
        var pct = total > 0 ? Math.round((entry[1]/total)*100) : 0;
        return '<div style="margin-bottom:16px;">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">'
          + '<span style="font-size:13px;font-weight:700;color:'+col+';">'+entry[0]+'</span>'
          + '<span style="font-size:13px;font-weight:800;color:'+col+';">'+entry[1]+' ('+pct+'%)</span></div>'
          + '<div style="background:#f0f3f0;border-radius:8px;height:10px;overflow:hidden;">'
          + '<div style="height:10px;border-radius:8px;background:'+col+';width:'+pct+'%;"></div></div>'
          + '</div>';
      }).join('')}
    </div>
  </div>

  <!-- Top categories -->
  <div class="card">
    <div class="card-hdr"><h3>📋 Top categories de reclamations</h3></div>
    ${catRows || '<div class="empty">Aucune donnee</div>'}
  </div>

</div>
</body></html>`);
  });
});

router.get('/export', authMiddleware, roleRequired(['qualite', 'direction']), (req, res) => {
  db.all(`SELECT r.*, u.prenom || ' ' || u.nom as initiateur FROM reclamations r
          LEFT JOIN utilisateurs u ON u.id = r.initiateur_id
          ORDER BY r.date_reception DESC`, [], function(err, rows) {
    rows = rows || [];
    var csv = 'N Suivi,Date Reception,Client,Telephone,Email,Agence,Departement,Categorie,Priorite,Statut,Date Cloture\n';
    rows.forEach(function(r) {
      csv += [r.numero_suivi||'', (r.date_reception||'').toString().substring(0,10),
              r.nom_client||'', r.telephone_client||'', r.email_client||'',
              r.agence||'', r.departement_assigne||'', r.categorie||'',
              r.priorite||'', r.statut||'', (r.date_cloture||'').toString().substring(0,10)].join(',') + '\n';
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="BCEG_Reclamations_Stats_' + new Date().toISOString().substring(0,10) + '.csv"');
    res.send('\uFEFF' + csv);
  });
});

module.exports = router;
