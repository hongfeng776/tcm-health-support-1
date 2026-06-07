const Modals = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const recordBtn = document.getElementById('recordBtn');
        if (recordBtn) recordBtn.addEventListener('click', () => this.openRecordsModal());
        
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) notificationBtn.addEventListener('click', () => this.openNotificationModal());
        
        const appointmentBtn = document.getElementById('makeAppointmentBtn');
        if (appointmentBtn) appointmentBtn.addEventListener('click', () => this.openAppointmentModal());
        
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.closeModal();
            }
        });
    },

    openModal(content) {
        const overlay = document.getElementById('modalOverlay');
        overlay.innerHTML = `
            <div class="modal">
                ${content}
            </div>
        `;
        overlay.classList.add('active');
    },

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        overlay.innerHTML = '';
    },

    showAlert(options) {
        const { title, content, confirmText = '确定', cancelText = '取消', showCancel = true, onConfirm } = options;
        
        const modalContent = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="Modals.closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${showCancel ? `<button class="btn btn-secondary" style="background: var(--bg-color); color: var(--text-secondary); border: 1px solid var(--border-color);" onclick="Modals.closeModal()">${cancelText}</button>` : ''}
                <button class="btn btn-primary" onclick="Modals.handleConfirm()">${confirmText}</button>
            </div>
        `;

        this._onConfirm = onConfirm;
        this.openModal(modalContent);
    },

    handleConfirm() {
        if (this._onConfirm) {
            this._onConfirm();
        }
        this.closeModal();
    },

    openRecordsModal() {
        const content = `
            <div class="modal-header">
                <h3>📋 健康记录管理</h3>
                <button class="modal-close" onclick="Modals.closeModal()">×</button>
            </div>
            <div class="modal-body" style="padding: 0; max-height: 75vh;">
                <div class="records-dashboard">
                    <div class="records-stats-bar">
                        <div class="stat-card-mini" onclick="Store.setFilter('all')">
                            <div class="stat-value" id="statAllCount">0</div>
                            <div class="stat-label">全部记录</div>
                        </div>
                        <div class="stat-card-mini" onclick="Store.setFilter('triage')">
                            <div class="stat-value" id="statTriageCount">0</div>
                            <div class="stat-label">分诊记录</div>
                        </div>
                        <div class="stat-card-mini" onclick="Store.setFilter('constitution')">
                            <div class="stat-value" id="statConstitutionCount">0</div>
                            <div class="stat-label">体质测试</div>
                        </div>
                        <div class="stat-card-mini" style="cursor: default;">
                            <div class="stat-value" id="statSelectedLabel">-</div>
                            <div class="stat-label">当前选择</div>
                        </div>
                    </div>

                    <div class="records-three-col">
                        <div class="records-col records-col-list">
                            <div class="col-header">
                                <span>记录列表</span>
                                <span class="col-count" id="listCount">0 条</span>
                            </div>
                            <div class="records-list-scroll" id="recordsListContainer">
                                <div class="empty-state small">
                                    <div class="empty-state-icon">📋</div>
                                    <div class="empty-state-text">暂无记录</div>
                                </div>
                            </div>
                        </div>

                        <div class="records-col records-col-detail">
                            <div class="col-header">
                                <span>详情信息</span>
                            </div>
                            <div class="records-detail-scroll" id="recordsDetailContainer">
                                <div class="empty-state small">
                                    <div class="empty-state-icon">👈</div>
                                    <div class="empty-state-text">请从左侧选择一条记录</div>
                                </div>
                            </div>
                        </div>

                        <div class="records-col records-col-edit">
                            <div class="col-header">
                                <span>编辑 / 统计</span>
                            </div>
                            <div class="records-edit-scroll" id="recordsEditContainer">
                                <div class="empty-state small">
                                    <div class="empty-state-icon">✏️</div>
                                    <div class="empty-state-text">选择记录后可编辑</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.openModal(content);
        this.bindRecordsDashboard();
        this.refreshRecordsDashboard();
        Store.subscribe(() => this.refreshRecordsDashboard());
    },

    bindRecordsDashboard() {
    },

    refreshRecordsDashboard() {
        const { stats, filter, selectedRecordId } = Store.state;

        const statAllCount = document.getElementById('statAllCount');
        const statTriageCount = document.getElementById('statTriageCount');
        const statConstitutionCount = document.getElementById('statConstitutionCount');
        const statSelectedLabel = document.getElementById('statSelectedLabel');

        if (statAllCount) statAllCount.textContent = stats.totalTriages + stats.totalConstitutions;
        if (statTriageCount) statTriageCount.textContent = stats.totalTriages;
        if (statConstitutionCount) statConstitutionCount.textContent = stats.totalConstitutions;
        if (statSelectedLabel) {
            statSelectedLabel.textContent = selectedRecordId ? '已选择' : '未选择';
            statSelectedLabel.style.color = selectedRecordId ? 'var(--primary-color)' : 'var(--text-light)';
        }

        document.querySelectorAll('.stat-card-mini').forEach((card, idx) => {
            const filters = ['all', 'triage', 'constitution', ''];
            if (filters[idx] === filter) {
                card.style.borderColor = 'var(--primary-color)';
                card.style.background = 'rgba(76, 175, 80, 0.08)';
            } else if (filters[idx]) {
                card.style.borderColor = 'var(--border-color)';
                card.style.background = 'white';
            }
        });

        this.renderRecordsList();
        this.renderRecordsDetail();
        this.renderRecordsEdit();
    },

    renderRecordsList() {
        const container = document.getElementById('recordsListContainer');
        const listCount = document.getElementById('listCount');
        if (!container) return;

        const records = Store.getFilteredRecords();
        
        if (listCount) listCount.textContent = `${records.length} 条`;

        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">暂无记录</div>
                </div>
            `;
            return;
        }

        const { selectedRecordId } = Store.state;

        container.innerHTML = records.map(r => `
            <div class="record-item-compact ${selectedRecordId === r.id ? 'selected' : ''}" 
                 onclick="Store.selectRecord('${r.id}', '${r.type}')">
                <div class="record-compact-icon">
                    ${r.type === 'triage' ? '🏥' : '🧬'}
                </div>
                <div class="record-compact-content">
                    <div class="record-compact-title">
                        ${r.type === 'triage' ? r.recommendedDept : r.result}
                    </div>
                    <div class="record-compact-sub">
                        ${r.type === 'triage' ? r.symptoms.slice(0,2).join('、') : r.typeName}
                    </div>
                    <div class="record-compact-time">${Utils.formatTime(r.createdAt)}</div>
                </div>
            </div>
        `).join('');
    },

    renderRecordsDetail() {
        const container = document.getElementById('recordsDetailContainer');
        if (!container) return;

        const record = Store.getFullRecord();
        const selected = Store.getSelectedRecord();

        if (!record || !selected) {
            container.innerHTML = `
                <div class="empty-state small">
                    <div class="empty-state-icon">�</div>
                    <div class="empty-state-text">请从左侧选择一条记录</div>
                </div>
            `;
            return;
        }

        if (selected.type === 'triage') {
            const riskColors = {
                high: 'var(--danger-color)',
                medium: '#ff9800',
                low: 'var(--success-color)'
            };
            const riskLabels = {
                high: '高风险',
                medium: '中风险',
                low: '低风险'
            };

            container.innerHTML = `
                <div class="detail-section">
                    <div class="detail-badge badge-${record.riskLevel || 'low'}">
                        ${riskLabels[record.riskLevel || 'low']}
                    </div>
                    <h4 class="detail-title">🏥 分诊记录</h4>
                    
                    <div class="detail-group">
                        <div class="detail-label">症状表现</div>
                        <div class="detail-tags">
                            ${record.symptoms.map(s => `<span class="detail-tag">${s}</span>`).join('')}
                        </div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">推荐科室</div>
                        <div class="detail-value primary">${record.recommendedDept || '-'}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-group">
                            <div class="detail-label">持续时间</div>
                            <div class="detail-value">${record.details?.duration || '-'}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">严重程度</div>
                            <div class="detail-value">${record.details?.severity || '-'}</div>
                        </div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">详细描述</div>
                        <div class="detail-value text">${record.details?.description || '无'}</div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">就医建议</div>
                        <div class="detail-value text">${record.suggestion || '-'}</div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">记录时间</div>
                        <div class="detail-value">${Utils.formatDate(record.createdAt)}</div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="detail-section">
                    <div class="detail-badge badge-constitution">
                        ${record.result}
                    </div>
                    <h4 class="detail-title">🧬 体质辨识记录</h4>

                    <div class="detail-group">
                        <div class="detail-label">体质类型</div>
                        <div class="detail-value primary">${record.result || '-'}</div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">各体质得分</div>
                        <div class="score-list">
                            ${record.allScores?.map(s => `
                                <div class="score-item">
                                    <span class="score-name">${s.name}</span>
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${s.score}%"></div>
                                    </div>
                                    <span class="score-num">${Math.round(s.score)}%</span>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">调理建议</div>
                        <div class="detail-value text">${record.suggestion || '-'}</div>
                    </div>

                    <div class="detail-group">
                        <div class="detail-label">测试时间</div>
                        <div class="detail-value">${Utils.formatDate(record.createdAt)}</div>
                    </div>
                </div>
            `;
        }
    },

    renderRecordsEdit() {
        const container = document.getElementById('recordsEditContainer');
        if (!container) return;

        const record = Store.getFullRecord();
        const selected = Store.getSelectedRecord();

        if (!record || !selected) {
            container.innerHTML = `
                <div class="empty-state small">
                    <div class="empty-state-icon">✏️</div>
                    <div class="empty-state-text">选择记录后可编辑</div>
                </div>
            `;
            return;
        }

        if (selected.type === 'triage') {
            container.innerHTML = `
                <div class="edit-section">
                    <h4 class="edit-title">编辑分诊记录</h4>
                    
                    <div class="form-group">
                        <label>推荐科室</label>
                        <input type="text" id="editDept" value="${record.recommendedDept || ''}" placeholder="请输入科室">
                    </div>

                    <div class="form-group">
                        <label>风险等级</label>
                        <select id="editRisk">
                            <option value="low" ${record.riskLevel === 'low' ? 'selected' : ''}>低风险</option>
                            <option value="medium" ${record.riskLevel === 'medium' ? 'selected' : ''}>中风险</option>
                            <option value="high" ${record.riskLevel === 'high' ? 'selected' : ''}>高风险</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>就医建议</label>
                        <textarea id="editSuggestion" rows="3" placeholder="请输入建议">${record.suggestion || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label>备注说明</label>
                        <textarea id="editDescription" rows="2" placeholder="请输入备注">${record.details?.description || ''}</textarea>
                    </div>

                    <div class="edit-actions">
                        <button class="btn btn-primary btn-block" onclick="Modals.saveRecordEdit()">
                            💾 保存修改
                        </button>
                        <button class="btn btn-danger btn-block" onclick="Modals.deleteSelectedRecord()">
                            �️ 删除记录
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="edit-section">
                    <h4 class="edit-title">编辑体质记录</h4>
                    
                    <div class="form-group">
                        <label>体质类型</label>
                        <select id="editConstitution">
                            ${TCM_DATA.constitutionTypes.map(c => `
                                <option value="${c.name}" ${record.result === c.name ? 'selected' : ''}>${c.name}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>调理建议</label>
                        <textarea id="editConstitutionSuggestion" rows="4" placeholder="请输入调理建议">${record.suggestion || ''}</textarea>
                    </div>

                    <div class="edit-actions">
                        <button class="btn btn-primary btn-block" onclick="Modals.saveRecordEdit()">
                            💾 保存修改
                        </button>
                        <button class="btn btn-danger btn-block" onclick="Modals.deleteSelectedRecord()">
                            🗑️ 删除记录
                        </button>
                    </div>
                </div>
            `;
        }
    },

    saveRecordEdit() {
        const { selectedRecordId, selectedRecordType } = Store.state;
        if (!selectedRecordId || !selectedRecordType) return;

        if (selectedRecordType === 'triage') {
            const dept = document.getElementById('editDept')?.value || '';
            const risk = document.getElementById('editRisk')?.value || 'low';
            const suggestion = document.getElementById('editSuggestion')?.value || '';
            const description = document.getElementById('editDescription')?.value || '';

            const record = Store.getFullRecord();
            const updates = {
                recommendedDept: dept,
                riskLevel: risk,
                suggestion: suggestion,
                details: {
                    ...record.details,
                    description: description
                }
            };

            Store.updateRecord('triage', selectedRecordId, updates);
            Modals.showToast('✅ 分诊记录已更新');
        } else {
            const constitution = document.getElementById('editConstitution')?.value || '';
            const suggestion = document.getElementById('editConstitutionSuggestion')?.value || '';

            Store.updateRecord('constitution', selectedRecordId, {
                result: constitution,
                suggestion: suggestion
            });
            Modals.showToast('✅ 体质记录已更新');
        }
    },

    deleteSelectedRecord() {
        const { selectedRecordId, selectedRecordType } = Store.state;
        if (!selectedRecordId || !selectedRecordType) return;

        Modals.showAlert({
            title: '⚠️ 确认删除',
            content: '<p>确定要删除这条记录吗？删除后无法恢复。</p>',
            confirmText: '确认删除',
            cancelText: '取消',
            onConfirm: () => {
                Store.deleteRecord(selectedRecordType, selectedRecordId);
                Modals.showToast('🗑️ 记录已删除');
            }
        });
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--success-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    getTimelinePreview(item) {
        switch (item.type) {
            case 'conversation':
                const msgCount = item.data.messages.filter((m) => m.role === 'user').length;
                return `已咨询 ${msgCount} 个问题`;
            case 'triage':
                return `症状：${item.data.symptoms.slice(0, 3).join('、')}${item.data.symptoms.length > 3 ? '...' : ''} → ${item.data.recommendedDept}`;
            case 'constitution':
                return `体质类型：${item.data.result}`;
            default:
                return '';
        }
    },

    viewRecordDetail(id, type) {
        let record = null;
        if (type === 'triage') {
            const records = Storage.get('triageRecords', []);
            record = records.find(r => r.id === id);
        } else if (type === 'constitution') {
            const records = Storage.get('constitutionRecords', []);
            record = records.find(r => r.id === id);
        }

        if (!record) return;

        let detailHtml = '';
        if (type === 'triage') {
            detailHtml = `
                <div>
                    <p style="margin-bottom: 12px;"><strong>症状：</strong>${record.symptoms.join('、')}</p>
                    <p style="margin-bottom: 12px;"><strong>推荐科室：</strong>${record.recommendedDept}</p>
                    <p style="margin-bottom: 12px;"><strong>风险等级：</strong>
                        <span style="color: ${record.riskLevel === 'high' ? 'var(--danger-color)' : record.riskLevel === 'medium' ? '#ff9800' : 'var(--success-color)'}">
                            ${record.riskLevel === 'high' ? '高风险' : record.riskLevel === 'medium' ? '中风险' : '低风险'}
                        </span>
                    </p>
                    <p style="margin-bottom: 12px;"><strong>症状描述：</strong>${record.details.description || '无'}</p>
                    <p><strong>记录时间：</strong>${Utils.formatDate(record.createdAt)}</p>
                </div>
            `;
        } else {
            detailHtml = `
                <div>
                    <p style="margin-bottom: 12px;"><strong>体质类型：</strong>${record.result}</p>
                    <p style="margin-bottom: 12px;"><strong>各体质得分：</strong></p>
                    <div style="margin-bottom: 12px;">
                        ${record.allScores.map(s => `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span style="width: 60px; font-size: 12px;">${s.name}</span>
                                <div style="flex: 1; height: 6px; background: var(--bg-color); border-radius: 3px;">
                                    <div style="height: 100%; width: ${s.score}%; background: var(--primary-color); border-radius: 3px;"></div>
                                </div>
                                <span style="width: 40px; font-size: 12px; text-align: right;">${Math.round(s.score)}%</span>
                            </div>
                        `).join('')}
                    </div>
                    <p><strong>测试时间：</strong>${Utils.formatDate(record.createdAt)}</p>
                </div>
            `;
        }

        this.showAlert({
            title: type === 'triage' ? '分诊记录详情' : '体质测试详情',
            content: detailHtml,
            confirmText: '关闭',
            showCancel: false
        });
    },

    openNotificationModal() {
        const notifications = Storage.get('notifications', []);
        
        let notificationsHtml = '';
        if (notifications.length === 0) {
            const defaultNotifications = [
                { id: 1, title: '欢迎使用AI中医助手', desc: '您可以开始健康咨询、症状分诊或体质测试', time: Date.now(), unread: true },
                { id: 2, title: '温馨提示', desc: '春季养生重在养肝，宜早睡早起，适当运动', time: Date.now() - 86400000, unread: true }
            ];
            Storage.set('notifications', defaultNotifications);
            notifications.push(...defaultNotifications);
        }

        notifications.forEach(n => n.unread = false);
        Storage.set('notifications', notifications);

        notificationsHtml = `
            <div class="notification-list">
                ${notifications.map(n => `
                    <div class="notification-item">
                        <div class="notification-title">${n.title}</div>
                        <div class="notification-desc">${n.desc}</div>
                        <div class="notification-time">${Utils.formatTime(n.time)}</div>
                    </div>
                `).join('')}
            </div>
        `;

        if (window.App) {
            App.updateNotificationBadge();
        }

        const content = `
            <div class="modal-header">
                <h3>消息通知</h3>
                <button class="modal-close" onclick="Modals.closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${notificationsHtml}
            </div>
        `;

        this.openModal(content);
    },

    openAppointmentModal() {
        const { doctors, departments } = TCM_DATA;

        const content = `
            <div class="modal-header">
                <h3>预约挂号</h3>
                <button class="modal-close" onclick="Modals.closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>选择科室</label>
                    <select class="form-control" id="apptDept">
                        <option value="">请选择科室</option>
                        ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>选择医师</label>
                    <select class="form-control" id="apptDoctor">
                        <option value="">请先选择科室</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>预约日期</label>
                    <input type="date" class="form-control" id="apptDate" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>联系人</label>
                    <input type="text" class="form-control" id="apptName" placeholder="请输入姓名">
                </div>
                <div class="form-group">
                    <label>联系电话</label>
                    <input type="tel" class="form-control" id="apptPhone" placeholder="请输入手机号">
                </div>
                <div class="form-group">
                    <label>症状描述</label>
                    <textarea class="form-control" rows="3" id="apptDesc" placeholder="请简要描述您的症状..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" style="background: var(--bg-color); color: var(--text-secondary); border: 1px solid var(--border-color);" onclick="Modals.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="Modals.submitAppointment()">提交预约</button>
            </div>
        `;

        this.openModal(content);

        setTimeout(() => {
            document.getElementById('apptDept').addEventListener('change', (e) => {
                const deptId = e.target.value;
                const dept = departments.find(d => d.id === deptId);
                const doctorSelect = document.getElementById('apptDoctor');
                
                if (dept) {
                    const deptDoctors = doctors.filter(d => d.department === dept.name);
                    doctorSelect.innerHTML = deptDoctors.length > 0
                        ? deptDoctors.map(d => `<option value="${d.id}" ${!d.available ? 'disabled' : ''}>${d.name} - ${d.title} ${!d.available ? '(停诊)' : ''}</option>`).join('')
                        : '<option value="">该科室暂无可预约医师</option>';
                } else {
                    doctorSelect.innerHTML = '<option value="">请先选择科室</option>';
                }
            });
        }, 100);
    },

    submitAppointment() {
        const dept = document.getElementById('apptDept').value;
        const doctor = document.getElementById('apptDoctor').value;
        const date = document.getElementById('apptDate').value;
        const name = document.getElementById('apptName').value;
        const phone = document.getElementById('apptPhone').value;
        const desc = document.getElementById('apptDesc').value;

        if (!dept || !doctor || !date || !name || !phone) {
            this.showAlert({
                title: '⚠️ 提示',
                content: '<p>请填写完整的预约信息</p>',
                confirmText: '知道了',
                showCancel: false
            });
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            this.showAlert({
                title: '⚠️ 提示',
                content: '<p>请输入正确的手机号码</p>',
                confirmText: '知道了',
                showCancel: false
            });
            return;
        }

        const appointment = {
            id: Utils.generateId(),
            deptId: dept,
            doctorId: doctor,
            date,
            name,
            phone,
            desc,
            status: 'pending',
            createdAt: Date.now()
        };

        const appointments = Storage.get('appointments', []);
        appointments.unshift(appointment);
        Storage.set('appointments', appointments);

        this.closeModal();

        this.showAlert({
            title: '预约成功',
            content: `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                    <p style="margin-bottom: 8px;"><strong>预约提交成功！</strong></p>
                    <p style="color: var(--text-secondary);">我们将尽快与您联系确认预约详情</p>
                </div>
            `,
            confirmText: '好的',
            showCancel: false
        });

        if (window.RecordsModule) {
            RecordsModule.updateStats();
        }
    }
};
