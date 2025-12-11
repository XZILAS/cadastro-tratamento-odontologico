const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const service = require('./service');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes

// Create treatment (POST /api/treatments)
app.post('/api/treatments', (req, res) => {
  try {
    const { description } = req.body;
    const treatment = service.createTreatment(description);
    res.status(201).json(treatment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all treatments (GET /api/treatments)
app.get('/api/treatments', (req, res) => {
  try {
    const treatments = service.getAllTreatments();
    res.json(treatments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single treatment (GET /api/treatments/:id)
app.get('/api/treatments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const treatment = service.getTreatment(id);
    res.json(treatment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Send for homologation (POST /api/treatments/:id/send-homologation)
app.post('/api/treatments/:id/send-homologation', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.sendForHomologation(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update treatment (PUT /api/treatments/:id)
app.put('/api/treatments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const treatment = service.updateTreatment(id, description);
    res.json(treatment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete treatment (DELETE /api/treatments/:id)
app.delete('/api/treatments/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteTreatment(id);
    res.json({ message: 'Tratamento deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
