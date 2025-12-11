// Mock homologation service
class HomologationMock {
  constructor() {
    // Simular aprovação/recusa aleatória (70% aprovado, 30% recusado)
    this.approvalRate = 0.4;
  }

  async submitForHomologation(treatment) {
    // Simular delay de resposta
    await this.delay(500);

    const isApproved = Math.random() < this.approvalRate;

    return {
      treatmentId: treatment.id,
      approved: isApproved,
      message: isApproved ? 'Tratamento aprovado' : 'Tratamento recusado - descrição insuficiente'
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new HomologationMock();
