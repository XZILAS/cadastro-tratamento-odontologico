// Simulated repository (in-memory storage)
class TreatmentRepository {
  constructor() {
    this.treatments = new Map();
  }

  save(treatment) {
    this.treatments.set(treatment.id, treatment);
    return treatment;
  }

  findById(id) {
    return this.treatments.get(id) || null;
  }

  findAll() {
    return Array.from(this.treatments.values());
  }

  update(treatment) {
    if (this.treatments.has(treatment.id)) {
      this.treatments.set(treatment.id, treatment);
      return treatment;
    }
    return null;
  }

  delete(id) {
    return this.treatments.delete(id);
  }
}

module.exports = new TreatmentRepository();
