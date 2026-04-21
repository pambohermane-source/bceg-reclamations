const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

require('./models/database');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reclamationsRoutes = require('./routes/reclamations');
const statistiquesRoutes = require('./routes/statistiques');
const enquetesRoutes = require('./routes/enquetes');

// ROUTES PUBLIQUES - sans connexion obligatoire
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.get('/depot-reclamation', (req, res) => {
  // Servir la page publique directement
  req.url = '/public';
  reclamationsRoutes(req, res, function(){});
});

app.post('/depot-reclamation/soumettre', upload.single('fichier'), (req, res) => {
  req.url = '/public/soumettre';
  reclamationsRoutes(req, res, function(){});
});

// ROUTES ENQUETE CLIENT - sans connexion
app.get('/enquete-client/:numero', (req, res, next) => {
  req.url = '/client/' + req.params.numero;
  enquetesRoutes(req, res, next);
});
app.post('/enquetes/soumettre/:numero', (req, res, next) => {
  enquetesRoutes(req, res, next);
});

// ROUTES PROTEGEES
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
