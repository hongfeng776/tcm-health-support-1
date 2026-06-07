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

    getSessionTimeline(sessionId) {
        const allSessions = Storage.get('allSessions', []);
        const session = allSessions.find(s => s.id === sessionId);
        if (!session) return [];

        const timeline = [];

        if (session.conversationId) {
            const conversations = Storage.get('conversations', []);
            const conv = conversations.find(c => c.id === session.conversationId);
            if (conv) {
                timeline.push({
                    type: 'conversation',
                    typeName: '健康咨询',
                    icon: '💬',
                    time: conv.createdAt,
                    data: conv
                });
            }
        }

        if (session.triageRecordId) {
            const triages = Storage.get('triageRecords', []);
            const triage = triages.find(t => t.id === session.triageRecordId);
            if (triage) {
                timeline.push({
                    type: 'triage',
                    typeName: '症状分诊',
                    icon: '🏥',
                    time: triage.createdAt,
                    data: triage
                });
            }
        }

        if (session.constitutionRecordId) {
            const constitutions = Storage.get('constitutionRecords', []);
            const constitution = constitutions.find(c => c.id === session.constitutionRecordId);
            if (constitution) {
                timeline.push({
                    type: 'constitution',
                    typeName: '体质辨识',
                    icon: '🧬',
                    time: constitution.createdAt,
                    data: constitution
                });
            }
        }

        return timeline.sort((a, b) => new Date(a.time) - new Date(b.time));
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
