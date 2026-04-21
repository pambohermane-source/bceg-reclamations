const nodemailer = require('nodemailer');
const db = require('../models/database');

// Configuration email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'pambohermane@gmail.com',
    pass: process.env.EMAIL_PASS || 'uomp fxcd hqjp jhcf'
  }
});

const FROM_EMAIL = '"BCEG - Service Clients" <pambohermane@gmail.com>';

// Templates de messages
const templates = {
  creation: function(rec) {
    return {
      sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' enregistree',
      email: `Bonjour ${rec.nom_client},\n\nVotre reclamation a bien ete enregistree.\n\nNumero de suivi : ${rec.numero_suivi}\nCategorie : ${rec.categorie}\nDate : ${new Date().toLocaleDateString('fr-FR')}\n\nNous vous repondrons dans les meilleurs delais.\n\nCordialement,\nLe Service Clients BCEG`,
      sms: `BCEG: Votre reclamation ${rec.numero_suivi} a ete enregistree. Nous vous repondrons rapidement.`
    };
  },
  affectation: function(rec) {
    return {
      sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' en cours de traitement',
      email: `Bonjour ${rec.nom_client},\n\nVotre reclamation ${rec.numero_suivi} est en cours de traitement par nos equipes.\n\nNous vous tiendrons informe de l'avancement.\n\nCordialement,\nLe Service Clients BCEG`,
      sms: `BCEG: Votre reclamation ${rec.numero_suivi} est en cours de traitement.`
    };
  },
  cloture: function(rec, statut) {
    var msg = statut === 'Cloturee' ? 'a ete traitee avec succes' : 'a ete examinee';
    return {
      sujet: 'BCEG - Reclamation ' + rec.numero_suivi + ' cloturee',
      email: `Bonjour ${rec.nom_client},\n\nVotre reclamation ${rec.numero_suivi} ${msg}.\n\nNous vous remercions de votre confiance et restons a votre disposition pour tout renseignement.\n\nCordialement,\nLe Service Clients BCEG\nTel : +241 01 44 00 00`,
      sms: `BCEG: Votre reclamation ${rec.numero_suivi} est cloturee. Merci de votre confiance.`
    };
  }
};

async function envoyerNotification(reclamationId, type) {
  return new Promise(function(resolve) {
    db.get('SELECT * FROM reclamations WHERE id = ?', [reclamationId], async function(err, rec) {
      if (!rec) return resolve({ success: false, raison: 'Reclamation non trouvee' });

      var template = templates[type] ? templates[type](rec) : null;
      if (!template) return resolve({ success: false, raison: 'Template inconnu' });

      var resultats = { email: null, sms: null };

      // ENVOI EMAIL
      if (rec.email_client && rec.email_client.includes('@')) {
        try {
          await transporter.sendMail({
            from: FROM_EMAIL,
            to: rec.email_client,
            subject: template.sujet,
            text: template.email
          });
          resultats.email = 'envoye';
          db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message, statut) VALUES (?,?,?,?,?)',
            [reclamationId, rec.email_client, 'email_' + type, template.email, 'envoye']);
        } catch(e) {
          resultats.email = 'erreur: ' + e.message;
          db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message, statut) VALUES (?,?,?,?,?)',
            [reclamationId, rec.email_client, 'email_' + type, template.email, 'erreur']);
        }
      }

      // SMS — en attente specs Fabrice (mode simulation)
      if (rec.telephone_client && rec.telephone_client.length >= 8) {
        // TODO: Remplacer par l'API SMS BCEG quand specs disponibles
        db.run('INSERT INTO notifications (reclamation_id, destinataire, type, message, statut) VALUES (?,?,?,?,?)',
          [reclamationId, rec.telephone_client, 'sms_' + type, template.sms, 'en_attente_sms']);
        resultats.sms = 'en_attente_specs_fabrice';
      }

      resolve({ success: true, resultats });
    });
  });
}

module.exports = { envoyerNotification };
