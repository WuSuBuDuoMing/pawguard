const petService = require('../../services/pet-service');
const healthService = require('../../services/health-service');
const trainingService = require('../../services/training-service');
const expenseService = require('../../services/expense-service');
const diaryService = require('../../services/diary-service');
const behaviorService = require('../../services/behavior-service');
const feedingService = require('../../services/feeding-service');
const waterService = require('../../services/water-service');
const themeBehavior = require('../../utils/theme-behavior');
const { getAgeDisplay, getDaysUntil } = require('../../utils/date-utils');

const WEIGHT_GOAL_KEY = 'weight_goal_';

Page({
  behaviors: [themeBehavior],
  data: {
    petId: '', pet: null, age: '', weight: 0, weightData: [], chartWidth: 300,
    weightGoal: null, weightGoalPct: 0,
    healthCount: 0, trainingCount: 0, expenseTotal: '0',
    activeTab: 'health',
    healthRecords: [], healthReminders: [],
    trainingRecords: [], skills: [],
    feedingRecords: [], waterRecords: [], todayFeedingCount: 0, todayWaterIntake: 0,
    expenseRecords: [],
    diaryRecords: [], timeline: [],
  },
  onLoad(options) {
    if (options.id) this.setData({ petId: options.id });
  },
  onShow() { if (this.data.petId) this.loadAll(); },

  async loadAll() {
    try {
      const pet = await petService.getPetById(this.data.petId);
      if (!pet) return wx.navigateBack();
      const age = getAgeDisplay(pet.birthday);
      const sysInfo = wx.getSystemInfoSync();
      const chartWidth = sysInfo.windowWidth - 64;
      const weightHistory = await petService.getWeightHistory(pet.id);
      const weightData = weightHistory.map(w => ({ label: w.date.slice(5), value: w.weight }));
      const weightGoal = wx.getStorageSync(WEIGHT_GOAL_KEY + pet.id) || null;
      let weightGoalPct = 0;
      if (weightGoal && pet.weight) {
        const initialWeight = weightData.length > 0 ? weightData[0].value : pet.weight;
        const diff = Math.abs(initialWeight - weightGoal);
        const current = Math.abs(initialWeight - pet.weight);
        weightGoalPct = diff > 0 ? Math.min(100, Math.round((current / diff) * 100)) : 100;
      }
      this.setData({ pet, age, weight: pet.weight, weightData, chartWidth, weightGoal, weightGoalPct });
      this.loadTabData();
    } catch(e) {
      console.error('loadAll error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async loadTabData() {
    try {
      const pid = this.data.petId;
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      const [health, training, expenses, diaries, feedings, waterStats, todayFeedings, todayWater] = await Promise.all([
        healthService.getHealthRecords(pid).catch(() => []),
        trainingService.getTrainingRecords(pid).catch(() => []),
        expenseService.getExpenses(pid).catch(() => []),
        diaryService.getDiaries(pid).catch(() => []),
        feedingService.getFeedingRecords(pid).catch(() => []),
        waterService.getDailyIntake(pid, 14).catch(() => []),
        feedingService.getTodayFeedings(pid).catch(() => []),
        waterService.getTodayWater(pid).catch(() => []),
      ]);

    const reminders = health.filter(r => r.nextDate && getDaysUntil(r.nextDate) <= 30);
    const skills = [];
    try {
      const progress = await trainingService.getCommandProgress(pid);
      Object.entries(progress).forEach(([cmd, data]) => skills.push({ command: cmd, ...data }));
    } catch(e) {}

    const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
    const expenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

    // 计算今日喂食/饮水
    const todayFeedingCount = todayFeedings.length;
    const todayWaterIntake = todayWater.filter(r => r.type === 'intake').reduce((s, r) => s + (r.amount || 0), 0);

    // 构建活动时间线（合并所有记录类型）
    const timeline = [];
    health.slice(0, 8).forEach(r => {
      const typeIcons = { vaccine: '💉', deworming: '🐛', visit: '🏥', medication: '💊', abnormal: '🔍' };
      const typeColors = { vaccine: '#7EC8E3', deworming: '#52C41A', visit: '#FF9F5A', medication: '#FFB5C2', abnormal: '#FF4D4F' };
      timeline.push({ id: `tl_${r.id}`, icon: typeIcons[r.type] || '💊', title: r.title, date: r.date, time: '', color: typeColors[r.type] || '#7EC8E3', type: 'health' });
    });
    training.slice(0, 5).forEach(r => {
      timeline.push({ id: `tl_${r.id}`, icon: '🎯', title: `${r.command || '训练'} - ${r.result === 'success' ? '成功' : '待提高'}`, date: r.date, time: r.time || '', color: '#52C41A', type: 'training' });
    });
    diaries.slice(0, 5).forEach(r => {
      const moodIcons = { happy: '😊', excited: '🤩', scared: '😨', angry: '😠', tired: '😴', clingy: '🥰' };
      timeline.push({ id: `tl_${r.id}`, icon: moodIcons[r.mood] || '📝', title: r.title || '成长日记', date: r.date, time: '', color: '#FFB5C2', type: 'diary' });
    });
    feedings.slice(0, 5).forEach(r => {
      timeline.push({ id: `tl_${r.id}`, icon: '🍽️', title: `${r.foodName} ${r.grams}g`, date: r.date, time: r.time, color: '#FF9F5A', type: 'feeding' });
    });
    // 按日期降序排序
    timeline.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.time || '').localeCompare(a.time || '');
    });

    this.setData({
      healthCount: health.length, healthRecords: health.slice(0, 10), healthReminders: reminders,
      trainingCount: training.length, trainingRecords: training.slice(0, 10), skills,
      expenseRecords: monthExpenses.slice(0, 10), expenseTotal: expenseTotal.toFixed(0),
      diaryRecords: diaries.slice(0, 10),
      feedingRecords: feedings.slice(0, 15), waterRecords: waterStats.slice(0, 7),
      todayFeedingCount, todayWaterIntake,
      timeline: timeline.slice(0, 20),
    });
    } catch(e) {
      console.error('loadTabData error:', e);
    }
  },

  switchTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },
  onEdit() { wx.navigateTo({ url: '/pages/pets/pets' }); },
  goPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  onEditGoal() {
    const current = this.data.weightGoal || this.data.weight;
    wx.showModal({
      title: '设定体重目标(kg)',
      editable: true,
      placeholderText: '输入目标体重',
      content: String(current),
      success: (res) => {
        if (res.confirm && res.content) {
          const goal = parseFloat(res.content);
          if (!isNaN(goal) && goal > 0 && goal < 100) {
            wx.setStorageSync(WEIGHT_GOAL_KEY + this.data.petId, goal);
            this.loadAll();
            wx.showToast({ title: '目标已设定', icon: 'success' });
          }
        }
      }
    });
  },
});
