const repository = require('./repository');
const homologationMock = require('./homologationMock');
const Treatment = require('./model');

class TreatmentService {
  createTreatment(description) {
    if (!description || description.trim().length === 0) {
      throw new Error('Descrição é obrigatória');
    }
    const treatment = new Treatment(description);
    return repository.save(treatment);
  }

  getTreatment(id) {
    const treatment = repository.findById(id);
    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }
    return treatment;
  }

  getAllTreatments() {
    return repository.findAll();
  }

  async sendForHomologation(id) {
    const treatment = repository.findById(id);
    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }

    if (treatment.status !== 'DRAFT' && treatment.status !== 'RECUSADO') {
      throw new Error('Apenas tratamentos em rascunho ou recusados podem ser enviados');
    }

    treatment.status = 'PENDING';
    repository.update(treatment);

    // Call the mock homologation service
    const homologationResponse = await homologationMock.submitForHomologation(treatment);

    if (homologationResponse.approved) {
      treatment.status = 'APPROVED';
    } else {
      treatment.status = 'RECUSADO';
    }

    repository.update(treatment);

    return {
      treatmentId: treatment.id,
      status: treatment.status,
      message: homologationResponse.message
    };
  }

  updateTreatment(id, description) {
    const treatment = repository.findById(id);
    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }

    if (treatment.status !== 'DRAFT' && treatment.status !== 'RECUSADO') {
      throw new Error('Apenas tratamentos em rascunho ou recusados podem ser editados');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Descrição é obrigatória');
    }

    treatment.description = description;
    if (treatment.status === 'RECUSADO') {
      treatment.status = 'DRAFT';
    }

    return repository.update(treatment);
  }

  deleteTreatment(id) {
    const treatment = repository.findById(id);
    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }

    if (treatment.status === 'APPROVED') {
      throw new Error('Não é possível deletar tratamentos aprovados');
    }

    return repository.delete(id);
  }
}

module.exports = new TreatmentService();
