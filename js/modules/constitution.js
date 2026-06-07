const ConstitutionModule = {
    currentQuestionIndex: 0,
    answers: {},
    result: null,

    init() {
        this.bindEvents();
        this.renderCurrentQuestion();
        this.updateProgress();
    },

    bindEvents() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
    },

    renderCurrentQuestion() {
        const questions = TCM_DATA.constitutionQuestions;
        const question = questions[this.currentQuestionIndex];
        const container = document.getElementById('questionCard');

        container.innerHTML = `
            <div class="question-text">${this.currentQuestionIndex + 1}. ${question.text}</div>
            <div class="option-list">
                ${question.options.map((option, idx) => `
                    <div class="option-item ${this.answers[question.id] === option.value ? 'selected' : ''}" 
                         data-value="${option.value}"
                         onclick="ConstitutionModule.selectAnswer(${question.id}, ${option.value})">
                        <div class="option-radio"></div>
                        <span class="option-text">${option.label}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('totalQuestionNum').textContent = questions.length;
        document.getElementById('currentQuestionNum').textContent = this.currentQuestionIndex + 1;
    },

    selectAnswer(questionId, value) {
        this.answers[questionId] = value;
        this.renderCurrentQuestion();
        
        setTimeout(() => {
            if (this.currentQuestionIndex < TCM_DATA.constitutionQuestions.length - 1) {
                this.nextQuestion();
            }
        }, 300);
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

    nextQuestion() {
        const questions = TCM_DATA.constitutionQuestions;
        const currentQ = questions[this.currentQuestionIndex];

        if (!this.answers[currentQ.id] && this.currentQuestionIndex < questions.length - 1) {
            this.showError('请选择一个选项');
            return;
        }

        if (this.currentQuestionIndex < questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavButtons();
        } else {
            if (!this.answers[currentQ.id]) {
                this.showError('请选择一个选项');
                return;
            }
            this.calculateResult();
        }
    },

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavButtons();
        }
    },

    updateProgress() {
        const questions = TCM_DATA.constitutionQuestions;
        const progress = ((this.currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('quizProgressFill').style.width = `${progress}%`;
    },

    updateNavButtons() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === TCM_DATA.constitutionQuestions.length - 1) {
            nextBtn.textContent = '查看结果';
        } else {
            nextBtn.textContent = '下一题';
        }
    },

    calculateResult() {
        const questions = TCM_DATA.constitutionQuestions;
        const constitutions = JSON.parse(JSON.stringify(TCM_DATA.constitutions));

        constitutions.forEach(c => c.score = 0);

        questions.forEach(q => {
            const answerValue = this.answers[q.id] || 3;
            const constitution = constitutions.find(c => c.id === q.constitution);
            if (constitution) {
                constitution.score += answerValue;
            }
        });

        const questionsPerConstitution = {};
        questions.forEach(q => {
            if (!questionsPerConstitution[q.constitution]) {
                questionsPerConstitution[q.constitution] = 0;
            }
            questionsPerConstitution[q.constitution]++;
        });

        constitutions.forEach(c => {
            const maxScore = (questionsPerConstitution[c.id] || 2) * 5;
            c.normalizedScore = maxScore > 0 ? (c.score / maxScore) * 100 : 0;
        });

        const sorted = [...constitutions].sort((a, b) => b.normalizedScore - a.normalizedScore);
        const primaryConstitution = sorted[0];

        this.result = {
            primary: primaryConstitution,
            allConstitutions: constitutions,
            sortedConstitutions: sorted
        };

        this.saveResult();
        this.renderResult();
    },

    renderResult() {
        const quizEl = document.getElementById('constitutionQuiz');
        const resultEl = document.getElementById('constitutionResult');

        quizEl.style.display = 'none';
        resultEl.style.display = 'block';

        const { primary, sortedConstitutions } = this.result;

        resultEl.innerHTML = `
            <div class="result-header">
                <div class="result-constitution-name">${primary.name}</div>
                <div class="result-constitution-desc">${primary.description}</div>
            </div>
            <div class="result-body">
                <div class="result-section">
                    <h4>📊 体质特征</h4>
                    <div class="result-features">
                        ${primary.features.map(f => `<span class="result-feature-tag">${f}</span>`).join('')}
                    </div>
                </div>

                <div class="result-section">
                    <h4>💡 调理建议</h4>
                    <div class="result-suggestions">
                        <ul>
                            ${primary.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="result-section">
                    <h4>📈 各体质得分</h4>
                    <div class="result-score-chart">
                        ${sortedConstitutions.map(c => `
                            <div class="score-item">
                                <span class="score-name">${c.name}</span>
                                <div class="score-bar-container">
                                    <div class="score-bar" style="width: ${c.normalizedScore}%; background: ${c.id === primary.id ? 'var(--primary-color)' : '#ccc'}"></div>
                                </div>
                                <span class="score-value">${Math.round(c.normalizedScore)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 16px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p style="font-size: 12px; color: #f57f17; margin: 0; line-height: 1.6;">
                        ⚠️ <strong>免责声明：</strong>本体质辨识结果基于《中医体质分类与判定》国家标准，仅供参考，不能替代专业医师的诊断。如需个性化调理方案，请咨询正规中医师。
                    </p>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" onclick="ConstitutionModule.retakeTest()">重新测试</button>
                    <button class="btn btn-secondary" style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color);" onclick="window.Modals.openAppointmentModal()">咨询医师</button>
                </div>
            </div>
        `;

        if (window.RecordsModule) {
            RecordsModule.updateStats();
        }
    },

    saveResult() {
        const record = {
            id: Utils.generateId(),
            result: this.result.primary.name,
            allScores: this.result.allConstitutions.map(c => ({ id: c.id, name: c.name, score: c.normalizedScore })),
            createdAt: Date.now()
        };

        const records = Storage.get('constitutionRecords', []);
        records.unshift(record);
        Storage.set('constitutionRecords', records);
        Storage.set('lastConstitutionResult', record);

        if (window.Session) {
            Session.setConstitutionRecordId(record.id);
        }

        if (window.RecordsModule) {
            RecordsModule.updateStats();
        }

        if (window.ChatModule && Session.getCurrentSession()?.conversationId) {
            setTimeout(() => {
                ChatModule.notifyConstitutionComplete(record.id);
            }, 1500);
        }
    },

    retakeTest() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.result = null;

        const quizEl = document.getElementById('constitutionQuiz');
        const resultEl = document.getElementById('constitutionResult');

        if (quizEl) quizEl.style.display = 'block';
        if (resultEl) resultEl.style.display = 'none';

        this.renderCurrentQuestion();
        this.updateProgress();
        this.updateNavButtons();
    }
};
