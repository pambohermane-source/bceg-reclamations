const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

require('./models/database');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reclamationsRoutes = require('./routes/reclamations');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reclamation', reclamationsRoutes);
app.use('/fichier', reclamationsRoutes);

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('BCEG Reclamations demarre sur le port ' + PORT);
  console.log('Acces : http://localhost:' + PORT + '/login');
});
