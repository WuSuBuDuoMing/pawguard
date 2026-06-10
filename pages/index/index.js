const petService = require('../../services/pet-service');
const careService = require('../../services/care-service');
const expenseService = require('../../services/expense-service');
const inventoryService = require('../../services/inventory-service');
const healthService = require('../../services/health-service');
const dailySummaryService = require('../../services/daily-summary-service');
const feedingService = require('../../services/feeding-service');
const waterService = require('../../services/water-service');
const themeBehavior = require('../../utils/theme-behavior');
const { CARE_TYPES } = require('../../utils/constants');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], currentPet: null, currentPetId: '',
    greeting: '早上好', aiSuggestion: '',
    todayCares: [], careRate: 0, careTotal: 0, careCompleted: 0,
    reminders: [],
    monthlyExpense: '0.00', topCategories: [],
    lowStockItems: [], lowStockCount: 0,
    loading: true, fabOpen: false, dailySummary: null,
    todayFeedingCount: 0, todayFeedingGrams: 0, todayWaterIntake: 0, feedingDone: false, waterDone: false,
    shortcuts: [
      { id: 's1', name: '添加宠物', icon: '➕', url: '/pages/pets/pets', bgColor: 'rgba(255,159,90,0.15)' },
      { id: 's2', name: '提醒中心', icon: '🔔', url: '/pages/reminders/reminders', bgColor: 'rgba(255,77,79,0.12)' },
      { id: 's3', name: '健康记录', icon: '💊', url: '/pages/health/health', bgColor: 'rgba(255,181,194,0.15)' },
      { id: 's4', name: '训练打卡', icon: '🎯', url: '/pages/training/training', bgColor: 'rgba(82,196,26,0.15)' },
      { id: 's5', name: '用品库存', icon: '📦', url: '/pages/inventory/inventory', bgColor: 'rgba(250,173,20,0.15)' },
      { id: 's6', name: '宠物账本', icon: '💰', url: '/pages/expense/expense', bgColor: 'rgba(255,159,90,0.12)' },
      { id: 's7', name: '行为追踪', icon: '🐾', url: '/pages/behavior/behavior', bgColor: 'rgba(255,181,194,0.12)' },
      { id: 's8', name: '数据统计', icon: '📊', url: '/pages/stats/stats', bgColor: 'rgba(82,196,26,0.12)' },
      { id: 's9', name: 'AI 助手', icon: '🤖', url: '/pages/ai-chat/ai-chat', bgColor: 'rgba(126,200,227,0.15)' },
      { id: 's10', name: '喂食管理', icon: '🍽️', url: '/pages/feeding/feeding', bgColor: 'rgba(255,181,194,0.12)' },
      { id: 's11', name: '饮水记录', icon: '💧', url: '/pages/water/water', bgColor: 'rgba(126,200,227,0.12)' },
    ],
  },

  onLoad() { this.initGreeting(); },

  onShow() {
    // 设置 tab 选中态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadAll();
  },

  /** 下拉刷新 */
  async onPullDownRefresh() {
    await this.loadAll();
    wx.stopPullDownRefresh();
    wx.showToast({ title: '已刷新', icon: 'success', duration: 800 });
  },

  initGreeting() {
    const h = new Date().getHours();
    let g = '早上好 ☀️';
    if (h >= 12 && h < 18) g = '下午好 🌤️';
    else if (h >= 18 && h < 22) g = '傍晚好 🌅';
    else if (h >= 22) g = '夜深了 🌙';
    this.setData({ greeting: g });
  },

  async loadAll() {
    this.setData({ loading: true });
    try {
      await this.loadPets();
      await Promise.all([
        this.loadTodayCares(),
        this.loadExpenseSummary(),
        this.loadLowStock(),
        this.loadReminders(),
        this.loadAISuggestion(),
        this.loadDailySummary(),
        this.loadFeedingSummary(),
        this.loadWaterSummary(),
      ]);
    } catch(e) {
      console.error('加载数据失败:', e);
    }
    this.setData({ loading: false });
  },

  async loadPets() {
    const pets = await petService.getAllPets();
    let currentPetId = this.data.currentPetId || (pets.length > 0 ? pets[0].id : '');
    const currentPet = pets.find(p => p.id === currentPetId) || pets[0] || null;
    this.setData({ pets, currentPetId: currentPet?.id || '', currentPet });
  },

  async loadTodayCares() {
    if (!this.data.currentPetId) return;
    const tasks = await careService.getTodayCares(this.data.currentPetId);
    const cares = tasks.map(t => {
      const ct = CARE_TYPES.find(c => c.id === t.type);
      return { ...t, name: ct?.name || t.type, icon: ct?.icon || '📋' };
    }).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    const completed = cares.filter(c => c.completed).length;
    const rate = cares.length > 0 ? Math.round((completed / cares.length) * 100) : 0;
    this.setData({ todayCares: cares.slice(0, 5), careRate: rate, careTotal: cares.length, careCompleted: completed });
  },

  async loadExpenseSummary() {
    const now = new Date();
    const total = await expenseService.getMonthlyTotal(now.getFullYear(), now.getMonth() + 1);
    const cats = await expenseService.getCategoryBreakdown(now.getFullYear(), now.getMonth() + 1);
    this.setData({ monthlyExpense: total.toFixed(2), topCategories: cats.slice(0, 4) });
  },

  async loadLowStock() {
    const items = await inventoryService.getLowStockItems();
    this.setData({ lowStockItems: items.slice(0, 3), lowStockCount: items.length });
  },

  async loadReminders() {
    if (!this.data.currentPetId) return;
    const reminders = [];
    const healthRecords = await healthService.getUpcomingReminders(this.data.currentPetId);
    healthRecords.forEach(r => {
      const diff = Math.ceil((new Date(r.nextDate) - new Date()) / 86400000);
      if (diff < 0) reminders.push({ id: r.id, icon: '⚠️', text: `${r.title} 已过期 ${Math.abs(diff)} 天`, type: 'urgent' });
      else if (diff <= 30) reminders.push({ id: r.id, icon: '⏰', text: `${r.title} ${diff}天后到期`, type: 'warning' });
    });
    const lowItems = await inventoryService.getLowStockItems();
    lowItems.slice(0, 2).forEach(i => {
      reminders.push({ id: i.id, icon: '📦', text: `${i.name} 仅剩${i.currentStock}${i.unit}`, type: 'warning' });
    });
    this.setData({ reminders });
  },

  async loadAISuggestion() {
    const suggestion = await careService.getAISuggestion(this.data.currentPetId);
    this.setData({ aiSuggestion: suggestion });
  },

  async loadFeedingSummary() {
    if (!this.data.currentPetId) return;
    try {
      const todayFeedings = await feedingService.getTodayFeedings(this.data.currentPetId);
      const totalGrams = todayFeedings.reduce((s, r) => s + (r.grams || 0), 0);
      const currentHour = new Date().getHours();
      this.setData({
        todayFeedingCount: todayFeedings.length,
        todayFeedingGrams: totalGrams,
        feedingDone: todayFeedings.length >= 2 || (currentHour < 12 && todayFeedings.length >= 1),
      });
    } catch(e) {}
  },

  async loadWaterSummary() {
    if (!this.data.currentPetId) return;
    try {
      const todayWater = await waterService.getTodayWater(this.data.currentPetId);
      const intake = todayWater.filter(r => r.type === 'intake').reduce((s, r) => s + (r.amount || 0), 0);
      this.setData({
        todayWaterIntake: intake,
        waterDone: todayWater.filter(r => r.type === 'change').length > 0,
      });
    } catch(e) {}
  },

  async loadDailySummary() {
    try {
      const summary = await dailySummaryService.getDailySummary();
      this.setData({ dailySummary: summary });
    } catch(e) {}
  },

  switchPet(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentPetId) return;
    const pet = this.data.pets.find(p => p.id === id);
    this.setData({ currentPetId: id, currentPet: pet });
    wx.vibrateShort({ type: 'light' });
    this.loadTodayCares();
    this.loadReminders();
    this.loadAISuggestion();
    this.loadFeedingSummary();
    this.loadWaterSummary();
  },

  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  goCare() { wx.switchTab({ url: '/pages/care/care' }); },
  goExpense() { wx.navigateTo({ url: '/pages/expense/expense' }); },
  goInventory() { wx.navigateTo({ url: '/pages/inventory/inventory' }); },
  goPage(e) {
    const url = e.currentTarget.dataset.url;
    const tabPages = ['/pages/index/index', '/pages/care/care', '/pages/pets/pets', '/pages/profile/profile'];
    if (tabPages.includes(url)) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  },

  /** 点击照护任务快捷打卡 */
  async onQuickComplete(e) {
    const { task } = e.detail;
    await careService.completeCare(task.id);
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: `${task.name} ✓`, icon: 'success', duration: 1000 });
    this.loadTodayCares();
  },

  toggleFab() {
    this.setData({ fabOpen: !this.data.fabOpen });
    wx.vibrateShort({ type: 'light' });
  },

  fabAction(e) {
    const url = e.currentTarget.dataset.url;
    this.setData({ fabOpen: false });
    wx.navigateTo({ url });
  },
});
