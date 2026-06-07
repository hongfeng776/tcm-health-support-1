const Session = {
    currentSessionId: null,

    init() {
        let session = Storage.get('currentSession', null);
        if (!session) {
            session = this.createNewSession();
        }
        this.currentSessionId = session.id;
        return session;
    },

    createNewSession() {
        const session = {
            id: Utils.generateId(),
            startTime: Date.now(),
            lastActiveTime: Date.now(),
            conversationId: null,
            triageRecordId: null,
            constitutionRecordId: null,
            status: 'active'
        };
        Storage.set('currentSession', session);
        this.currentSessionId = session.id;
        
        const allSessions = Storage.get('allSessions', []);
        allSessions.unshift(session);
        Storage.set('allSessions', allSessions);
        
        return session;
    },

    getCurrentSession() {
        return Storage.get('currentSession', null);
    },

    updateSession(updates) {
        const session = this.getCurrentSession();
        if (session) {
            Object.assign(session, updates);
            session.lastActiveTime = Date.now();
            Storage.set('currentSession', session);
            
            const allSessions = Storage.get('allSessions', []);
            const idx = allSessions.findIndex(s => s.id === session.id);
            if (idx > -1) {
                allSessions[idx] = session;
                Storage.set('allSessions', allSessions);
            }
        }
    },

    setConversationId(id) {
        this.updateSession({ conversationId: id });
    },

    setTriageRecordId(id) {
        this.updateSession({ triageRecordId: id });
    },

    setConstitutionRecordId(id) {
        this.updateSession({ constitutionRecordId: id });
    },

    getLinkedRecords() {
        const session = this.getCurrentSession();
        if (!session) return {};

        const records = {};
        
        if (session.conversationId) {
            const conversations = Storage.get('conversations', []);
            records.conversation = conversations.find(c => c.id === session.conversationId);
        }
        
        if (session.triageRecordId) {
            const triages = Storage.get('triageRecords', []);
            records.triage = triages.find(t => t.id === session.triageRecordId);
        }
        
        if (session.constitutionRecordId) {
            const constitutions = Storage.get('constitutionRecords', []);
            records.constitution = constitutions.find(c => c.id === session.constitutionRecordId);
        }

        return records;
    },

    getAllSessions() {
        return Storage.get('allSessions', []);
    },

    resetSession() {
        const session = this.createNewSession();
        return session;
    }
};
