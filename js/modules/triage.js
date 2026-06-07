const TriageModule = {
    currentStep: 1,
    selectedSymptoms: [],
    symptomDetails: {},
    uploadedImages: [],

    partSymptoms: {
        head: ['头痛', '头晕', '失眠', '耳鸣', '鼻塞', '咽痛', '牙痛', '眼睛干涩'],
        chest: ['咳嗽', '胸闷', '胸痛', '心悸', '胃痛', '胃胀', '恶心', '呕吐'],
        back: ['腰痛', '背痛', '颈椎痛', '肩膀痛'],
        limbs: ['关节痛', '肌肉酸痛', '手脚麻木', '手脚冰凉'],
        skin: ['皮疹', '瘙痒', '痤疮', '湿疹', '荨麻疹'],
        other: ['发热', '乏力', '食欲不振', '便秘', '腹泻', '出汗异常']
    },

    init() {
        this.bindEvents();
        this.renderCommonSymptoms();
    },

    bindEvents() {
        document.getElementById('triageNextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('triagePrevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('triageSubmitBtn').addEventListener('click', () => this.submitTriage());

        document.querySelectorAll('.part-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const part = e.target.dataset.part;
                this.filterByBodyPart(part);
            });
        });

        document.getElementById('symptomSearch').addEventListener('input', (e) => {
            this.searchSymptoms(e.target.value);
        });

        const uploadArea = document.getElementById('triageImageUpload');
        const fileInput = document.getElementById('triageImageInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleImageUpload(e));

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });
    },

    renderCommonSymptoms() {
        const allSymptoms = [...new Set(Object.values(this.partSymptoms).flat())];
        const container = document.getElementById('symptomTags');
        
        container.innerHTML = allSymptoms.map(symptom => `
            <span class="symptom-tag" data-symptom="${symptom}">${symptom}</span>
        `).join('');

        container.querySelectorAll('.symptom-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symptom = tag.dataset.symptom;
                this.toggleSymptom(symptom);
            });
        });
    },

    filterByBodyPart(part) {
        document.querySelectorAll('.part-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.part === part);
        });

        const symptoms = this.partSymptoms[part] || [];
        const container = document.getElementById('symptomTags');
        
        container.innerHTML = symptoms.map(symptom => `
            <span class="symptom-tag ${this.selectedSymptoms.includes(symptom) ? 'selected' : ''}" data-symptom="${symptom}">${symptom}</span>
        `).join('');

        container.querySelectorAll('.symptom-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symptom = tag.dataset.symptom;
                this.toggleSymptom(symptom);
            });
        });
    },

    searchSymptoms(query) {
        const allSymptoms = [...new Set(Object.values(this.partSymptoms).flat())];
        const filtered = query 
            ? allSymptoms.filter(s => s.includes(query))
            : allSymptoms;

        const container = document.getElementById('symptomTags');
        container.innerHTML = filtered.map(symptom => `
            <span class="symptom-tag ${this.selectedSymptoms.includes(symptom) ? 'selected' : ''}" data-symptom="${symptom}">${symptom}</span>
        `).join('');

        container.querySelectorAll('.symptom-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symptom = tag.dataset.symptom;
                this.toggleSymptom(symptom);
            });
        });
    },

    toggleSymptom(symptom) {
        const index = this.selectedSymptoms.indexOf(symptom);
        if (index > -1) {
            this.selectedSymptoms.splice(index, 1);
        } else {
            this.selectedSymptoms.push(symptom);
        }
        this.updateSelectedSymptoms();
        this.updateSymptomTags();
    },

    updateSelectedSymptoms() {
        const container = document.getElementById('selectedSymptomsList');
        const countEl = document.getElementById('selectedCount');
        const nextBtn = document.getElementById('triageNextBtn');

        countEl.textContent = this.selectedSymptoms.length;

        if (this.selectedSymptoms.length === 0) {
            container.innerHTML = '<span class="hint-text">请选择您的症状</span>';
            nextBtn.disabled = true;
        } else {
            container.innerHTML = this.selectedSymptoms.map(symptom => `
                <span class="selected-symptom-tag">
                    ${symptom}
                    <span class="remove-btn" data-symptom="${symptom}">×</span>
                </span>
            `).join('');

            container.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const symptom = btn.dataset.symptom;
                    this.toggleSymptom(symptom);
                });
            });

            nextBtn.disabled = false;
        }
    },

    updateSymptomTags() {
        document.querySelectorAll('.symptom-tag').forEach(tag => {
            const symptom = tag.dataset.symptom;
            tag.classList.toggle('selected', this.selectedSymptoms.includes(symptom));
        });
    },

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepUI();
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    },

    updateStepUI() {
        document.querySelectorAll('.step-item').forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) <= this.currentStep);
        });

        document.querySelectorAll('.triage-step-panel').forEach(panel => {
            panel.classList.toggle('active', parseInt(panel.dataset.panel) === this.currentStep);
        });

        if (this.currentStep === 3) {
            this.showLoading();
            setTimeout(() => {
                this.calculateTriageResult();
            }, 1500);
        }
    },

    showLoading() {
        const container = document.getElementById('triageResult');
        container.innerHTML = `
            <div class="result-loading">
                <div class="loading-spinner"></div>
                <p>正在分析您的症状...</p>
            </div>
        `;
    },

    submitTriage() {
        const duration = document.getElementById('symptomDuration').value;
        const severity = document.querySelector('input[name="severity"]:checked')?.value;
        const description = document.getElementById('symptomDescription').value;

        if (!duration) {
            this.showError('请选择症状持续时间');
            return;
        }
        if (!severity) {
            this.showError('请选择症状严重程度');
            return;
        }

        this.symptomDetails = {
            duration,
            severity,
            description,
            images: this.uploadedImages
        };

        this.nextStep();
    },

    showError(message) {
        if (window.Modals) {
            Modals.showAlert({
                title: '⚠️ 提示',
                content: `<p>${message}</p>`,
                confirmText: '知道了',
                showCancel: false
            });
        } else {
            alert(message);
        }
    },

    calculateTriageResult() {
        const { departments } = TCM_DATA;
        const symptomMap = {};

        departments.forEach(dept => {
            dept.symptoms.forEach(s => {
                if (!symptomMap[s]) symptomMap[s] = [];
                symptomMap[s].push(dept);
            });
        });

        const deptScores = {};
        this.selectedSymptoms.forEach(symptom => {
            const matchedDepts = symptomMap[symptom] || [];
            matchedDepts.forEach(dept => {
                if (!deptScores[dept.id]) {
                    deptScores[dept.id] = { dept, score: 0 };
                }
                deptScores[dept.id].score++;
            });
        });

        const sortedDepts = Object.values(deptScores).sort((a, b) => b.score - a.score);
        const recommendedDept = sortedDepts.length > 0 ? sortedDepts[0].dept : departments[0];

        const riskLevel = this.assessRisk();
        this.renderTriageResult(recommendedDept, sortedDepts, riskLevel);
        this.saveTriageRecord(recommendedDept, riskLevel);
    },

    assessRisk() {
        const { severity } = this.symptomDetails;
        const criticalSymptoms = ['胸痛', '呼吸困难', '昏迷', '大出血', '中风'];
        
        let hasCritical = false;
        this.selectedSymptoms.forEach(s => {
            if (criticalSymptoms.includes(s)) hasCritical = true;
        });

        if (hasCritical || severity === 'severe') {
            return 'high';
        } else if (severity === 'moderate') {
            return 'medium';
        }
        return 'low';
    },

    renderTriageResult(recommendedDept, otherDepts, riskLevel) {
        const container = document.getElementById('triageResult');

        let riskHtml = '';
        if (riskLevel === 'high') {
            riskHtml = `
                <div class="triage-risk">
                    <h5>⚠️ 风险提示</h5>
                    <p>根据您的症状描述，建议您尽快就医。如果症状加重，请立即前往医院急诊科。</p>
                </div>
            `;
        } else if (riskLevel === 'medium') {
            riskHtml = `
                <div class="triage-risk" style="background: #fff8e1; border-left-color: #ffc107;">
                    <h5 style="color: #f57f17;">📋 注意事项</h5>
                    <p style="color: #f57f17;">您的症状需要关注，建议在1-3天内就医检查。</p>
                </div>
            `;
        }

        const suggestions = this.generateSuggestions(recommendedDept, riskLevel);

        container.innerHTML = `
            <div class="triage-result-card">
                <h3>分诊结果</h3>
                
                ${riskHtml}

                <div class="recommended-dept">
                    <span class="dept-big-icon">${recommendedDept.icon}</span>
                    <div>
                        <h4>推荐就诊科室：${recommendedDept.name}</h4>
                        <p>根据您选择的症状，建议优先到${recommendedDept.name}就诊</p>
                    </div>
                </div>

                <div class="triage-suggestions">
                    <h4>💡 就医建议</h4>
                    <ul>
                        ${suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>

                <div class="triage-suggestions">
                    <h4>📋 您的症状</h4>
                    <div class="result-features">
                        ${this.selectedSymptoms.map(s => `<span class="result-feature-tag">${s}</span>`).join('')}
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 16px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p style="font-size: 12px; color: #f57f17; margin: 0; line-height: 1.6;">
                        ⚠️ <strong>免责声明：</strong>本系统的分诊建议仅作为参考，不能替代专业医师的诊断。如有身体不适，请及时前往正规医疗机构就诊。紧急情况请直接拨打120急救电话。
                    </p>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" onclick="TriageModule.resetTriage()">重新分诊</button>
                    <button class="btn btn-secondary" style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color);" onclick="window.Modals.openAppointmentModal()">预约挂号</button>
                </div>
            </div>
        `;
    },

    generateSuggestions(dept, riskLevel) {
        const suggestions = [];
        
        suggestions.push(`建议前往${dept.name}进行详细检查和诊断`);
        
        if (riskLevel === 'high') {
            suggestions.push('请尽快就医，最好有家人陪同');
            suggestions.push('就诊时请携带好相关检查资料');
        } else {
            suggestions.push('就诊前可以提前预约挂号，减少等待时间');
        }
        
        suggestions.push('注意观察症状变化，如有加重要及时就医');
        suggestions.push('保持良好的作息和饮食习惯，避免加重症状');

        return suggestions;
    },

    saveTriageRecord(dept, riskLevel) {
        const records = Storage.get('triageRecords', []);
        const record = {
            id: Utils.generateId(),
            symptoms: [...this.selectedSymptoms],
            details: { ...this.symptomDetails },
            recommendedDept: dept.name,
            riskLevel,
            createdAt: Date.now()
        };
        records.unshift(record);
        Storage.set('triageRecords', records);

        if (window.Session) {
            Session.setTriageRecordId(record.id);
        }

        if (window.RecordsModule) {
            RecordsModule.updateStats();
        }

        if (window.ChatModule && Session.getCurrentSession()?.conversationId) {
            setTimeout(() => {
                ChatModule.notifyTriageComplete(record.id);
            }, 1500);
        }
    },

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleImageFile(file);
        }
    },

    handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.uploadedImages.push(imageData);
            this.renderUploadedImages();
        };
        reader.readAsDataURL(file);
    },

    renderUploadedImages() {
        const container = document.getElementById('triageUploadedImages');
        container.innerHTML = this.uploadedImages.map((img, index) => `
            <div class="uploaded-image">
                <img src="${img}" alt="上传图片${index + 1}">
                <button class="remove-image" onclick="TriageModule.removeImage(${index})">×</button>
            </div>
        `).join('');
    },

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.renderUploadedImages();
    },

    resetTriage() {
        this.currentStep = 1;
        this.selectedSymptoms = [];
        this.symptomDetails = {};
        this.uploadedImages = [];

        document.getElementById('symptomSearch').value = '';
        document.getElementById('symptomDuration').value = '';
        document.querySelectorAll('input[name="severity"]').forEach(r => r.checked = false);
        document.getElementById('symptomDescription').value = '';
        document.getElementById('triageUploadedImages').innerHTML = '';

        document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));

        this.updateSelectedSymptoms();
        this.updateStepUI();
        this.renderCommonSymptoms();
    }
};
