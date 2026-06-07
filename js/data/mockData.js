const TCM_DATA = {
  departments: [
    { id: 'internal', name: '中医内科', icon: '🫀', symptoms: ['咳嗽', '头痛', '失眠', '胃痛', '便秘', '腹泻'] },
    { id: 'gynecology', name: '中医妇科', icon: '👩', symptoms: ['月经不调', '痛经', '更年期综合征', '乳腺问题'] },
    { id: 'pediatrics', name: '中医儿科', icon: '👶', symptoms: ['小儿感冒', '消化不良', '积食', '夜啼'] },
    { id: 'orthopedics', name: '中医骨伤科', icon: '🦴', symptoms: ['腰痛', '颈椎病', '关节炎', '扭伤'] },
    { id: 'dermatology', name: '中医皮肤科', icon: '🧴', symptoms: ['湿疹', '痤疮', '荨麻疹', '皮肤瘙痒'] }
  ],

  constitutions: [
    {
      id: 'balanced',
      name: '平和质',
      description: '阴阳气血调和，体态适中，面色红润，精力充沛',
      features: ['体形匀称健壮', '面色、肤色润泽', '精力充沛', '睡眠良好', '二便正常'],
      suggestions: ['饮食有节', '劳逸结合', '坚持锻炼'],
      score: 0
    },
    {
      id: 'qi_deficiency',
      name: '气虚质',
      description: '元气不足，疲乏、气短、自汗',
      features: ['容易疲乏', '气短懒言', '容易头晕', '自汗', '舌淡苔白'],
      suggestions: ['多食益气健脾食物', '避免过度劳累', '适当运动'],
      score: 0
    },
    {
      id: 'yang_deficiency',
      name: '阳虚质',
      description: '阳气不足，畏寒怕冷、手足不温',
      features: ['怕冷，手足不温', '喜热饮食', '精神不振', '舌淡胖嫩'],
      suggestions: ['多食温阳壮阳食物', '注意保暖', '夏季培补阳气'],
      score: 0
    },
    {
      id: 'yin_deficiency',
      name: '阴虚质',
      description: '阴液亏少，口燥咽干、手足心热',
      features: ['手足心热', '口燥咽干', '鼻微干', '喜冷饮', '大便干燥'],
      suggestions: ['多食滋阴食物', '少食辛辣', '避免熬夜'],
      score: 0
    },
    {
      id: 'phlegm_dampness',
      name: '痰湿质',
      description: '痰湿凝聚，形体肥胖、腹部肥满、口黏苔腻',
      features: ['体形肥胖，腹部肥满', '胸闷痰多', '口黏腻或甜', '苔腻'],
      suggestions: ['饮食清淡', '多食健脾利湿食物', '坚持运动'],
      score: 0
    },
    {
      id: 'damp_heat',
      name: '湿热质',
      description: '湿热内蕴，面垢油光、口苦、苔黄腻',
      features: ['面垢油光', '易生痤疮', '口苦口干', '大便黏滞'],
      suggestions: ['饮食清淡', '多食清热利湿食物', '避免熬夜'],
      score: 0
    },
    {
      id: 'blood_stasis',
      name: '血瘀质',
      description: '血行不畅，肤色晦黯、舌质紫黯',
      features: ['肤色晦黯', '容易出现瘀斑', '口唇黯淡', '舌黯或有瘀点'],
      suggestions: ['多食活血食物', '保持心情舒畅', '适当运动'],
      score: 0
    },
    {
      id: 'qi_stagnation',
      name: '气郁质',
      description: '气机郁滞，神情抑郁、忧虑脆弱',
      features: ['神情抑郁', '情感脆弱', '烦闷不乐', '舌淡红，苔薄白'],
      suggestions: ['多食行气食物', '保持心情舒畅', '多参加社交活动'],
      score: 0
    },
    {
      id: 'special_inherent',
      name: '特禀质',
      description: '先天失常，生理缺陷、过敏反应',
      features: ['过敏体质', '遗传疾病', '胎传性疾病'],
      suggestions: ['避免过敏原', '饮食清淡', '增强体质'],
      score: 0
    }
  ],

  constitutionQuestions: [
    { id: 1, text: '您感到疲乏无力吗？', constitution: 'qi_deficiency', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 2, text: '您容易气短、说话声音低弱无力吗？', constitution: 'qi_deficiency', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 3, text: '您感到怕冷、手脚发凉吗？', constitution: 'yang_deficiency', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 4, text: '您手脚心发热吗？', constitution: 'yin_deficiency', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 5, text: '您感到身体沉重不轻松吗？', constitution: 'phlegm_dampness', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 6, text: '您面部或鼻部有油腻感吗？', constitution: 'damp_heat', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 7, text: '您皮肤在不知不觉中出现青紫瘀斑吗？', constitution: 'blood_stasis', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 8, text: '您感到闷闷不乐、情绪低沉吗？', constitution: 'qi_stagnation', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 9, text: '您容易过敏（对药物、食物、气味、花粉等）吗？', constitution: 'special_inherent', options: [{ value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
    { id: 10, text: '您能很快适应新环境吗？', constitution: 'balanced', options: [{ value: 5, label: '总是' }, { value: 4, label: '经常' }, { value: 3, label: '有时' }, { value: 2, label: '很少' }, { value: 1, label: '从不' }] }
  ],

  emergencySymptoms: [
    { keyword: '胸痛', level: 'critical', description: '可能是心脏问题', action: '立即拨打120', icon: '⚠️' },
    { keyword: '呼吸困难', level: 'critical', description: '可能是呼吸系统急症', action: '立即就医', icon: '⚠️' },
    { keyword: '昏迷', level: 'critical', description: '意识丧失', action: '立即拨打120', icon: '🚨' },
    { keyword: '大出血', level: 'critical', description: '严重出血', action: '立即止血并就医', icon: '🚨' },
    { keyword: '中风', level: 'critical', description: '突发肢体无力、言语不清', action: '立即拨打120', icon: '🚨' },
    { keyword: '高烧', level: 'urgent', description: '体温超过39度', action: '尽快就医', icon: '🌡️' },
    { keyword: '剧烈腹痛', level: 'urgent', description: '可能是急腹症', action: '尽快就医', icon: '🏥' },
    { keyword: '呕吐不止', level: 'urgent', description: '持续呕吐', action: '尽快就医', icon: '🤢' }
  ],

  tcmKnowledge: [
    { id: 1, category: '养生', question: '春季如何养生？', answer: '春季养生重在养肝。宜早睡早起，适当运动，饮食宜清淡，多吃新鲜蔬菜，少食辛辣油腻之物。保持心情舒畅，避免暴怒。' },
    { id: 2, category: '养生', question: '夏季如何养生？', answer: '夏季养生重在养心。宜晚睡早起，避免暴晒，适当午休。饮食宜清淡，多食瓜果，注意补充水分。避免贪凉饮冷。' },
    { id: 3, category: '养生', question: '秋季如何养生？', answer: '秋季养生重在养肺。宜早睡早起，注意保暖防燥。饮食宜滋阴润肺，多食梨、银耳、蜂蜜等。适当运动，增强体质。' },
    { id: 4, category: '养生', question: '冬季如何养生？', answer: '冬季养生重在养肾。宜早睡晚起，注意保暖，避免剧烈运动。饮食宜温补，多食羊肉、栗子、核桃等。保持心情平和。' },
    { id: 5, category: '常见病症', question: '感冒了怎么办？', answer: '感冒初起可多喝温水，注意休息。风寒感冒可喝生姜红糖水；风热感冒可喝菊花茶。症状严重请及时就医。' },
    { id: 6, category: '常见病症', question: '失眠如何调理？', answer: '失眠调理：1.睡前不玩手机，保持卧室安静黑暗；2.睡前泡脚，按摩涌泉穴；3.酸枣仁泡水喝；4.保持规律作息。' },
    { id: 7, category: '常见病症', question: '胃痛怎么缓解？', answer: '胃痛缓解方法：1.热敷腹部；2.喝温开水；3.按摩足三里穴；4.避免生冷辛辣食物。经常胃痛请就医检查。' },
    { id: 8, category: '食疗', question: '脾虚吃什么好？', answer: '脾虚宜食：山药、大枣、薏米、小米、南瓜、土豆、莲子等。可常喝山药薏米粥，忌食生冷油腻之物。' },
    { id: 9, category: '食疗', question: '气血不足怎么补？', answer: '气血不足可食：红枣、桂圆、枸杞、红糖、红豆、乌鸡、阿胶等。可煮五红汤（红枣、红豆、红糖、花生、枸杞）。' },
    { id: 10, category: '经络穴位', question: '按摩哪些穴位可以缓解疲劳？', answer: '缓解疲劳穴位：太阳穴（头部）、风池穴（颈部）、肩井穴（肩部）、足三里（腿部）、涌泉穴（足底）。每个穴位按揉3-5分钟。' }
  ],

  doctors: [
    { id: 1, name: '张医师', title: '主任医师', department: '中医内科', experience: 30, specialty: '脾胃病、呼吸系统疾病', avatar: '👨‍⚕️', available: true },
    { id: 2, name: '李医师', title: '副主任医师', department: '中医妇科', experience: 20, specialty: '月经病、不孕症', avatar: '👩‍⚕️', available: true },
    { id: 3, name: '王医师', title: '主治医师', department: '中医儿科', experience: 15, specialty: '小儿常见病、调理脾胃', avatar: '👨‍⚕️', available: true },
    { id: 4, name: '赵医师', title: '副主任医师', department: '中医骨伤科', experience: 25, specialty: '颈肩腰腿痛、骨伤康复', avatar: '👨‍⚕️', available: false }
  ]
};

const APP_STATE = {
  currentUser: {
    id: 'user_001',
    name: '访客用户',
    role: 'user',
    isLoggedIn: false
  },
  currentModule: 'home',
  currentConversation: null,
  conversations: [],
  symptomRecords: [],
  constitutionResult: null,
  appointments: [],
  notifications: [],
  triageResult: null
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TCM_DATA, APP_STATE };
}
