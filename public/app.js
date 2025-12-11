// API Base URL
const API_BASE = 'http://localhost:8080/api';

// DOM Elements
const createForm = document.getElementById('createForm');
const descriptionInput = document.getElementById('description');
const createMessage = document.getElementById('createMessage');
const treatmentsList = document.getElementById('treatmentsList');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTreatmentId = document.getElementById('editTreatmentId');
const editDescription = document.getElementById('editDescription');
const closeBtn = document.querySelector('.close');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const filterName = document.getElementById('filterName');
const filterBtn = document.getElementById('filterBtn');

// State for filters
let allTreatments = [];

// Event Listeners
createForm.addEventListener('submit', handleCreateTreatment);
refreshBtn.addEventListener('click', loadTreatments);
editForm.addEventListener('submit', handleEditAndResend);
closeBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
filterBtn.addEventListener('click', applyDateFilter);
filterName.addEventListener('input', () => {
    if (filterName.value.trim() === '') {
        displayTreatments(allTreatments);
    }
});

// Load treatments on page load
document.addEventListener('DOMContentLoaded', loadTreatments);

// Create Treatment
async function handleCreateTreatment(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();

    if (!description) {
        showMessage(createMessage, 'Descrição é obrigatória', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/treatments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const treatment = await response.json();
        showMessage(createMessage, `Tratamento criado com sucesso! ID: ${treatment.id}`, 'success');
        createForm.reset();
        await loadTreatments();
    } catch (error) {
        showMessage(createMessage, `Erro: ${error.message}`, 'error');
    }
}

// Load all treatments
async function loadTreatments() {
    try {
        const response = await fetch(`${API_BASE}/treatments`);

        if (!response.ok) {
            throw new Error('Erro ao carregar tratamentos');
        }

        allTreatments = await response.json();

        if (allTreatments.length === 0) {
            treatmentsList.innerHTML = '<p class="placeholder">Nenhum tratamento cadastrado ainda...</p>';
            return;
        }

        displayTreatments(allTreatments);

        // Add event listeners to buttons (use the button element's dataset to avoid event target issues)
        document.querySelectorAll('.btn-send').forEach(btn => {
            btn.addEventListener('click', () => handleSendForHomologation(btn.dataset.id));
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => handleDeleteTreatment(btn.dataset.id));
        });
    } catch (error) {
        console.error('Erro:', error);
        treatmentsList.innerHTML = `<p class="placeholder">Erro ao carregar tratamentos</p>`;
    }
}

// Create treatment card HTML
function createTreatmentCard(treatment) {
    const statusLabels = {
        DRAFT: 'Rascunho',
        PENDING: 'Aguardando',
        APPROVED: 'Aprovado',
        RECUSADO: 'Recusado'
    };

    const actions = {
        DRAFT: `
            <button class="btn btn-primary btn-send" data-id="${treatment.id}">Enviar para Homologação</button>
            <button class="btn btn-warning btn-edit" data-id="${treatment.id}">Editar</button>
        `,
        PENDING: `<button class="btn btn-secondary" disabled>Aguardando resposta...</button>`,
        APPROVED: `<span style="color: var(--secondary-color); font-weight: bold;">Registrado</span>`,
        RECUSADO: `
            <button class="btn btn-warning btn-edit" data-id="${treatment.id}">Editar</button>
            <button class="btn btn-danger btn-delete" data-id="${treatment.id}">Deletar</button>
        `
    };

    return `
        <div class="treatment-card">
            <h3>Atendimento</h3>
            <p class="treatment-id">ID: ${treatment.id}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${treatment.status}">${statusLabels[treatment.status]}</span></p>
            <p><strong>Data:</strong> ${new Date(treatment.createdAt).toLocaleString('pt-BR')}</p>
            <div class="treatment-description">
                <strong>Descrição:</strong><br>${escapeHtml(treatment.description)}
            </div>
            <div class="treatment-actions">
                ${actions[treatment.status]}
            </div>
        </div>
    `;
}

// Send for homologation
async function handleSendForHomologation(id) {
    try {
        const btn = document.querySelector(`[data-id="${id}"].btn-send`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Enviando...';
        }

        const response = await fetch(`${API_BASE}/treatments/${id}/send-homologation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const result = await response.json();

        if (result.status === 'APPROVED') {
            showMessage(createMessage, result.message, 'success');
        } else {
            showMessage(createMessage, result.message, 'info');
        }

        await loadTreatments();
    } catch (error) {
        showMessage(createMessage, `Erro: ${error.message}`, 'error');
        await loadTreatments();
    }
}

// Open edit modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE}/treatments/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar tratamento');

        const treatment = await response.json();
        editTreatmentId.value = id;
        editDescription.value = treatment.description;
        editModal.classList.remove('hidden');
    } catch (error) {
        showMessage(createMessage, `Erro: ${error.message}`, 'error');
    }
}

// Close edit modal
function closeEditModal() {
    editModal.classList.add('hidden');
    editForm.reset();
}

// Handle edit and resend
async function handleEditAndResend(e) {
    e.preventDefault();

    const id = editTreatmentId.value;
    const description = editDescription.value.trim();

    if (!description) {
        showMessage(createMessage, 'Descrição é obrigatória', 'error');
        return;
    }

    try {
        // Update treatment
        const updateResponse = await fetch(`${API_BASE}/treatments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.error);
        }

        // Send for homologation
        const sendResponse = await fetch(`${API_BASE}/treatments/${id}/send-homologation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!sendResponse.ok) {
            const error = await sendResponse.json();
            throw new Error(error.error);
        }

        const result = await sendResponse.json();

        if (result.status === 'APPROVED') {
            showMessage(createMessage, result.message, 'success');
        } else {
            showMessage(createMessage, result.message, 'info');
        }

        closeEditModal();
        await loadTreatments();
    } catch (error) {
        showMessage(createMessage, `❌ Erro: ${error.message}`, 'error');
    }
}

// Delete treatment
async function handleDeleteTreatment(id) {
    if (!confirm('Tem certeza que deseja deletar este tratamento?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/treatments/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        showMessage(createMessage, 'Tratamento deletado com sucesso', 'success');
        await loadTreatments();
    } catch (error) {
        showMessage(createMessage, `❌ Erro: ${error.message}`, 'error');
    }
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Display treatments
function displayTreatments(treatments) {
    if (treatments.length === 0) {
        treatmentsList.innerHTML = '<p class="placeholder">Nenhum tratamento encontrado...</p>';
        return;
    }

    treatmentsList.innerHTML = treatments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(treatment => createTreatmentCard(treatment))
        .join('');

    // Re-attach event listeners
    document.querySelectorAll('.btn-send').forEach(btn => {
        btn.addEventListener('click', () => handleSendForHomologation(btn.dataset.id));
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteTreatment(btn.dataset.id));
    });
}

// Apply date filter
function applyDateFilter() {
    const searchTerm = filterName.value.trim().toLowerCase();

    if (!searchTerm) {
        alert('Por favor, digite uma descrição para buscar');
        return;
    }

    const filtered = allTreatments.filter(treatment => {
        return treatment.description.toLowerCase().includes(searchTerm);
    });

    displayTreatments(filtered);
}

// Clear date filter
// (clear filter button removed) helper cleared — clearing now done by input listener

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});
