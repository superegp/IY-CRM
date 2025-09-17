const express = require('express');
const Customer = require('../models/Customer');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all customers
router.get('/', (req, res) => {
  const { search } = req.query;
  
  if (search) {
    Customer.search(search, (err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to search customers' });
      }
      res.json(customers);
    });
  } else {
    Customer.getAll((err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }
      res.json(customers);
    });
  }
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  Customer.getById(id, (err, customer) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch customer' });
    }
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  });
});

// Create new customer
router.post('/', (req, res) => {
  const { name, email, phone, company, address } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  Customer.create({ name, email, phone, company, address }, (err, customer) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create customer' });
    }
    res.status(201).json(customer);
  });
});

// Update customer
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, address, status } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  Customer.update(id, { name, email, phone, company, address, status }, (err, customer) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update customer' });
    }
    res.json(customer);
  });
});

// Delete customer
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  Customer.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete customer' });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});

module.exports = router;