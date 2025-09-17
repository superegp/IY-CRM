const database = require('./database');

class Customer {
  static getAll(callback) {
    const query = 'SELECT * FROM customers ORDER BY created_at DESC';
    database.getDB().all(query, [], callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM customers WHERE id = ?';
    database.getDB().get(query, [id], callback);
  }

  static create(customerData, callback) {
    const { name, email, phone, company, address } = customerData;
    const query = `
      INSERT INTO customers (name, email, phone, company, address)
      VALUES (?, ?, ?, ?, ?)
    `;
    database.getDB().run(query, [name, email, phone, company, address], function(err) {
      callback(err, err ? null : { id: this.lastID, ...customerData });
    });
  }

  static update(id, customerData, callback) {
    const { name, email, phone, company, address, status } = customerData;
    const query = `
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, company = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    database.getDB().run(query, [name, email, phone, company, address, status, id], function(err) {
      callback(err, err ? null : { id, ...customerData });
    });
  }

  static delete(id, callback) {
    const query = 'DELETE FROM customers WHERE id = ?';
    database.getDB().run(query, [id], callback);
  }

  static search(searchTerm, callback) {
    const query = `
      SELECT * FROM customers 
      WHERE name LIKE ? OR email LIKE ? OR company LIKE ?
      ORDER BY created_at DESC
    `;
    const term = `%${searchTerm}%`;
    database.getDB().all(query, [term, term, term], callback);
  }
}

module.exports = Customer;