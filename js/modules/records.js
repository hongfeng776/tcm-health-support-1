const RecordsModule = {
    init() {
        this.updateStats();
    },

    updateStats() {
        const triageRecords = Storage.get('triageRecords', []);
        const constitutionRecords = Storage.get('constitutionRecords', []);
        const conversations = Storage.get('conversations', []);

        const recordCount = triageRecords.length + constitutionRecords.length;
        const constitutionCount = constitutionRecords.length;

        const recordEl = document.getElementById('recordCount');
        const constitutionEl = document.getElementById('constitutionDone');

        if (recordEl) recordEl.textContent = recordCount;
        if (constitutionEl) constitutionEl.textContent = constitutionCount;
    },

    getAllRecords() {
        const triageRecords = Storage.get('triageRecords', []).map(r => ({
            ...r,
            type: 'triage',
            typeName: '症状分诊'
        }));
        
        const constitutionRecords = Storage.get('constitutionRecords', []).map(r => ({
            ...r,
            type: 'constitution',
            typeName: '体质辨识'
        }));

        const allRecords = [...triageRecords, ...constitutionRecords].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return allRecords;
    },

    getStats() {
        const conversations = Storage.get('conversations', []);
        const triageRecords = Storage.get('triageRecords', []);
        const constitutionRecords = Storage.get('constitutionRecords', []);
        const appointments = Storage.get('appointments', []);

        const totalChats = conversations.reduce((sum, c) => sum + c.messages.filter(m => m.role === 'user').length, 0);
        
        const deptStats = {};
        triageRecords.forEach(r => {
            const dept = r.recommendedDept || '其他';
            deptStats[dept] = (deptStats[dept] || 0) + 1;
        });

        const constitutionStats = {};
        constitutionRecords.forEach(r => {
            const type = r.result || '未知';
            constitutionStats[type] = (constitutionStats[type] || 0) + 1;
        });

        return {
            totalConversations: conversations.length,
            totalChats,
            totalTriages: triageRecords.length,
            totalConstitutions: constitutionRecords.length,
            totalAppointments: appointments.length,
            deptStats,
            constitutionStats
        };
    }
};
