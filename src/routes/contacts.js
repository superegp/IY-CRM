const express = require('express');
const Contact = require('../models/Contact');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all contacts
router.get('/', (req, res) => {
  const { customer_id } = req.query;
  
  if (customer_id) {
    Contact.getByCustomer(customer_id, (err, contacts) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch contacts' });
      }
      res.json(contacts);
    });
  } else {
    Contact.getAll((err, contacts) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch contacts' });
      }
      res.json(contacts);
    });
  }
});

// Get contact by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  Contact.getById(id, (err, contact) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch contact' });
    }
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  });
});

// Create new contact
router.post('/', (req, res) => {
  const { customer_id, type, subject, content } = req.body;
  
  if (!customer_id || !type) {
    return res.status(400).json({ error: 'Customer ID and type are required' });
  }
  
  const contactData = {
    customer_id,
    type,
    subject,
    content,
    created_by: req.user.id
  };
  
  Contact.create(contactData, (err, contact) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create contact' });
    }
    res.status(201).json(contact);
  });
});

// Update contact
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { customer_id, type, subject, content } = req.body;
  
  if (!customer_id || !type) {
    return res.status(400).json({ error: 'Customer ID and type are required' });
  }
  
  Contact.update(id, { customer_id, type, subject, content }, (err, contact) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update contact' });
    }
    res.json(contact);
  });
});

// Delete contact
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  Contact.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete contact' });
    }
    res.json({ message: 'Contact deleted successfully' });
  });
});

module.exports = router;