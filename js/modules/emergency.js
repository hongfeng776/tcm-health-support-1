const EmergencyModule = {
    init() {
        this.renderEmergencySymptoms();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('emergencySearch').addEventListener('input', (e) => {
            this.searchSymptoms(e.target.value);
        });
    },

    renderEmergencySymptoms() {
        const { emergencySymptoms } = TCM_DATA;
        
        const critical = emergencySymptoms.filter(s => s.level === 'critical');
        const urgent = emergencySymptoms.filter(s => s.level === 'urgent');

        const criticalContainer = document.getElementById('criticalSymptoms');
        const urgentContainer = document.getElementById('urgentSymptoms');

        criticalContainer.innerHTML = critical.map(s => this.createSymptomCard(s)).join('');
        urgentContainer.innerHTML = urgent.map(s => this.createSymptomCard(s)).join('');

        this.bindCardEvents();
    },

    createSymptomCard(symptom) {
        return `
            <div class="emergency-symptom-card" data-keyword="${symptom.keyword}">
                <div class="symptom-card-header">
                    <span class="symptom-card-icon">${symptom.icon}</span>
                    <span class="symptom-card-name">${symptom.keyword}</span>
                </div>
                <p class="symptom-card-desc">${symptom.description}</p>
                <p class="symptom-card-action">👉 ${symptom.action}</p>
            </div>
        `;
    },

    bindCardEvents() {
        document.querySelectorAll('.emergency-symptom-card').forEach(card => {
            card.addEventListener('click', () => {
                const keyword = card.dataset.keyword;
                this.showEmergencyDetail(keyword);
            });
        });
    },

    searchSymptoms(query) {
        const { emergencySymptoms } = TCM_DATA;
        
        if (!query) {
            this.renderEmergencySymptoms();
            return;
        }

        const filtered = emergencySymptoms.filter(s => 
            s.keyword.includes(query) || 
            s.description.includes(query)
        );

        const critical = filtered.filter(s => s.level === 'critical');
        const urgent = filtered.filter(s => s.level === 'urgent');

        const criticalContainer = document.getElementById('criticalSymptoms');
        const urgentContainer = document.getElementById('urgentSymptoms');

        criticalContainer.innerHTML = critical.length > 0 
            ? critical.map(s => this.createSymptomCard(s)).join('')
            : '<p style="padding: 16px; color: var(--text-light);">暂无匹配的危急症状</p>';
        
        urgentContainer.innerHTML = urgent.length > 0
            ? urgent.map(s => this.createSymptomCard(s)).join('')
            : '<p style="padding: 16px; color: var(--text-light);">暂无匹配的紧急症状</p>';

        this.bindCardEvents();
    },

    showEmergencyDetail(keyword) {
        const symptom = TCM_DATA.emergencySymptoms.find(s => s.keyword === keyword);
        if (!symptom) return;

        const isCritical = symptom.level === 'critical';

        if (window.Modals) {
            Modals.showAlert({
                title: `${symptom.icon} ${symptom.keyword}`,
                content: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 12px;"><strong>症状描述：</strong>${symptom.description}</p>
                        <p style="margin-bottom: 12px; color: ${isCritical ? 'var(--danger-color)' : '#ff9800'}; font-weight: 600;">
                            <strong>处理建议：</strong>${symptom.action}
                        </p>
                        <div style="padding: 16px; background: ${isCritical ? '#ffebee' : '#fff3e0'}; border-radius: 8px; margin-top: 16px;">
                            <p style="margin: 0; color: ${isCritical ? '#c62828' : '#e65100'};">
                                ⚠️ 如遇紧急情况，请立即拨打 <strong>120</strong> 急救电话！
                            </p>
                        </div>
                    </div>
                `,
                confirmText: '我知道了',
                showCancel: false
            });
        }
    }
};
