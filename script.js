// Estado da aplicação
let currentFilters = {
    category: 'all',
    format: 'all',
    search: ''
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    renderContent(contentLibrary);
    setupEventListeners();
    updateStats(contentLibrary.length, contentLibrary.length);
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros de categoria
    const categoryButtons = document.querySelectorAll('#categoryFilters .filter-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveFilter(categoryButtons, e.target);
            currentFilters.category = e.target.dataset.category;
            applyFilters();
        });
    });

    // Filtros de formato
    const formatButtons = document.querySelectorAll('#formatFilters .filter-btn');
    formatButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveFilter(formatButtons, e.target);
            currentFilters.format = e.target.dataset.format;
            applyFilters();
        });
    });

    // Busca
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });

    // Modal
    const modal = document.getElementById('contentModal');
    const closeBtn = document.getElementById('closeModal');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Definir filtro ativo
function setActiveFilter(buttons, activeButton) {
    buttons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Aplicar filtros
function applyFilters() {
    let filtered = contentLibrary;

    // Filtro de categoria
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(item => item.categoria === currentFilters.category);
    }

    // Filtro de formato
    if (currentFilters.format !== 'all') {
        filtered = filtered.filter(item => item.formato === currentFilters.format);
    }

    // Filtro de busca
    if (currentFilters.search) {
        filtered = filtered.filter(item => {
            const searchableText = `
                ${item.titulo}
                ${item.categoria}
                ${item.formato}
                ${item.legenda}
                ${item.hashtags ? item.hashtags.join(' ') : ''}
            `.toLowerCase();
            return searchableText.includes(currentFilters.search);
        });
    }

    renderContent(filtered);
    updateStats(contentLibrary.length, filtered.length);
}

// Renderizar conteúdo
function renderContent(items) {
    const grid = document.getElementById('contentGrid');

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <p style="font-size: 1.25rem; color: var(--text-muted);">
                    Nenhum conteúdo encontrado com os filtros selecionados.
                </p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(item => createCard(item)).join('');

    // Adicionar event listeners aos cards
    const cards = grid.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const content = contentLibrary.find(item => item.id === id);
            if (content) {
                openModal(content);
            }
        });
    });
}

// Criar card
function createCard(item) {
    const preview = item.legenda ? item.legenda.substring(0, 120) + '...' : '';
    const hashtags = item.hashtags ? item.hashtags.slice(0, 3) : [];

    return `
        <div class="content-card" data-id="${item.id}">
            <div class="card-header">
                <span class="card-id">#${item.id}</span>
                <h3 class="card-title">${item.titulo}</h3>
            </div>
            <div class="card-meta">
                <span class="badge badge-categoria">${item.categoria}</span>
                <span class="badge badge-formato">${item.formato}</span>
            </div>
            <p class="card-preview">${preview}</p>
            <div class="card-hashtags">
                ${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join('')}
            </div>
        </div>
    `;
}

// Abrir modal
function openModal(content) {
    const modal = document.getElementById('contentModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = createModalContent(content);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('contentModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Criar conteúdo do modal
function createModalContent(item) {
    let sectionsHTML = '';

    // Roteiro ou Lâminas
    if (item.roteiro) {
        sectionsHTML += `
            <div class="modal-section">
                <h3>📝 Roteiro</h3>
                <p>${item.roteiro}</p>
            </div>
        `;
    }

    if (item.laminas && item.laminas.length > 0) {
        sectionsHTML += `
            <div class="modal-section">
                <h3>🎨 Lâminas do Carrossel</h3>
                <ul>
                    ${item.laminas.map((lamina, index) => `
                        <li><strong>Lâmina ${index + 1}:</strong> ${lamina}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Legenda
    if (item.legenda) {
        sectionsHTML += `
            <div class="modal-section">
                <h3>💬 Legenda</h3>
                <p>${item.legenda}</p>
            </div>
        `;
    }

    // Sugestão de criativo
    if (item.criativo) {
        sectionsHTML += `
            <div class="modal-section">
                <h3>🎬 Sugestão de Criativo</h3>
                <p>${item.criativo}</p>
            </div>
        `;
    }

    // Hashtags
    if (item.hashtags && item.hashtags.length > 0) {
        sectionsHTML += `
            <div class="modal-section">
                <h3>🏷️ Hashtags</h3>
                <div class="card-hashtags">
                    ${item.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="modal-header">
            <span class="card-id">#${item.id}</span>
            <h2 class="modal-title">${item.titulo}</h2>
            <div class="card-meta">
                <span class="badge badge-categoria">${item.categoria}</span>
                <span class="badge badge-formato">${item.formato}</span>
            </div>
        </div>
        ${sectionsHTML}
    `;
}

// Atualizar estatísticas
function updateStats(total, displaying) {
    document.getElementById('totalCount').textContent = total;
    document.getElementById('displayCount').textContent = displaying;
}
