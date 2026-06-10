/**
 * pages/ai-chat/ai-chat.js - AI 宠物助手聊天页面
 */
const aiService = require('../../services/ai-service');
const petService = require('../../services/pet-service');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    messages: [],
    inputValue: '',
    inputFocused: false,
    isTyping: false,
    quickQuestions: [],
    dailyTip: '',
    pets: [],
    currentPetId: '',
    currentPetName: '',
    scrollToId: '',
    showDisclaimer: true,
  },

  onLoad() {
    this.loadPets();
    this.addWelcomeMessage();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      // AI 助手不是 tab 页，不需要设置
    }
  },

  async loadPets() {
    const pets = await petService.getAllPets();
    const currentPetId = pets.length > 0 ? pets[0].id : '';
    const currentPetName = pets.length > 0 ? pets[0].name : '';
    const currentPetSpecies = pets.length > 0 ? pets[0].species : 'cat';
    this.setData({ pets, currentPetId, currentPetName, currentPetSpecies, quickQuestions: aiService.getQuickQuestions(currentPetSpecies) });
    this.loadDailyTip();
  },

  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species, quickQuestions: aiService.getQuickQuestions(pet.species) });
    this.loadDailyTip();
  },

  async loadDailyTip() {
    const tip = await aiService.getDailyTip(this.data.currentPetId);
    this.setData({ dailyTip: tip });
  },

  addWelcomeMessage() {
    const welcomeMsg = {
      id: 'msg_welcome',
      role: 'assistant',
      content: '你好！我是智能宠物助手 🐾\n\n我可以帮你解答关于宠物喂食、健康、护理等方面的问题。\n\n⚠️ 我只能提供建议，不能替代兽医诊断。如有严重健康问题，请及时就医！\n\n你可以直接输入问题，或者点击下方的快捷提问~',
      time: this._formatTime(new Date()),
      isUrgent: false,
    };
    this.setData({ messages: [welcomeMsg] });
  },

  /** 输入框内容变化 */
  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /** 输入框聚焦 */
  onInputFocus() {
    this.setData({ inputFocused: true });
  },

  /** 输入框失焦 */
  onInputBlur() {
    this.setData({ inputFocused: false });
  },

  /** 发送消息 */
  async onSend() {
    const text = this.data.inputValue.trim();
    if (!text || this.data.isTyping) return;

    // 添加用户消息
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      time: this._formatTime(new Date()),
    };

    const messages = [...this.data.messages, userMsg];
    this.setData({
      messages,
      inputValue: '',
      isTyping: true,
      scrollToId: userMsg.id,
    });

    // 模拟 AI 思考中
    await new Promise(r => setTimeout(r, 300));
    this.setData({ scrollToId: 'typing_indicator' });

    try {
      // 调用 AI 服务
      const result = await aiService.chat(text, this.data.currentPetId);

      const assistantMsg = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        time: this._formatTime(new Date()),
        isUrgent: result.isUrgent,
      };

      this.setData({
        messages: [...this.data.messages, assistantMsg],
        isTyping: false,
        scrollToId: assistantMsg.id,
      });

      // 如果是紧急回复，震动提醒
      if (result.isUrgent) {
        wx.vibrateShort({ type: 'heavy' });
        wx.vibrateShort({ type: 'heavy' });
      }
    } catch (err) {
      console.error('AI 回复失败:', err);
      const errMsg = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，我暂时无法回复。请稍后再试~ 🙏',
        time: this._formatTime(new Date()),
        isUrgent: false,
      };
      this.setData({
        messages: [...this.data.messages, errMsg],
        isTyping: false,
      });
    }
  },

  /** 键盘确认发送 */
  onConfirm() {
    this.onSend();
  },

  /** 点击快捷问题 */
  onQuickQuestion(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputValue: text });
    this.onSend();
  },

  /** 清空对话 */
  onClearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空所有对话记录吗？',
      confirmColor: '#FF9F5A',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          this.addWelcomeMessage();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },

  /** 关闭免责声明 */
  onCloseDisclaimer() {
    this.setData({ showDisclaimer: false });
  },

  /** 复制消息内容 */
  onCopyMessage(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
    });
  },

  /** 长按消息 */
  onLongPressMessage(e) {
    const content = e.currentTarget.dataset.content;
    wx.showActionSheet({
      itemList: ['复制内容'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({ data: content });
        }
      },
    });
  },

  /** 格式化时间 */
  _formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },
});
