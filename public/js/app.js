class CRMApp {
    constructor() {
        this.token = localStorage.getItem('crmToken');
        this.user = null;
        this.init();
    }

    init() {
        this.bindEvents();
        if (this.token) {
            this.showMainSection();
            this.loadDashboard();
        } else {
            this.showLoginSection();
        }
    }

    bindEvents() {
        // Auth events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('showLogin').addEventListener('click', () => this.showLoginForm());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation events
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigate(e.target.dataset.section));
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Add buttons
        document.getElementById('addCustomerBtn').addEventListener('click', () => this.showCustomerForm());
        document.getElementById('addLeadBtn').addEventListener('click', () => this.showLeadForm());
        document.getElementById('addContactBtn').addEventListener('click', () => this.showContactForm());

        // Search and filters
        document.getElementById('customerSearch').addEventListener('input', (e) => this.searchCustomers(e.target.value));
        document.getElementById('leadStatusFilter').addEventListener('change', (e) => this.filterLeads(e.target.value));
    }

    async apiCall(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API call failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            this.showError(error.message);
            throw error;
        }
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        alert(`Success: ${message}`);
    }

    // Authentication methods
    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await this.apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('crmToken', this.token);
            
            this.showMainSection();
            this.loadDashboard();
            this.showSuccess('Login successful!');
        } catch (error) {
            // Error already handled in apiCall
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            await this.apiCall('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password })
            });

            this.showSuccess('Registration successful! Please login.');
            this.showLoginForm();
        } catch (error) {
            // Error already handled in apiCall
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('crmToken');
        this.showLoginSection();
    }

    // UI Navigation
    showLoginSection() {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('mainSection').classList.add('hidden');
    }

    showMainSection() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('mainSection').classList.remove('hidden');
        if (this.user) {
            document.getElementById('userInfo').textContent = `Welcome, ${this.user.username}`;
        }
    }

    showLoginForm() {
        document.querySelector('.login-form').classList.remove('hidden');
        document.querySelector('.register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.querySelector('.login-form').classList.add('hidden');
        document.querySelector('.register-form').classList.remove('hidden');
    }

    navigate(section) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show selected section
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'leads':
                this.loadLeads();
                break;
            case 'contacts':
                this.loadContacts();
                break;
        }
    }

    // Modal methods
    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    // Dashboard
    async loadDashboard() {
        try {
            const [customers, leads, contacts] = await Promise.all([
                this.apiCall('/api/customers'),
                this.apiCall('/api/leads'),
                this.apiCall('/api/contacts')
            ]);

            document.getElementById('customerCount').textContent = customers.length;
            document.getElementById('leadCount').textContent = leads.filter(l => l.status !== 'converted').length;
            document.getElementById('contactCount').textContent = contacts.length;
        } catch (error) {
            // Error already handled
        }
    }

    // Customers
    async loadCustomers(searchTerm = '') {
        try {
            const url = searchTerm ? `/api/customers?search=${encodeURIComponent(searchTerm)}` : '/api/customers';
            const customers = await this.apiCall(url);
            this.renderCustomers(customers);
        } catch (error) {
            // Error already handled
        }
    }

    renderCustomers(customers) {
        const list = document.getElementById('customerList');
        if (customers.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: #7f8c8d;">No customers found</p>';
            return;
        }

        list.innerHTML = customers.map(customer => `
            <div class="data-item">
                <div class="data-info">
                    <h4>${customer.name}</h4>
                    <p>${customer.email || 'No email'} • ${customer.company || 'No company'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-small btn-edit" onclick="app.editCustomer(${customer.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="app.deleteCustomer(${customer.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    searchCustomers(term) {
        this.loadCustomers(term);
    }

    showCustomerForm(customer = null) {
        const isEdit = !!customer;
        const title = isEdit ? 'Edit Customer' : 'Add Customer';
        
        const form = `
            <h3>${title}</h3>
            <form id="customerForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${customer?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${customer?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value="${customer?.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" name="company" value="${customer?.company || ''}">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address">${customer?.address || ''}</textarea>
                </div>
                ${isEdit ? `
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                ` : ''}
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;

        this.showModal(form);

        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer(new FormData(e.target), customer?.id);
        });
    }

    async saveCustomer(formData, id = null) {
        const data = Object.fromEntries(formData);
        
        try {
            if (id) {
                await this.apiCall(`/api/customers/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                this.showSuccess('Customer updated successfully!');
            } else {
                await this.apiCall('/api/customers', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                this.showSuccess('Customer created successfully!');
            }
            
            this.closeModal();
            this.loadCustomers();
        } catch (error) {
            // Error already handled
        }
    }

    async editCustomer(id) {
        try {
            const customer = await this.apiCall(`/api/customers/${id}`);
            this.showCustomerForm(customer);
        } catch (error) {
            // Error already handled
        }
    }

    async deleteCustomer(id) {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        try {
            await this.apiCall(`/api/customers/${id}`, { method: 'DELETE' });
            this.showSuccess('Customer deleted successfully!');
            this.loadCustomers();
        } catch (error) {
            // Error already handled
        }
    }

    // Leads (simplified - similar patterns)
    async loadLeads(status = '') {
        try {
            const url = status ? `/api/leads?status=${status}` : '/api/leads';
            const leads = await this.apiCall(url);
            this.renderLeads(leads);
        } catch (error) {
            // Error already handled
        }
    }

    renderLeads(leads) {
        const list = document.getElementById('leadList');
        if (leads.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: #7f8c8d;">No leads found</p>';
            return;
        }

        list.innerHTML = leads.map(lead => `
            <div class="data-item">
                <div class="data-info">
                    <h4>${lead.name}</h4>
                    <p>${lead.email || 'No email'} • Status: ${lead.status} • Score: ${lead.score}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-small btn-edit" onclick="app.editLead(${lead.id})">Edit</button>
                    ${lead.status !== 'converted' ? `<button class="btn-small btn-convert" onclick="app.convertLead(${lead.id})">Convert</button>` : ''}
                    <button class="btn-small btn-delete" onclick="app.deleteLead(${lead.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    filterLeads(status) {
        this.loadLeads(status);
    }

    showLeadForm(lead = null) {
        const isEdit = !!lead;
        const title = isEdit ? 'Edit Lead' : 'Add Lead';
        
        const form = `
            <h3>${title}</h3>
            <form id="leadForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${lead?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${lead?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value="${lead?.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" name="company" value="${lead?.company || ''}">
                </div>
                <div class="form-group">
                    <label>Source</label>
                    <input type="text" name="source" value="${lead?.source || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="new" ${lead?.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead?.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="qualified" ${lead?.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="converted" ${lead?.status === 'converted' ? 'selected' : ''}>Converted</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Score</label>
                    <input type="number" name="score" value="${lead?.score || 0}" min="0" max="100">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;

        this.showModal(form);

        document.getElementById('leadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLead(new FormData(e.target), lead?.id);
        });
    }

    async saveLead(formData, id = null) {
        const data = Object.fromEntries(formData);
        
        try {
            if (id) {
                await this.apiCall(`/api/leads/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                this.showSuccess('Lead updated successfully!');
            } else {
                await this.apiCall('/api/leads', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                this.showSuccess('Lead created successfully!');
            }
            
            this.closeModal();
            this.loadLeads();
        } catch (error) {
            // Error already handled
        }
    }

    async editLead(id) {
        try {
            const lead = await this.apiCall(`/api/leads/${id}`);
            this.showLeadForm(lead);
        } catch (error) {
            // Error already handled
        }
    }

    async convertLead(id) {
        if (!confirm('Convert this lead to a customer?')) return;

        try {
            await this.apiCall(`/api/leads/${id}/convert`, { method: 'POST' });
            this.showSuccess('Lead converted to customer successfully!');
            this.loadLeads();
        } catch (error) {
            // Error already handled
        }
    }

    async deleteLead(id) {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            await this.apiCall(`/api/leads/${id}`, { method: 'DELETE' });
            this.showSuccess('Lead deleted successfully!');
            this.loadLeads();
        } catch (error) {
            // Error already handled
        }
    }

    // Contacts (simplified)
    async loadContacts() {
        try {
            const contacts = await this.apiCall('/api/contacts');
            this.renderContacts(contacts);
        } catch (error) {
            // Error already handled
        }
    }

    renderContacts(contacts) {
        const list = document.getElementById('contactList');
        if (contacts.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: #7f8c8d;">No contacts found</p>';
            return;
        }

        list.innerHTML = contacts.map(contact => `
            <div class="data-item">
                <div class="data-info">
                    <h4>${contact.subject || 'No subject'}</h4>
                    <p>Customer: ${contact.customer_name || 'Unknown'} • Type: ${contact.type} • ${new Date(contact.date).toLocaleDateString()}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-small btn-edit" onclick="app.editContact(${contact.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="app.deleteContact(${contact.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    showContactForm() {
        // Simplified contact form
        const form = `
            <h3>Add Contact</h3>
            <p>Contact management functionality would be implemented here with customer selection, type, subject, and content fields.</p>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
        `;
        this.showModal(form);
    }

    async editContact(id) {
        alert('Contact editing would be implemented here');
    }

    async deleteContact(id) {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        
        try {
            await this.apiCall(`/api/contacts/${id}`, { method: 'DELETE' });
            this.showSuccess('Contact deleted successfully!');
            this.loadContacts();
        } catch (error) {
            // Error already handled
        }
    }
}

// Initialize the app
const app = new CRMApp();