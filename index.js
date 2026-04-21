const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

require('./models/database');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reclamationsRoutes = require('./routes/reclamations');
const statistiquesRoutes = require('./routes/statistiques');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reclamation', reclamationsRoutes);
app.use('/statistiques', statistiquesRoutes);

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('BCEG Reclamations demarre sur le port ' + PORT);
});
