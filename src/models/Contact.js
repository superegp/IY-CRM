const database = require('./database');

class Contact {
  static getAll(callback) {
    const query = `
      SELECT c.*, cust.name as customer_name, u.username as created_by_name
      FROM contacts c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.date DESC
    `;
    database.getDB().all(query, [], callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT c.*, cust.name as customer_name, u.username as created_by_name
      FROM contacts c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `;
    database.getDB().get(query, [id], callback);
  }

  static getByCustomer(customerId, callback) {
    const query = `
      SELECT c.*, u.username as created_by_name
      FROM contacts c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.customer_id = ?
      ORDER BY c.date DESC
    `;
    database.getDB().all(query, [customerId], callback);
  }

  static create(contactData, callback) {
    const { customer_id, type, subject, content, created_by } = contactData;
    const query = `
      INSERT INTO contacts (customer_id, type, subject, content, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    database.getDB().run(query, [customer_id, type, subject, content, created_by], function(err) {
      callback(err, err ? null : { id: this.lastID, ...contactData });
    });
  }

  static update(id, contactData, callback) {
    const { customer_id, type, subject, content } = contactData;
    const query = `
      UPDATE contacts 
      SET customer_id = ?, type = ?, subject = ?, content = ?
      WHERE id = ?
    `;
    database.getDB().run(query, [customer_id, type, subject, content, id], function(err) {
      callback(err, err ? null : { id, ...contactData });
    });
  }

  static delete(id, callback) {
    const query = 'DELETE FROM contacts WHERE id = ?';
    database.getDB().run(query, [id], callback);
  }
}

module.exports = Contact;