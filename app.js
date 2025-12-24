// STATE MANAGEMENT
const state = {
    transactions: [],
    debts: [],
    debtsPayments: [],
    maintenance: [],
    theme: localStorage.getItem('finflow_theme') || 'dark',
    isLoggedIn: false
};

// AUTENTICACIÓN
function generateCredentials() {
    const username = 'user_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const password = Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 4);
    return { username, password };
}

function initializeAuth() {
    let credentials = localStorage.getItem('finflow_credentials');

    if (!credentials) {
        // Primera vez: generar credenciales
        const newCredentials = generateCredentials();
        localStorage.setItem('finflow_credentials', JSON.stringify(newCredentials));
        showInitialSetup(newCredentials);
    } else {
        // Ya existen credenciales: mostrar login
        showLoginScreen();
    }
}

function showInitialSetup(credentials) {
    const setupHtml = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%); display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="background: rgba(30, 30, 40, 0.99); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2.5rem; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
                <h1 style="color: #f3f4f6; margin: 0 0 1rem 0; font-size: 1.75rem;">¡Bienvenido a Control Jarol!</h1>
                <p style="color: #d1d5db; margin-bottom: 2rem; line-height: 1.6;">Tu app ha generado credenciales únicas para ti. <strong>Guárdalas en un lugar seguro</strong> - las necesitarás para acceder.</p>
                
                <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid #06b6d4; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="color: #d1d5db; font-size: 0.875rem; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">Usuario:</label>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 0.75rem; border-radius: 8px; color: #f3f4f6; font-weight: 600; font-family: monospace; word-break: break-all;">${credentials.username}</div>
                        <button onclick="copyToClipboard('${credentials.username}')" style="margin-top: 0.5rem; background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; color: #06b6d4; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">📋 Copiar</button>
                    </div>
                    <div>
                        <label style="color: #d1d5db; font-size: 0.875rem; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">Contraseña:</label>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 0.75rem; border-radius: 8px; color: #f3f4f6; font-weight: 600; font-family: monospace; word-break: break-all;">${credentials.password}</div>
                        <button onclick="copyToClipboard('${credentials.password}')" style="margin-top: 0.5rem; background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; color: #06b6d4; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">📋 Copiar</button>
                    </div>
                </div>
                
                <p style="color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem;">⚠️ <strong>¡Importante!</strong> Guarda estas credenciales. Son únicas y no se pueden recuperar.</p>
                
                <button onclick="confirmSetup()" style="width: 100%; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">He Guardado mis Credenciales</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', setupHtml);
}

