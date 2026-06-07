const Modals = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('recordBtn').addEventListener('click', () => this.openRecordsModal());
        document.getElementById('notificationBtn').addEventListener('click', () => this.openNotificationModal());
        document.getElementById('makeAppointmentBtn').addEventListener('click', () => this.openAppointmentModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
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
        const records = RecordsModule.getAllRecords();
        const stats = RecordsModule.getStats();

        let recordsHtml = '';
        if (records.length === 0) {
            recordsHtml = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">暂无健康记录</div>
                </div>
            `;
        } else {
            recordsHtml = `
                <div class="records-list">
                    ${records.slice(0, 10).map(r => `
                        <div class="record-item" onclick="Modals.viewRecordDetail('${r.id}', '${r.type}')">
                            <div class="record-header">
                                <span class="record-type">${r.typeName} ${r.type === 'triage' ? ` - ${r.recommendedDept}` : ` - ${r.result}`}</span>
                                <span class="record-time">${Utils.formatTime(r.createdAt)}</span>
                            </div>
                            <div class="record-preview">
                                ${r.type === 'triage' ? r.symptoms.join('、') : r.result}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const content = `
            <div class="modal-header">
                <h3>我的健康记录</h3>
                <button class="modal-close" onclick="Modals.closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="stats-dashboard">
                    <div class="stat-card">
                        <div class="stat-card-icon">💬</div>
                        <div class="stat-card-value">${stats.totalConversations}</div>
                        <div class="stat-card-label">对话次数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">🏥</div>
                        <div class="stat-card-value">${stats.totalTriages}</div>
                        <div class="stat-card-label">分诊记录</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">🧬</div>
                        <div class="stat-card-value">${stats.totalConstitutions}</div>
                        <div class="stat-card-label">体质测试</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">📅</div>
                        <div class="stat-card-value">${stats.totalAppointments}</div>
                        <div class="stat-card-label">预约记录</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 16px; color: var(--text-primary);">📋 最近记录</h4>
                ${recordsHtml}
            </div>
        `;

        this.openModal(content);
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
