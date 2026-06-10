const petService = require('../../services/pet-service');
const careService = require('../../services/care-service');
const themeBehavior = require('../../utils/theme-behavior');
const { CARE_TYPES } = require('../../utils/constants');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    todayCares: [], weeklyRate: 0, weekStats: [], aiSuggestion: '',
    careTotal: 0, careCompleted: 0, showCelebrate: false, weekDays: [],
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.init();
  },
  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  },
  async init() {
    const pets = await petService.getAllPets();
    const petNames = pets.map(p => p.name);
    this.setData({ pets, petNames, petIndex: 0, currentPetId: pets[0]?.id, currentPetName: pets[0]?.name, currentPetSpecies: pets[0]?.species || 'cat' });
    await this.loadData();
  },
  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ petIndex: idx, currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species });
    this.loadData();
  },
  async loadData() {
    const petId = this.data.currentPetId;
    if (!petId) return;
    const tasks = await careService.getTodayCares(petId);
    const todayCares = tasks.map(t => {
      const ct = CARE_TYPES.find(c => c.id === t.type);
      return { ...t, name: ct?.name || t.type, icon: ct?.icon || '📋' };
    }).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    const completed = todayCares.filter(c => c.completed).length;
    const weeklyRate = await careService.getWeeklyRate(petId);
    const stats = await careService.getCareStats(petId, 7);
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    const weekStats = stats.reverse().map((s, i) => ({ ...s, label: days[i] || '' }));
    // 生成周日历数据
    const today = new Date();
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayStat = stats.find(s => s.date === dateStr);
      weekDays.push({
        date: dateStr, label: days[i], day: d.getDate(),
        isToday: dateStr === today.toISOString().split('T')[0],
        isPast: d < today && dateStr !== today.toISOString().split('T')[0],
        hasData: !!dayStat, rate: dayStat?.rate || 0,
      });
    }
    const aiSuggestion = await careService.getAISuggestion(petId);
    this.setData({
      todayCares, weeklyRate, weekStats, aiSuggestion, weekDays,
      careTotal: todayCares.length, careCompleted: completed,
    });
    // 全部完成 → 庆祝
    if (todayCares.length > 0 && completed === todayCares.length && !this.data.showCelebrate) {
      this.triggerCelebrate();
    }
  },
  async onComplete(e) {
    const { task } = e.detail;
    await careService.completeCare(task.id);
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '打卡成功 ✓', icon: 'success', duration: 1000 });
    await this.loadData();
  },
  triggerCelebrate() {
    this.setData({ showCelebrate: true });
    wx.vibrateShort({ type: 'heavy' });
    setTimeout(() => this.setData({ showCelebrate: false }), 2500);
  },
  onDaySelect(e) {
    const date = e.currentTarget.dataset.date;
    wx.showToast({ title: `查看 ${date} 的照护记录`, icon: 'none', duration: 1000 });
  },
});
