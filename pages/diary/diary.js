const petService = require('../../services/pet-service');
const diaryService = require('../../services/diary-service');
const themeBehavior = require('../../utils/theme-behavior');

const MOOD_EMOJIS = { happy: '😊', excited: '🤩', scared: '😨', angry: '😠', tired: '😴', clingy: '🥰' };

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    diaries: [], monthlySummary: null, month: 6, calendarDays: [],
    showAIResult: false, aiResult: { title: '', content: '', mood: '' },
    showWriteModal: false,
    form: { title: '', content: '', mood: 'happy', tags: '' },
    moodOptions: [
      { id: 'happy', name: '😊 开心' },
      { id: 'excited', name: '🤩 兴奋' },
      { id: 'tired', name: '😴 疲惫' },
      { id: 'clingy', name: '🥰 粘人' },
      { id: 'scared', name: '😨 害怕' },
      { id: 'angry', name: '😠 生气' },
    ],
  },
  onShow() { this.init(); },
  async init() {
    const pets = await petService.getAllPets();
    const now = new Date();
    this.setData({ pets, petNames: pets.map(p => p.name), currentPetId: pets[0]?.id, currentPetName: pets[0]?.name, currentPetSpecies: pets[0]?.species || 'cat', month: now.getMonth() + 1 });
    this.loadData();
  },
  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ petIndex: idx, currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species });
    this.loadData();
  },
  async loadData() {
    const pid = this.data.currentPetId;
    if (!pid) return;
    const now = new Date();
    const [diaries, summary] = await Promise.all([
      diaryService.getDiaries(pid),
      diaryService.getMonthlySummary(pid, now.getFullYear(), now.getMonth() + 1),
    ]);
    // 构建日历数据
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const diaryMap = {};
    diaries.forEach(d => {
      if (d.date.startsWith(monthStr)) {
        const day = parseInt(d.date.split('-')[2]);
        diaryMap[day] = d.mood;
      }
    });
    const calendarDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i, date: `${monthStr}-${String(i).padStart(2, '0')}`,
        hasDiary: !!diaryMap[i], mood: diaryMap[i] || null,
        moodEmoji: MOOD_EMOJIS[diaryMap[i]] || '',
      });
    }
    this.setData({ diaries, monthlySummary: summary, calendarDays });
  },

  async onAIGenerate() {
    wx.showLoading({ title: 'AI 创作中...' });
    const result = await diaryService.generateAIDiary(this.data.currentPetId);
    wx.hideLoading();
    this.setData({ showAIResult: true, aiResult: result });
  },
  hideAIResult() { this.setData({ showAIResult: false }); },
  onAICopy() {
    wx.setClipboardData({ data: `${this.data.aiResult.title}\n\n${this.data.aiResult.content}` });
    wx.showToast({ title: '已复制', icon: 'success' });
  },
  async onAISave() {
    const now = new Date();
    await diaryService.addDiary({
      petId: this.data.currentPetId,
      title: this.data.aiResult.title,
      content: this.data.aiResult.content,
      mood: this.data.aiResult.mood || 'happy',
      tags: ['AI生成'],
      images: [],
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    });
    this.setData({ showAIResult: false });
    wx.showToast({ title: '日记已保存', icon: 'success' });
    this.loadData();
  },
  // 写日记
  onWrite() {
    this.setData({
      showWriteModal: true,
      form: { title: '', content: '', mood: 'happy', tags: '' },
    });
  },
  hideWrite() { this.setData({ showWriteModal: false }); },
  onFormInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onMoodChange(e) { this.setData({ 'form.mood': this.data.moodOptions[e.detail.value].id }); },

  async onSaveDiary() {
    const { form, currentPetId } = this.data;
    if (!form.title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' });
    if (!form.content.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' });

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tags = form.tags ? form.tags.split(/[,，、\s]+/).filter(Boolean) : [];

    await diaryService.addDiary({
      petId: currentPetId,
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      tags,
      images: [],
      date,
    });

    this.setData({ showWriteModal: false });
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '日记已保存 ✓', icon: 'success' });
    this.loadData();
  },
});