function showLoginScreen() {
    const loginHtml = `
        <div id="loginOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%); display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="background: rgba(30, 30, 40, 0.99); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2.5rem; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <div style="font-size: 2.5rem; text-align: center; margin-bottom: 1.5rem;">🔒</div>
                <h1 style="color: #f3f4f6; margin: 0 0 0.5rem 0; font-size: 1.5rem; text-align: center;">Inicia Sesión</h1>
                <p style="color: #d1d5db; text-align: center; margin-bottom: 2rem;">Accede a tu Control Jarol seguro</p>
                
                <form id="loginForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                        <label style="display: block; color: #d1d5db; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Usuario</label>
                        <input type="text" id="loginUsername" name="username" autocomplete="username" placeholder="Tu usuario" style="width: 100%; padding: 0.875rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #f3f4f6; font-size: 1rem; font-family: inherit; box-sizing: border-box;" required>
                    </div>
                    <div>
                        <label style="display: block; color: #d1d5db; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Contraseña</label>
                        <input type="password" id="loginPassword" name="password" autocomplete="current-password" placeholder="Tu contraseña" style="width: 100%; padding: 0.875rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #f3f4f6; font-size: 1rem; font-family: inherit; box-sizing: border-box;" required>
                    </div>
                    <button type="submit" style="width: 100%; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">Entrar</button>
                </form>
                
                <div id="loginError" style="color: #ef4444; text-align: center; margin-top: 1rem; display: none; font-size: 0.9rem;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loginHtml);

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        validateLogin();
    });
}

function validateLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const credentials = JSON.parse(localStorage.getItem('finflow_credentials'));

    if (username === credentials.username && password === credentials.password) {
        state.isLoggedIn = true;
        localStorage.setItem('finflow_loggedIn', 'true');
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) loginOverlay.remove();
        loadDataFromStorage();
        setTheme(state.theme);
        setTodayDate();
        renderDashboard();
        renderDebtsPage();
        renderMotoPage();
        setupKeyboardShortcuts();
        showSuccessMessage('¡Bienvenido!');
    } else {
        document.getElementById('loginError').textContent = '❌ Usuario o contraseña incorrectos';
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginPassword').value = '';
    }
}

function showSuccessMessage(msg) {
    const message = document.createElement('div');
    message.textContent = msg;
    message.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function confirmSetup() {
    state.isLoggedIn = true;
    localStorage.setItem('finflow_loggedIn', 'true');
    document.querySelector('div[style*="position: fixed"]').remove();
    loadDataFromStorage();
    setTheme(state.theme);
    setTodayDate();
    renderDashboard();
    renderDebtsPage();
    renderMotoPage();
    setupKeyboardShortcuts();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessMessage('✓ Copiado al portapapeles');
    });
}

// LOAD DATA
function loadDataFromStorage() {
    try {
        const savedTransactions = localStorage.getItem('finflow_transactions');
        const savedDebts = localStorage.getItem('finflow_debts');
        const savedPayments = localStorage.getItem('finflow_payments');
        const savedMaintenance = localStorage.getItem('finflow_maintenance');

        if (savedTransactions) state.transactions = JSON.parse(savedTransactions);
        if (savedDebts) state.debts = JSON.parse(savedDebts);
        if (savedPayments) state.debtsPayments = JSON.parse(savedPayments);
        if (savedMaintenance) state.maintenance = JSON.parse(savedMaintenance);

        console.log('✅ Todos los datos cargados correctamente');
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// INIT
function init() {
    const isLoggedIn = localStorage.getItem('finflow_loggedIn');
    if (isLoggedIn) {
        state.isLoggedIn = true;
        loadDataFromStorage();
        setTheme(state.theme);
        setTodayDate();
        renderDashboard();
        renderDebtsPage();
        renderMotoPage();
        setupKeyboardShortcuts();
    } else {
        initializeAuth();
    }
}

// THEME
function setTheme(theme) {
    state.theme = theme;
    localStorage.setItem('finflow_theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
    document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
}

document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
});

// PAGE NAVIGATION
function switchPage(pageId, element) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    document.getElementById(pageId).classList.add('active');
    if (element) {
        element.classList.add('active');
    } else {
        // Fallback to find the tab by text if element is not passed
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('onclick').includes(`'${pageId}'`)) {
                tab.classList.add('active');
            }
        });
    }

    if (pageId === 'deudas') populateDebtSelect();
}

// MODAL CONTROL
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// SET TODAY DATE
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    document.getElementById('debtAcquisitionDate').value = today;
    document.getElementById('debtFirstDueDate').value = today;
    document.getElementById('paymentDate').value = today;
    document.getElementById('maintenanceDate').value = today;
}

// ========== INCOME/EXPENSE FORMS ==========
document.getElementById('incomeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        id: Date.now(),
        type: 'income',
        source: document.getElementById('incomeSource').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value
    };
    state.transactions.push(transaction);
    localStorage.setItem('finflow_transactions', JSON.stringify(state.transactions));
    closeModal('income-modal');
    renderDashboard();
    document.getElementById('incomeForm').reset();
    setTodayDate();
    showSuccess('Ingreso guardado');
});

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        id: Date.now(),
        type: 'expense',
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value
    };
    state.transactions.push(transaction);
    localStorage.setItem('finflow_transactions', JSON.stringify(state.transactions));
    closeModal('expense-modal');
    renderDashboard();
    document.getElementById('expenseForm').reset();
    setTodayDate();
    showSuccess('Gasto guardado');
});

// ========== DEBT FORMS ==========
document.getElementById('debtForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const debt = {
        id: Date.now(),
        type: document.getElementById('debtType').value,
        amount: parseFloat(document.getElementById('debtAmount').value),
        installments: parseInt(document.getElementById('debtInstallments').value),
        acquisitionDate: document.getElementById('debtAcquisitionDate').value,
        firstDueDate: document.getElementById('debtFirstDueDate').value,
        frequency: parseInt(document.getElementById('debtFrequency').value),
        paid: 0
    };
    state.debts.push(debt);
    localStorage.setItem('finflow_debts', JSON.stringify(state.debts));
    closeModal('debt-modal');
    populateDebtSelect();
    renderDebtsPage();
    renderDashboard();
    document.getElementById('debtForm').reset();
    setTodayDate();
    showSuccess('Deuda agregada');
});

document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const debtId = parseInt(document.getElementById('debtSelect').value);
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;

    const debt = state.debts.find(d => d.id === debtId);
    if (debt) {
        debt.paid = (debt.paid || 0) + amount;
        localStorage.setItem('finflow_debts', JSON.stringify(state.debts));

        state.debtsPayments.push({
            id: Date.now(),
            debtId,
            amount,
            date
        });
        localStorage.setItem('finflow_payments', JSON.stringify(state.debtsPayments));
    }

    closeModal('make-payment-modal');
    renderDebtsPage();
    renderDashboard();
    document.getElementById('paymentForm').reset();
    setTodayDate();
    showSuccess('Pago registrado');
});

// ========== MAINTENANCE FORMS ==========
document.getElementById('maintenanceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const maintenance = {
        id: Date.now(),
        type: document.getElementById('maintenanceType').value,
        description: document.getElementById('maintenanceDescription').value,
        cost: parseFloat(document.getElementById('maintenanceCost').value),
        kilometers: parseInt(document.getElementById('maintenanceKm').value),
        date: document.getElementById('maintenanceDate').value
    };
    state.maintenance.push(maintenance);
    localStorage.setItem('finflow_maintenance', JSON.stringify(state.maintenance));
    closeModal('maintenance-modal');
    renderMotoPage();
    renderDashboard();
    document.getElementById('maintenanceForm').reset();
    setTodayDate();
    showSuccess('Mantenimiento registrado');
});

// ========== RENDER FUNCTIONS ==========
function renderDashboard() {
    const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const debtsPending = state.debts.reduce((s, d) => s + (d.amount - d.paid), 0);
    const totalPaidOnDebts = state.debts.reduce((s, d) => s + (d.paid || 0), 0);
    const available = income - expenses - totalPaidOnDebts;

    document.getElementById('totalIncome').textContent = '$' + income.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('totalExpenses').textContent = '$' + expenses.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('totalDebtsDisplay').textContent = '$' + debtsPending.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('availableMoney').textContent = '$' + available.toLocaleString('es-CO', { maximumFractionDigits: 0 });

    renderTransactionsList();
    generateInsights(income, expenses, debtsPending);
}

function renderTransactionsList() {
    const container = document.getElementById('transactionsList');

    if (state.transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div>Sin transacciones registradas</div></div>';
    } else {
        const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = sorted.map(t => {
            const label = t.type === 'income' ? t.source : `${t.category} - ${t.description}`;
            const amountClass = t.type === 'income' ? 'income' : 'expense';
            const amountSign = t.type === 'income' ? '+' : '-';

            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type">${t.type === 'income' ? '💵' : '🛒'} ${label}</div>
                        <div class="transaction-details">
                            <span>📅 ${new Date(t.date).toLocaleDateString('es-CO')}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">${amountSign}$${t.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
                    <div class="transaction-actions">
                        <button class="btn-action btn-edit" onclick="editTransaction(${t.id})">✏️ Editar</button>
                        <button class="btn-action btn-delete" onclick="deleteTransaction(${t.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderDebtsPage() {
    const container = document.getElementById('debtsList');

    if (state.debts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💳</div><div>Sin deudas registradas</div></div>';
    } else {
        container.innerHTML = state.debts.map(debt => {
            const pending = debt.amount - debt.paid;
            const percentage = (debt.paid / debt.amount) * 100;

            // Calcular próxima fecha de vencimiento basada en cuotas pagadas
            const installmentsPaid = Math.floor(debt.paid / (debt.amount / debt.installments));
            const nextDueDate = new Date(debt.firstDueDate + 'T00:00:00');
            nextDueDate.setDate(nextDueDate.getDate() + (installmentsPaid * debt.frequency));

            return `           <div class="debt-card">
                    <div class="debt-header">
                        <div class="debt-type">${debt.type}</div>
                        <div class="debt-amount">$${debt.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div class="debt-details">
                        <div class="detail-item">
                            <div class="detail-label">Cuotas</div>
                            <div class="detail-value">${debt.installments}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Pagado</div>
                            <div class="detail-value">$${debt.paid.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Pendiente</div>
                            <div class="detail-value" style="color: var(--danger);">$${pending.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Próximo Vence</div>
                            <div class="detail-value">${pending <= 0 ? '<span style="color: var(--success);">¡Pagada!</span>' : nextDueDate.toLocaleDateString('es-CO')}</div>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Progreso: ${percentage.toFixed(0)}%</div>
                    <button class="btn-delete-debt" onclick="deleteDebt(${debt.id})">Eliminar Deuda</button>
                </div>
            `;
        }).join('');
    }

    updateDebtsSummary();
}

function renderMotoPage() {
    const totalKm = Math.max(...state.maintenance.map(m => m.kilometers), 0);
    const totalCost = state.maintenance.reduce((s, m) => s + m.cost, 0);

    document.getElementById('motoKilometers').textContent = totalKm.toLocaleString('es-CO');
    document.getElementById('motoServices').textContent = state.maintenance.length;
    document.getElementById('motoTotalCost').textContent = '$' + totalCost.toLocaleString('es-CO', { maximumFractionDigits: 0 });

    const container = document.getElementById('maintenanceList');
    if (state.maintenance.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔧</div><div>Sin mantenimientos</div></div>';
    } else {
        const sorted = [...state.maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = sorted.map(m => `
            <div class="maintenance-item">
                <div class="maintenance-info">
                    <div class="maintenance-name">${m.type}</div>
                    <div class="maintenance-meta">
                        <span>📅 ${new Date(m.date).toLocaleDateString('es-CO')}</span>
                        <span>🛣️ ${m.kilometers} km</span>
                        <span>${m.description}</span>
                    </div>
                </div>
                <div class="maintenance-cost">$${m.cost.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
            </div>
        `).join('');
    }
}

function updateDebtsSummary() {
    const totalDebt = state.debts.reduce((s, d) => s + d.amount, 0);
    const totalPaid = state.debts.reduce((s, d) => s + d.paid, 0);
    const totalPending = state.debts.reduce((s, d) => s + (d.amount - d.paid), 0);
    const avgPayment = state.debts.length > 0 ? totalDebt / state.debts.reduce((s, d) => s + d.installments, 0) : 0;

    document.getElementById('totalDebtAmount').textContent = '$' + totalDebt.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('totalPaidAmount').textContent = '$' + totalPaid.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('totalPendingAmount').textContent = '$' + totalPending.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    document.getElementById('avgPaymentAmount').textContent = '$' + avgPayment.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function populateDebtSelect() {
    const select = document.getElementById('debtSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Selecciona deuda</option>' + state.debts.map(d => {
        const remaining = d.amount - d.paid;
        return `<option value="${d.id}">${d.type} - Pendiente: $${remaining.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</option>`;
    }).join('');
}

function generateInsights(income, expenses, debts) {
    const container = document.getElementById('insightsContainer');
    if (income === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    // Usar la misma lógica de "Dinero Disponible" que el dashboard
    const totalPaidOnDebts = state.debts.reduce((s, d) => s + (d.paid || 0), 0);
    const available = income - expenses - totalPaidOnDebts;
    const savingsRate = available / income;

    if (savingsRate > 0.3) {
        html += '<div class="insights-section" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border-color: var(--success);"><div class="insight-title">🌟 ¡Excelente! Ahorras más del 30%</div></div>';
    } else if (available < 0) {
        html += '<div class="insights-section" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1)); border-color: var(--danger);"><div class="insight-title">⚠️ Gastas más de lo que ganas</div></div>';
    }

    container.innerHTML = html;
}

function deleteDebt(id) {
    if (confirm('¿Eliminar esta deuda?')) {
        state.debts = state.debts.filter(d => d.id !== id);
        localStorage.setItem('finflow_debts', JSON.stringify(state.debts));
        populateDebtSelect();
        renderDebtsPage();
        renderDashboard();
        showSuccess('Deuda eliminada');
    }
}

function generateMotoReport() {
    const totalCost = state.maintenance.reduce((s, m) => s + m.cost, 0);
    const lastService = state.maintenance.length > 0 ? state.maintenance.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : 'Sin servicios';
    const msg = `
🏍️ REPORTE DE MANTENIMIENTO
━━━━━━━━━━━━━━━━━━━
📊 Total de Servicios: ${state.maintenance.length}
💰 Inversión Total: $${totalCost.toLocaleString('es-CO')}
🛣️ Km Registrados: ${Math.max(...state.maintenance.map(m => m.kilometers), 0)}
📅 Último Servicio: ${lastService}
━━━━━━━━━━━━━━━━━━━
    `;
    alert(msg);
}

function showSuccess(message) {
    const hint = document.getElementById('shortcutHint');
    if (!hint) return;
    hint.textContent = `✓ ${message}`;
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 2000);
}

function editTransaction(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    const isIncome = transaction.type === 'income';
    document.getElementById('editTransactionType').value = transaction.type;
    document.getElementById('editTransactionAmount').value = transaction.amount;
    document.getElementById('editTransactionDate').value = transaction.date;

    if (isIncome) {
        document.getElementById('editIncomeFields').style.display = 'block';
        document.getElementById('editExpenseFields').style.display = 'none';
        document.getElementById('editIncomeSource').value = transaction.source;
    } else {
        document.getElementById('editIncomeFields').style.display = 'none';
        document.getElementById('editExpenseFields').style.display = 'block';
        document.getElementById('editExpenseCategory').value = transaction.category;
        document.getElementById('editExpenseDescription').value = transaction.description;
    }

    document.getElementById('editTransactionForm').onsubmit = (e) => {
        e.preventDefault();

        const index = state.transactions.findIndex(t => t.id === id);
        if (index === -1) return;

        if (isIncome) {
            state.transactions[index].source = document.getElementById('editIncomeSource').value;
        } else {
            state.transactions[index].category = document.getElementById('editExpenseCategory').value;
            state.transactions[index].description = document.getElementById('editExpenseDescription').value;
        }

        state.transactions[index].amount = parseFloat(document.getElementById('editTransactionAmount').value);
        state.transactions[index].date = document.getElementById('editTransactionDate').value;

        localStorage.setItem('finflow_transactions', JSON.stringify(state.transactions));
        closeModal('edit-transaction-modal');
        renderDashboard();
        showSuccess('Transacción actualizada');
    };

    openModal('edit-transaction-modal');
}

function deleteTransaction(id) {
    if (confirm('¿Eliminar esta transacción?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        localStorage.setItem('finflow_transactions', JSON.stringify(state.transactions));
        renderDashboard();
        showSuccess('Transacción eliminada');
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            openModal('income-modal');
        }
    });
}

// Logout functionality
function logout() {
    if (confirm('¿Cerrar sesión?')) {
        state.isLoggedIn = false;
        localStorage.removeItem('finflow_loggedIn');
        window.location.reload();
    }
}

init();
