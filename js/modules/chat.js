const ChatModule = {
    currentConversationId: null,
    conversations: [],
    pendingAction: null,

    init() {
        this.conversations = Storage.get('conversations', []);
        this.bindEvents();
        this.renderConversationList();
        this.updateStats();
        
        if (window.Session) {
            Session.init();
        }
    },

    bindEvents() {
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('newChatBtn').addEventListener('click', () => this.startNewConversation());
        document.getElementById('endChatBtn').addEventListener('click', () => this.transferToHuman());
        document.getElementById('uploadImageBtn').addEventListener('click', () => this.triggerImageUpload());
        document.getElementById('symptomRecordBtn').addEventListener('click', () => this.showSymptomRecord());

        this.bindStaticQuickReplies();
    },

    bindStaticQuickReplies() {
        document.querySelectorAll('#chatMessages .quick-reply-btn').forEach(btn => {
            if (!btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', (e) => {
                    const text = e.target.textContent;
                    this.handleQuickReply(text);
                });
            }
        });
    },

    startNewConversation() {
        if (window.Session) {
            Session.resetSession();
        }

        this.pendingTriageStarted = false;
        this.pendingAction = null;

        const conversation = {
            id: Utils.generateId(),
            title: '新对话',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.conversations.unshift(conversation);
        this.currentConversationId = conversation.id;
        
        if (window.Session) {
            Session.setConversationId(conversation.id);
        }

        this.saveConversations();
        this.renderConversationList();
        this.renderMessages(conversation.messages);
        this.updateStats();

        setTimeout(() => {
            this.addBotMessageWithGuide('您好！我是AI中医助手，很高兴为您服务。我可以为您提供健康咨询、症状分诊、体质辨识等服务。请问您有什么健康问题需要咨询？');
        }, 100);
    },

    addBotMessageWithGuide(text, quickReplies = null) {
        const defaultReplies = ['我有不舒服的症状', '我想测试体质', '我想了解养生知识'];
        this.addBotMessage(text, quickReplies || defaultReplies);
    },

    transferToHuman() {
        if (!this.currentConversationId) {
            this.startNewConversation();
        }

        const linkedRecords = window.Session ? Session.getLinkedRecords() : {};
        
        let recordsSummary = '';
        let hasRecords = false;

        if (linkedRecords.triage) {
            hasRecords = true;
            recordsSummary += `
                <div style="padding: 12px; background: #e3f2fd; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #1976d2;">
                    <p style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">🏥 最近分诊记录</p>
                    <p style="font-size: 12px; margin-bottom: 4px;">症状：${linkedRecords.triage.symptoms.join('、')}</p>
                    <p style="font-size: 12px; margin-bottom: 4px;">推荐科室：${linkedRecords.triage.recommendedDept}</p>
                    <p style="font-size: 12px;">风险等级：${linkedRecords.triage.riskLevel === 'high' ? '高风险' : linkedRecords.triage.riskLevel === 'medium' ? '中风险' : '低风险'}</p>
                </div>
            `;
        }

        if (linkedRecords.constitution) {
            hasRecords = true;
            recordsSummary += `
                <div style="padding: 12px; background: #f3e5f5; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #7b1fa2;">
                    <p style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">🧬 最近体质测试</p>
                    <p style="font-size: 12px;">体质类型：${linkedRecords.constitution.result}</p>
                </div>
            `;
        }

        if (linkedRecords.conversation && linkedRecords.conversation.messages.length > 0) {
            hasRecords = true;
            const msgCount = linkedRecords.conversation.messages.filter(m => m.role === 'user').length;
            recordsSummary += `
                <div style="padding: 12px; background: #e8f5e9; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #388e3c;">
                    <p style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">💬 本次对话</p>
                    <p style="font-size: 12px;">已咨询 ${msgCount} 个问题</p>
                </div>
            `;
        }

        if (!hasRecords) {
            recordsSummary = `
                <div style="padding: 12px; background: var(--bg-color); border-radius: 8px; margin-bottom: 10px;">
                    <p style="font-size: 13px; color: var(--text-secondary);">暂无相关健康记录</p>
                </div>
            `;
        }

        if (window.Modals) {
            Modals.showAlert({
                title: '👨‍⚕️ 转接人工客服',
                content: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 16px;">正在为您转接人工客服，以下健康记录将同步提供给客服人员参考：</p>
                        
                        ${recordsSummary}
                        
                        <div style="padding: 16px; background: var(--bg-color); border-radius: 8px; margin-bottom: 16px;">
                            <p style="margin-bottom: 8px;"><strong>📋 服务信息</strong></p>
                            <p style="font-size: 13px; margin-bottom: 4px;">• 在线客服工作时间：周一至周日 8:00-22:00</p>
                            <p style="font-size: 13px; margin-bottom: 4px;">• 医师咨询热线：400-888-8888</p>
                            <p style="font-size: 13px;">• 急诊电话：120（24小时）</p>
                        </div>
                        <div style="padding: 12px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <p style="font-size: 13px; color: #e65100; margin: 0;">
                                ⚠️ 本系统提供的建议仅供参考，不能替代专业医疗诊断。如有身体不适，请及时就医。
                            </p>
                        </div>
                    </div>
                `,
                confirmText: '确认转接',
                cancelText: '取消',
                showCancel: true,
                onConfirm: () => {
                    this.addBotMessage('📞 已为您转接人工客服，您的健康记录已同步。客服人员将尽快与您联系，请保持电话畅通。如有紧急情况，请直接拨打120急救电话。');
                }
            });
        }
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;

        if (!this.currentConversationId) {
            this.startNewConversation();
        }

        this.addUserMessage(text);
        input.value = '';

        setTimeout(() => {
            this.generateBotReply(text);
        }, 500 + Math.random() * 1000);
    },

    addUserMessage(text) {
        const message = {
            id: Utils.generateId(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };
        this.addMessageToConversation(message);
        this.renderMessage(message);
        this.scrollToBottom();
    },

    addBotMessage(text, quickReplies = null) {
        const message = {
            id: Utils.generateId(),
            role: 'bot',
            content: text,
            timestamp: Date.now(),
            quickReplies
        };
        this.addMessageToConversation(message);
        this.renderMessage(message);
        this.scrollToBottom();
    },

    addMessageToConversation(message) {
        const conv = this.conversations.find(c => c.id === this.currentConversationId);
        if (conv) {
            conv.messages.push(message);
            conv.updatedAt = Date.now();
            if (conv.title === '新对话' && message.role === 'user') {
                conv.title = message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '');
            }
            this.saveConversations();
            this.renderConversationList();
        }
    },

    generateBotReply(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        let reply = '';
        let quickReplies = null;

        for (const emergency of TCM_DATA.emergencySymptoms) {
            if (lowerMsg.includes(emergency.keyword)) {
                reply = `⚠️ <strong>重要提醒</strong>：您提到的"${emergency.keyword}"属于${emergency.level === 'critical' ? '危急' : '紧急'}症状。${emergency.description}，请${emergency.action}！\n\n本建议仅供参考，紧急情况请立即就医或拨打120。`;
                this.addBotMessage(reply);
                return;
            }
        }

        const allSymptoms = [...new Set(Object.values(TriageModule.partSymptoms || {}).flat())];
        const matchedSymptoms = allSymptoms.filter(s => lowerMsg.includes(s.toLowerCase()));
        
        if (matchedSymptoms.length > 0 && !this.pendingTriageStarted) {
            this.pendingTriageStarted = true;
            const symptomText = matchedSymptoms.join('、');
            reply = `我注意到您提到了「${symptomText}」这些症状。为了给您更准确的建议，我可以帮您做一个详细的症状分诊，推荐对应的就诊科室。\n\n您是想现在做详细的症状分诊，还是先简单了解一下相关建议？`;
            quickReplies = ['去做详细分诊', '先简单了解一下', '我还有其他症状'];
            
            if (window.Session && TriageModule) {
                matchedSymptoms.forEach(s => {
                    if (!TriageModule.selectedSymptoms.includes(s)) {
                        TriageModule.selectedSymptoms.push(s);
                    }
                });
            }
            
            this.addBotMessage(reply, quickReplies);
            return;
        }

        if (lowerMsg.includes('去做详细分诊') || lowerMsg.includes('详细分诊')) {
            if (window.App) {
                this.addBotMessage('好的，这就为您跳转到症状分诊页面，您可以选择更多症状并获得详细建议。');
                setTimeout(() => {
                    App.switchModule('triage');
                }, 500);
            }
            return;
        }

        for (const knowledge of TCM_DATA.tcmKnowledge) {
            if (lowerMsg.includes(knowledge.question.replace(/怎么|如何|什么|？|\?/g, '')) ||
                knowledge.question.includes(userMessage.replace(/怎么|如何|什么|？|\?/g, ''))) {
                reply = knowledge.answer;
                quickReplies = ['还有其他问题吗？', '谢谢！'];
                this.addBotMessage(reply, quickReplies);
                return;
            }
        }

        if (lowerMsg.includes('体质') || lowerMsg.includes('辨识') || lowerMsg.includes('测试')) {
            reply = '中医体质辨识是了解自身体质的好方法！我们提供基于国家标准的九种体质测试，大约需要3-5分钟完成。您可以点击顶部导航的"体质辨识"开始测试，或者我现在就为您开始？';
            quickReplies = ['开始体质测试', '先了解一下'];
            this.addBotMessage(reply, quickReplies);
            return;
        }

        if (lowerMsg.includes('分诊') || lowerMsg.includes('挂号') || lowerMsg.includes('科室')) {
            reply = '如果您有具体的症状，我可以帮您分诊推荐科室。请告诉我您有哪些不适的症状？或者您也可以点击顶部导航的"症状分诊"进行详细的症状选择。';
            quickReplies = ['开始症状分诊', '头痛怎么办'];
            this.addBotMessage(reply, quickReplies);
            return;
        }

        if (lowerMsg.includes('感冒') || lowerMsg.includes('发烧') || lowerMsg.includes('咳嗽')) {
            reply = '感冒是常见的外感疾病。中医将感冒分为风寒、风热等不同类型：\n\n🌿 <strong>风寒感冒</strong>：怕冷重、发热轻、流清涕，可喝生姜红糖水，注意保暖。\n🌿 <strong>风热感冒</strong>：发热重、怕冷轻、咽喉痛，可喝菊花茶、薄荷茶。\n\n建议多喝温水、注意休息。如果症状持续加重或高烧不退，请及时就医。';
            quickReplies = ['如何区分风寒风热？', '需要吃什么药？'];
        } else if (lowerMsg.includes('失眠') || lowerMsg.includes('睡不着') || lowerMsg.includes('睡眠')) {
            reply = '失眠在中医中称为"不寐"，常见原因有心脾两虚、阴虚火旺、肝郁化火等。\n\n💡 调理建议：\n1. 睡前1小时不看手机，保持卧室安静黑暗\n2. 睡前用温水泡脚15-20分钟\n3. 可按揉涌泉穴、神门穴\n4. 酸枣仁15克泡水代茶饮\n\n如果长期失眠，建议咨询中医师进行辨证调理。';
            quickReplies = ['涌泉穴在哪里？', '还有其他方法吗？'];
        } else if (lowerMsg.includes('胃') || lowerMsg.includes('胃痛') || lowerMsg.includes('消化')) {
            reply = '脾胃是后天之本，中医非常重视脾胃调理。\n\n💡 日常养胃建议：\n1. 饮食规律，定时定量，避免暴饮暴食\n2. 少食生冷、辛辣、油腻食物\n3. 保持心情舒畅，避免忧思伤脾\n4. 可常吃山药、小米、南瓜等健脾食物\n5. 按揉足三里穴有很好的保健作用\n\n如果胃痛频繁或持续加重，建议就医检查。';
            quickReplies = ['足三里穴位置', '脾胃虚弱怎么补'];
        } else if (lowerMsg.includes('养生') || lowerMsg.includes('保健') || lowerMsg.includes('调理')) {
            reply = '中医养生讲究"天人合一"，顺应四时规律。\n\n🌸 春季：养肝为主，宜早起，多运动，少食酸多食甘\n☀️ 夏季：养心为主，宜午休，防中暑，少食苦多食咸\n🍂 秋季：养肺为主，宜早睡，防秋燥，少食辛多食酸\n❄️ 冬季：养肾为主，宜晚起，重保暖，少食咸多食苦\n\n您想了解哪个季节的养生细节？';
            quickReplies = ['春季养生', '夏季养生', '秋季养生', '冬季养生'];
        } else if (lowerMsg.includes('你好') || lowerMsg.includes('您好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
            reply = '您好！我是AI中医助手。我可以为您提供以下服务：\n\n💬 健康问题咨询\n🏥 症状分诊推荐\n🧬 中医体质辨识\n🌿 养生调理建议\n\n请问有什么可以帮您的？';
            quickReplies = ['感冒了怎么办', '失眠如何调理', '我想做体质测试'];
        } else if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
            reply = '不客气！能为您提供帮助是我的荣幸。祝您身体健康，生活愉快！如果还有其他问题，随时可以咨询我。';
        } else {
            reply = `感谢您的咨询。关于"${userMessage}"这个问题，我建议您：\n\n1. 注意观察症状变化\n2. 保持良好的作息和饮食习惯\n3. 如果症状持续或加重，请及时就医\n\n您可以告诉我更详细的症状，或者选择以下服务：`;
            quickReplies = ['症状分诊', '体质测试', '咨询养生建议'];
        }

        this.addBotMessage(reply, quickReplies);
    },

    handleQuickReply(text) {
        const specialActions = {
            '开始体质测试': () => { this.startConstitutionTest(); },
            '我想测试体质': () => { this.startConstitutionTest(); },
            '开始症状分诊': () => { this.startTriage(); },
            '我有不舒服的症状': () => { this.startTriage(); },
            '症状分诊': () => { this.startTriage(); },
            '体质测试': () => { this.startConstitutionTest(); },
            '春季养生': () => { document.getElementById('chatInput').value = '春季如何养生？'; this.sendMessage(); },
            '夏季养生': () => { document.getElementById('chatInput').value = '夏季如何养生？'; this.sendMessage(); },
            '秋季养生': () => { document.getElementById('chatInput').value = '秋季如何养生？'; this.sendMessage(); },
            '冬季养生': () => { document.getElementById('chatInput').value = '冬季如何养生？'; this.sendMessage(); },
            '我想了解养生知识': () => { 
                this.addBotMessage('好的！中医养生讲究顺应四时。您想了解哪个季节的养生知识，或者有具体的养生问题吗？', 
                    ['春季养生', '夏季养生', '秋季养生', '冬季养生']);
            },
            '去分诊页面详细选择': () => { 
                if (window.App) {
                    App.switchModule('triage');
                }
            },
            '查看详细建议': () => { 
                this.addBotMessage('建议您可以：\n\n1. 点击「预约挂号」直接预约对应科室的医师\n2. 带上相关检查资料到医院就诊\n3. 如有症状加重，立即就医\n\n您还有其他问题吗？', 
                    ['预约挂号', '转人工客服咨询', '我知道了']);
            },
            '预约挂号': () => { 
                if (window.Modals) {
                    Modals.openAppointmentModal();
                }
            },
            '转人工客服咨询': () => { 
                this.transferToHuman();
            },
            '咨询调理方案': () => { 
                this.addBotMessage('您可以携带您的体质报告，咨询专业中医师获得个性化的调理方案。我们也可以帮您预约相关医师，您需要吗？', 
                    ['预约中医师', '先看看调理建议', '谢谢']);
            },
            '查看详细报告': () => { 
                if (window.Modals) {
                    const records = Storage.get('constitutionRecords', []);
                    if (records.length > 0) {
                        Modals.viewRecordDetail(records[0].id, 'constitution');
                    }
                }
            },
            '我知道了': () => { 
                this.addBotMessage('好的！如果还有其他健康问题，随时可以告诉我。祝您身体健康！', 
                    ['还有其他问题', '谢谢']);
            },
            '还有其他问题': () => { 
                this.addBotMessage('请问您还有什么问题呢？我可以帮您解答健康疑问、做症状分诊或体质测试。', 
                    ['我有不舒服的症状', '我想测试体质', '我想了解养生知识']);
            },
            '谢谢': () => { 
                this.addBotMessage('不客气！祝您身体健康，生活愉快！💚');
            }
        };

        if (specialActions[text]) {
            specialActions[text]();
        } else {
            document.getElementById('chatInput').value = text;
            this.sendMessage();
        }
    },

    startTriage() {
        if (!this.currentConversationId) {
            this.startNewConversation();
        }
        this.pendingAction = 'triage';
        this.addBotMessage('好的，我来帮您做症状分诊。请告诉我您有哪些不舒服的症状？或者您也可以点击「症状分诊」页面进行详细的症状选择。', 
            ['头痛', '咳嗽', '胃痛', '失眠', '去分诊页面详细选择']);
    },

    startConstitutionTest() {
        if (!this.currentConversationId) {
            this.startNewConversation();
        }
        this.pendingAction = 'constitution';
        
        if (window.Modals) {
            Modals.showAlert({
                title: '🧬 中医体质辨识',
                content: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 12px;">中医将体质分为九种类型，通过简单的问卷可以了解您的体质特点，获得个性化的调理建议。</p>
                        <p style="margin-bottom: 12px;"><strong>测试说明：</strong></p>
                        <ul style="margin-left: 20px; margin-bottom: 16px;">
                            <li>共 10 道题目，约 3-5 分钟完成</li>
                            <li>请根据您的实际情况选择</li>
                            <li>完成后可查看详细的调理方案</li>
                        </ul>
                        <p style="font-size: 13px; color: var(--text-secondary);">测试结果仅供参考，如需详细诊断请咨询专业中医师。</p>
                    </div>
                `,
                confirmText: '开始测试',
                cancelText: '稍后再说',
                showCancel: true,
                onConfirm: () => {
                    if (window.App) {
                        App.switchModule('constitution');
                    }
                }
            });
        } else if (window.App) {
            App.switchModule('constitution');
        }
    },

    notifyTriageComplete(triageRecordId) {
        if (!this.currentConversationId) {
            this.startNewConversation();
        }

        const triages = Storage.get('triageRecords', []);
        const record = triages.find(t => t.id === triageRecordId);
        
        if (record) {
            const symptomsText = record.symptoms.join('、');
            const riskText = record.riskLevel === 'high' ? '高风险，建议尽快就医' : 
                            record.riskLevel === 'medium' ? '中风险，建议关注' : '低风险，可继续观察';
            
            const message = `✅ <strong>症状分诊完成</strong><br><br>
                📋 <strong>您的症状：</strong>${symptomsText}<br>
                🏥 <strong>推荐科室：</strong>${record.recommendedDept}<br>
                ⚠️ <strong>风险评估：</strong>${riskText}<br><br>
                以下是为您生成的就医建议：`;

            this.addBotMessage(message, ['查看详细建议', '预约挂号', '还有其他问题']);

            const suggestions = this.generateTriageSuggestions(record);
            setTimeout(() => {
                this.addBotMessage(suggestions, ['我知道了', '转人工客服咨询']);
            }, 800);
        }

        if (window.App) {
            App.switchModule('chat');
        }
    },

    generateTriageSuggestions(record) {
        let suggestions = '💡 <strong>就医建议：</strong><br><br>';
        suggestions += `1. 建议优先到 <strong>${record.recommendedDept}</strong> 就诊<br>`;
        
        if (record.riskLevel === 'high') {
            suggestions += '2. ⚠️ 您的症状风险较高，请尽快就医，最好有家人陪同<br>';
            suggestions += '3. 就诊时请携带好您的相关检查资料<br>';
        } else if (record.riskLevel === 'medium') {
            suggestions += '2. 📋 建议在1-3天内就医检查<br>';
            suggestions += '3. 注意观察症状变化，如有加重立即就医<br>';
        } else {
            suggestions += '2. 🌿 可先居家观察，注意休息和饮食<br>';
            suggestions += '3. 如症状持续或加重，请及时就医<br>';
        }
        
        suggestions += '4. 保持良好的作息，避免过度劳累<br>';
        suggestions += '5. 饮食宜清淡，避免辛辣刺激食物<br><br>';
        suggestions += '⚠️ 以上建议仅供参考，具体诊疗请遵医嘱。';
        
        return suggestions;
    },

    notifyConstitutionComplete(recordId) {
        if (!this.currentConversationId) {
            this.startNewConversation();
        }

        const records = Storage.get('constitutionRecords', []);
        const record = records.find(r => r.id === recordId);
        
        if (record) {
            const topScores = record.allScores
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
            
            const message = `✅ <strong>体质辨识完成</strong><br><br>
                🧬 <strong>您的主要体质：</strong>${record.result}<br><br>
                📊 <strong>体质得分TOP3：</strong><br>
                ${topScores.map(s => `• ${s.name}: ${Math.round(s.score)}%`).join('<br>')}<br><br>
                我为您整理了个性化的调理建议：`;

            this.addBotMessage(message, ['查看详细报告', '咨询调理方案', '转人工客服']);

            setTimeout(() => {
                const tips = this.generateConstitutionTips(record.result);
                this.addBotMessage(tips, ['我记住了', '还有其他问题']);
            }, 800);
        }

        if (window.App) {
            App.switchModule('chat');
        }
    },

    generateConstitutionTips(constitutionType) {
        const tipsMap = {
            '平和质': '🌿 <strong>平和质调理建议：</strong><br><br>1. 饮食有节，不暴饮暴食，粗细搭配<br>2. 劳逸结合，保持充足睡眠<br>3. 坚持适度运动，如散步、太极拳<br>4. 保持心情舒畅，心态平和',
            '气虚质': '💪 <strong>气虚质调理建议：</strong><br><br>1. 多食益气健脾食物：山药、大枣、小米、南瓜<br>2. 避免过度劳累，保证充足睡眠<br>3. 适度运动，不宜剧烈运动<br>4. 常按足三里、气海穴',
            '阳虚质': '☀️ <strong>阳虚质调理建议：</strong><br><br>1. 多食温阳食物：羊肉、韭菜、生姜、核桃<br>2. 注意保暖，尤其腹部和足部<br>3. 夏季可适当晒太阳，少吹空调<br>4. 常按关元、命门穴',
            '阴虚质': '🌙 <strong>阴虚质调理建议：</strong><br><br>1. 多食滋阴食物：银耳、百合、梨、枸杞<br>2. 少食辛辣燥热之物<br>3. 避免熬夜，保证充足睡眠<br>4. 适合静坐、瑜伽等舒缓运动',
            '痰湿质': '🌊 <strong>痰湿质调理建议：</strong><br><br>1. 饮食清淡，少食肥甘厚味<br>2. 多食健脾利湿食物：薏米、红豆、冬瓜<br>3. 坚持运动，保持健康体重<br>4. 居住环境宜干燥通风',
            '湿热质': '🔥 <strong>湿热质调理建议：</strong><br><br>1. 饮食清淡，多食清热利湿食物<br>2. 少食辛辣油腻，少喝酒<br>3. 保持充足睡眠，避免熬夜<br>4. 适合游泳、跑步等运动',
            '血瘀质': '🩸 <strong>血瘀质调理建议：</strong><br><br>1. 多食活血食物：山楂、黑木耳、玫瑰花<br>2. 保持心情舒畅，避免郁闷<br>3. 坚持运动，促进血液循环<br>4. 可常做推拿、艾灸',
            '气郁质': '🌸 <strong>气郁质调理建议：</strong><br><br>1. 多食行气食物：陈皮、佛手、玫瑰花茶<br>2. 保持心情舒畅，多参加社交活动<br>3. 适当运动，如郊游、跳舞<br>4. 常按太冲、膻中穴',
            '特禀质': '🛡️ <strong>特禀质调理建议：</strong><br><br>1. 避免接触过敏原<br>2. 饮食清淡，少食辛辣发物<br>3. 增强体质，适度运动<br>4. 季节变换时注意防护'
        };

        return tipsMap[constitutionType] || '🌿 建议您咨询专业中医师，获得个性化的调理方案。';
    }

    renderMessage(message) {
        const container = document.getElementById('chatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.role === 'user' ? 'user-message' : 'system-message'}`;
        msgDiv.dataset.id = message.id;

        const avatar = message.role === 'user' ? '👤' : '🤖';
        const content = message.content.replace(/\n/g, '<br>');

        let quickRepliesHtml = '';
        if (message.quickReplies && message.quickReplies.length) {
            quickRepliesHtml = '<div class="quick-replies">' +
                message.quickReplies.map(r => `<button class="quick-reply-btn">${r}</button>`).join('') +
                '</div>';
        }

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${content}</p>
                ${quickRepliesHtml}
            </div>
        `;

        msgDiv.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent;
                this.handleQuickReply(text);
            });
        });

        container.appendChild(msgDiv);
    },

    renderMessages(messages) {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        if (messages.length === 0) {
            const welcomeMsg = {
                role: 'bot',
                content: '您好！我是AI中医助手，很高兴为您服务。请问您有什么健康问题需要咨询？',
                quickReplies: ['感冒了怎么办？', '失眠如何调理？', '春季养生建议', '我想做体质测试']
            };
            this.renderMessage(welcomeMsg);
            this.bindStaticQuickReplies();
            return;
        }

        messages.forEach(msg => this.renderMessage(msg));
        this.bindStaticQuickReplies();
    },

    renderConversationList() {
        const container = document.getElementById('conversationList');
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="empty-conversation">
                    <p>暂无对话记录</p>
                    <p class="hint">点击右侧开始咨询</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}" data-id="${conv.id}">
                <div class="conversation-title">${Utils.escapeHtml(conv.title)}</div>
                <div class="conversation-preview">${conv.messages.length > 0 ? Utils.escapeHtml(conv.messages[conv.messages.length - 1].content.substring(0, 30)) : '暂无消息'}</div>
                <div class="conversation-time">${Utils.formatTime(conv.updatedAt)}</div>
            </div>
        `).join('');

        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.loadConversation(id);
            });
        });
    },

    loadConversation(id) {
        this.currentConversationId = id;
        const conv = this.conversations.find(c => c.id === id);
        if (conv) {
            this.renderMessages(conv.messages);
            this.renderConversationList();
            this.bindStaticQuickReplies();
        }
    },

    saveConversations() {
        Storage.set('conversations', this.conversations);
    },

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    },

    triggerImageUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.addUserMessage('[图片]');
                    setTimeout(() => {
                        this.addBotMessage('图片已收到。由于这是模拟系统，无法进行真实的图片诊断。建议您携带相关检查报告到医院就诊，或咨询专业医师。');
                    }, 800);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },

    showSymptomRecord() {
        if (window.Modals) {
            Modals.openRecordsModal();
        }
    },

    updateStats() {
        const count = this.conversations.length;
        const el = document.getElementById('chatCount');
        if (el) el.textContent = count;
    }
};
