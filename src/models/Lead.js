const database = require('./database');

class Lead {
  static getAll(callback) {
    const query = `
      SELECT l.*, u.username as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      ORDER BY l.created_at DESC
    `;
    database.getDB().all(query, [], callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT l.*, u.username as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `;
    database.getDB().get(query, [id], callback);
  }

  static create(leadData, callback) {
    const { name, email, phone, company, source, status, score, assigned_to } = leadData;
    const query = `
      INSERT INTO leads (name, email, phone, company, source, status, score, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    database.getDB().run(query, [name, email, phone, company, source, status || 'new', score || 0, assigned_to], function(err) {
      callback(err, err ? null : { id: this.lastID, ...leadData });
    });
  }

  static update(id, leadData, callback) {
    const { name, email, phone, company, source, status, score, assigned_to } = leadData;
    const query = `
      UPDATE leads 
      SET name = ?, email = ?, phone = ?, company = ?, source = ?, status = ?, score = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    database.getDB().run(query, [name, email, phone, company, source, status, score, assigned_to, id], function(err) {
      callback(err, err ? null : { id, ...leadData });
    });
  }

  static delete(id, callback) {
    const query = 'DELETE FROM leads WHERE id = ?';
    database.getDB().run(query, [id], callback);
  }

  static getByStatus(status, callback) {
    const query = `
      SELECT l.*, u.username as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.status = ?
      ORDER BY l.created_at DESC
    `;
    database.getDB().all(query, [status], callback);
  }

  static convertToCustomer(leadId, callback) {
    // Get lead data
    this.getById(leadId, (err, lead) => {
      if (err || !lead) return callback(err || new Error('Lead not found'));

      // Create customer from lead
      const Customer = require('./Customer');
      Customer.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        address: ''
      }, (createErr, customer) => {
        if (createErr) return callback(createErr);

        // Update lead status to converted
        this.update(leadId, { ...lead, status: 'converted' }, (updateErr) => {
          callback(updateErr, customer);
        });
      });
    });
  }
}

module.exports = Lead;