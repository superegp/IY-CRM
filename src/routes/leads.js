const express = require('express');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all leads
router.get('/', (req, res) => {
  const { status } = req.query;
  
  if (status) {
    Lead.getByStatus(status, (err, leads) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch leads' });
      }
      res.json(leads);
    });
  } else {
    Lead.getAll((err, leads) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch leads' });
      }
      res.json(leads);
    });
  }
});

// Get lead by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  Lead.getById(id, (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch lead' });
    }
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  });
});

// Create new lead
router.post('/', (req, res) => {
  const { name, email, phone, company, source, status, score, assigned_to } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  Lead.create({ name, email, phone, company, source, status, score, assigned_to }, (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create lead' });
    }
    res.status(201).json(lead);
  });
});

// Update lead
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, source, status, score, assigned_to } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  Lead.update(id, { name, email, phone, company, source, status, score, assigned_to }, (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update lead' });
    }
    res.json(lead);
  });
});

// Convert lead to customer
router.post('/:id/convert', (req, res) => {
  const { id } = req.params;
  
  Lead.convertToCustomer(id, (err, customer) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to convert lead to customer' });
    }
    res.json({ message: 'Lead converted to customer successfully', customer });
  });
});

// Delete lead
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  Lead.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
    res.json({ message: 'Lead deleted successfully' });
  });
});

module.exports = router;