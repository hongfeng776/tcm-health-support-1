const App = {
    currentModule: 'home',

    init() {
        if (window.Session) {
            Session.init();
        }
        this.renderSidebar();
        this.renderDoctorList();
        this.bindNavigation();
        this.bindQuickActions();
        this.initModules();
        this.updateNotificationBadge();
    },

    renderSidebar() {
        const deptList = document.getElementById('deptList');
        deptList.innerHTML = TCM_DATA.departments.map(dept => `
            <div class="dept-item" data-dept="${dept.id}">
                <span class="dept-icon">${dept.icon}</span>
                <span class="dept-name">${dept.name}</span>
            </div>
        `).join('');

        deptList.querySelectorAll('.dept-item').forEach(item => {
            item.addEventListener('click', () => {
                const deptId = item.dataset.dept;
                const dept = TCM_DATA.departments.find(d => d.id === deptId);
                this.switchModule('triage');
                if (dept) {
                    setTimeout(() => {
                        const firstSymptom = dept.symptoms[0];
                        if (firstSymptom && TriageModule) {
                            if (!TriageModule.selectedSymptoms.includes(firstSymptom)) {
                                TriageModule.toggleSymptom(firstSymptom);
                            }
                        }
                    }, 200);
                }
            });
        });
    },

    renderDoctorList() {
        const doctorList = document.getElementById('doctorList');
        doctorList.innerHTML = TCM_DATA.doctors.map(doctor => `
            <div class="doctor-item">
                <span class="doctor-item-avatar">${doctor.avatar}</span>
                <div class="doctor-item-info">
                    <h4>
                        <span class="doctor-status-badge ${doctor.available ? '' : 'offline'}"></span>
                        ${doctor.name}
                    </h4>
                    <p>${doctor.title} · ${doctor.department}</p>
                </div>
            </div>
        `).join('');
    },

    bindNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const module = btn.dataset.module;
                this.switchModule(module);
            });
        });

        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                const module = card.dataset.module;
                this.switchModule(module);
            });
        });
    },

    bindQuickActions() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    },

    handleQuickAction(action) {
        switch (action) {
            case 'start-chat':
                this.switchModule('chat');
                if (ChatModule && !ChatModule.currentConversationId) {
                    ChatModule.startNewConversation();
                }
                break;
            case 'quick-triage':
                this.switchModule('triage');
                break;
            case 'test-constitution':
                this.switchModule('constitution');
                break;
            case 'emergency-call':
                this.switchModule('emergency');
                break;
        }
    },

    switchModule(moduleName) {
        this.currentModule = moduleName;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.module === moduleName);
        });

        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.toggle('active', section.id === `module-${moduleName}`);
        });

        if (moduleName === 'constitution' && ConstitutionModule) {
            ConstitutionModule.retakeTest();
        }

        if (moduleName === 'triage' && TriageModule) {
            if (TriageModule.selectedSymptoms.length === 0) {
                TriageModule.resetTriage();
            } else {
                TriageModule.refreshSelectedSymptomsUI();
            }
        }
    },

    initModules() {
        if (window.ChatModule) ChatModule.init();
        if (window.TriageModule) TriageModule.init();
        if (window.ConstitutionModule) ConstitutionModule.init();
        if (window.EmergencyModule) EmergencyModule.init();
        if (window.RecordsModule) RecordsModule.init();
        if (window.Modals) Modals.init();
    },

    updateNotificationBadge() {
        const notifications = Storage.get('notifications', []);
        const unreadCount = notifications.filter(n => n.unread).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = unreadCount > 0 ? unreadCount : '0';
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
