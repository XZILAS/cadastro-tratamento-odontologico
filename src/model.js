const { v4: uuidv4 } = require('uuid');

class Treatment {
  constructor(description) {
    this.id = uuidv4();
    this.description = description;
    this.status = 'DRAFT'; // DRAFT, PENDING, APPROVED, RECUSADO
    this.createdAt = new Date();
  }
}

module.exports = Treatment;
