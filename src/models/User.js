const database = require('./database');
const bcrypt = require('bcryptjs');

class User {
  static getAll(callback) {
    const query = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
    database.getDB().all(query, [], callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
    database.getDB().get(query, [id], callback);
  }

  static getByUsername(username, callback) {
    const query = 'SELECT * FROM users WHERE username = ?';
    database.getDB().get(query, [username], callback);
  }

  static getByEmail(email, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    database.getDB().get(query, [email], callback);
  }

  static async create(userData, callback) {
    const { username, email, password, role } = userData;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `;
      database.getDB().run(query, [username, email, hashedPassword, role || 'user'], function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null, { id: this.lastID, username, email, role: role || 'user' });
        }
      });
    } catch (error) {
      callback(error);
    }
  }

  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static update(id, userData, callback) {
    const { username, email, role } = userData;
    const query = `
      UPDATE users 
      SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    database.getDB().run(query, [username, email, role, id], function(err) {
      callback(err, err ? null : { id, username, email, role });
    });
  }

  static delete(id, callback) {
    const query = 'DELETE FROM users WHERE id = ?';
    database.getDB().run(query, [id], callback);
  }
}

module.exports = User;