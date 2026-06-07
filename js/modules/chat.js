const ChatModule = {
    currentConversationId: null,
    conversations: [],

    init() {
        this.conversations = Storage.get('conversations', []);
        this.bindEvents();
        this.renderConversationList();
        this.updateStats();
    },

    bindEvents() {
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('newChatBtn').addEventListener('click', () => this.startNewConversation());
        document.getElementById('endChatBtn').addEventListener('click', () => this.endConversation());
        document.getElementById('uploadImageBtn').addEventListener('click', () => this.triggerImageUpload());
        document.getElementById('symptomRecordBtn').addEventListener('click', () => this.showSymptomRecord());

        document.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent;
                document.getElementById('chatInput').value = text;
                this.sendMessage();
            });
        });
    },

    startNewConversation() {
        const conversation = {
            id: Utils.generateId(),
            title: '新对话',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.conversations.unshift(conversation);
        this.currentConversationId = conversation.id;
        this.saveConversations();
        this.renderConversationList();
        this.renderMessages(conversation.messages);
        this.updateStats();

        setTimeout(() => {
            this.addBotMessage('您好！我是AI中医助手，很高兴为您服务。请问您有什么健康问题需要咨询？');
        }, 100);
    },

    endConversation() {
        if (this.currentConversationId) {
            this.addBotMessage('感谢您的咨询！如果还有其他问题，随时可以开始新的对话。祝您身体健康！');
            const conv = this.conversations.find(c => c.id === this.currentConversationId);
            if (conv && conv.messages.length > 1) {
                const firstUserMsg = conv.messages.find(m => m.role === 'user');
                if (firstUserMsg) {
                    conv.title = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
                    this.saveConversations();
                    this.renderConversationList();
                }
            }
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

    renderMessage(message) {
        const container = document.getElementById('chatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.role === 'user' ? 'user-message' : 'system-message'}`;
        msgDiv.dataset.id = message.id;

        const avatar = message.role === 'user' ? '👤' : '🤖';

        let quickRepliesHtml = '';
        if (message.quickReplies && message.quickReplies.length) {
            quickRepliesHtml = '<div class="quick-replies">' +
                message.quickReplies.map(r => `<button class="quick-reply-btn">${r}</button>`).join('') +
                '</div>';
        }

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${message.content}</p>
                ${quickRepliesHtml}
            </div>
        `;

        msgDiv.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent;
                document.getElementById('chatInput').value = text;
                this.sendMessage();
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
            return;
        }

        messages.forEach(msg => this.renderMessage(msg));
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
