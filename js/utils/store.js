const Store = {
    state: {
        selectedRecordId: null,
        selectedRecordType: null,
        records: [],
        stats: {},
        filter: 'all'
    },

    listeners: [],

    init() {
        this.refreshData();
    },

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },

    notify() {
        this.listeners.forEach(callback => callback(this.state));
    },

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    },

    refreshData() {
        const records = RecordsModule.getAllRecords();
        const stats = RecordsModule.getStats();
        this.setState({
            records,
            stats
        });
    },

    selectRecord(id, type) {
        this.setState({
            selectedRecordId: id,
            selectedRecordType: type
        });
    },

    clearSelection() {
        this.setState({
            selectedRecordId: null,
            selectedRecordType: null
        });
    },

    setFilter(filter) {
        this.setState({ filter });
    },

    getFilteredRecords() {
        const { records, filter } = this.state;
        if (filter === 'all') return records;
        return records.filter(r => r.type === filter);
    },

    getSelectedRecord() {
        const { selectedRecordId, selectedRecordType, records } = this.state;
        if (!selectedRecordId || !selectedRecordType) return null;
        return records.find(r => r.id === selectedRecordId && r.type === selectedRecordType) || null;
    },

    getFullRecord() {
        const { selectedRecordId, selectedRecordType } = this.state;
        if (!selectedRecordId || !selectedRecordType) return null;

        if (selectedRecordType === 'triage') {
            const triages = Storage.get('triageRecords', []);
            return triages.find(t => t.id === selectedRecordId) || null;
        } else if (selectedRecordType === 'constitution') {
            const constitutions = Storage.get('constitutionRecords', []);
            return constitutions.find(c => c.id === selectedRecordId) || null;
        }
        return null;
    },

    updateRecord(type, id, updates) {
        if (type === 'triage') {
            const records = Storage.get('triageRecords', []);
            const idx = records.findIndex(r => r.id === id);
            if (idx !== -1) {
                records[idx] = { ...records[idx], ...updates, updatedAt: Date.now() };
                Storage.set('triageRecords', records);
            }
        } else if (type === 'constitution') {
            const records = Storage.get('constitutionRecords', []);
            const idx = records.findIndex(r => r.id === id);
            if (idx !== -1) {
                records[idx] = { ...records[idx], ...updates, updatedAt: Date.now() };
                Storage.set('constitutionRecords', records);
            }
        }
        this.refreshData();
    },

    deleteRecord(type, id) {
        if (type === 'triage') {
            const records = Storage.get('triageRecords', []);
            const filtered = records.filter(r => r.id !== id);
            Storage.set('triageRecords', filtered);
        } else if (type === 'constitution') {
            const records = Storage.get('constitutionRecords', []);
            const filtered = records.filter(r => r.id !== id);
            Storage.set('constitutionRecords', filtered);
        }
        
        if (this.state.selectedRecordId === id) {
            this.clearSelection();
        }
        this.refreshData();
    }
};
