/**
 * @file pages/feeding/feeding.js - 喂食管理页面
 *
 * 管理宠物喂食记录和饮食分析，包括：
 * - 今日喂食记录与汇总
 * - 营养平衡分析（多样性、稳定性、综合评分）
 * - 一周趋势图表和食物类型分布
 * - 喂食历史记录
 * - 快速添加常用食物
 *
 * @module pages/feeding
 * @version 2.15.0
 */
const petService = require('../../services/pet-service');
const feedingService = require('../../services/feeding-service');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    todayFeedings: [], weekStats: [], foodDistribution: [],
    totalTodayGrams: 0, todayMealCount: 0, normalPct: 100,
    showAddModal: false,
    form: { foodName: '', foodType: '主粮', grams: '', time: '', appetite: '正常', finished: true, notes: '' },
    foodTypes: feedingService.FOOD_TYPES,
    appetiteOptions: feedingService.APPETITE_STATUS,
    activeTab: 'today', // 'today' | 'history' | 'stats'
    historyRecords: [],
    nutritionBalance: null,
    chartWidth: 300,
  },

  onShow() { this.init(); },

  async init() {
    const pets = await petService.getAllPets();
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      pets, petNames: pets.map(p => p.name),
      currentPetId: pets[0]?.id, currentPetName: pets[0]?.name,
      currentPetSpecies: pets[0]?.species || 'cat',
      chartWidth: sysInfo.windowWidth - 80,
    });
    this.loadData();
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

    const [todayFeedings, weekStats, foodDist, nutritionBalance] = await Promise.all([
      feedingService.getTodayFeedings(petId),
      feedingService.getFeedingStats(petId, 7),
      feedingService.getFoodTypeDistribution(petId),
      feedingService.getNutritionBalance(petId),
    ]);

    const totalGrams = todayFeedings.reduce((s, r) => s + (r.grams || 0), 0);
    const normalCount = todayFeedings.filter(r => r.appetite === '正常' || r.appetite === '狼吞虎咽').length;
    const normalPct = todayFeedings.length > 0 ? Math.round((normalCount / todayFeedings.length) * 100) : 100;

    // 生成图表数据
    const trendData = weekStats.reverse().map(s => ({
      label: s.date.slice(5),
      value: s.totalGrams,
    }));

    this.setData({
      todayFeedings, weekStats, foodDistribution: foodDist, nutritionBalance,
      totalTodayGrams: totalGrams, todayMealCount: todayFeedings.length,
      normalPct, historyRecords: todayFeedings, trendData,
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'history') this.loadHistory();
  },

  async loadHistory() {
    const records = await feedingService.getFeedingRecords(this.data.currentPetId);
    this.setData({ historyRecords: records.slice(0, 50) });
  },

  // 添加记录弹窗
  showAdd() {
    const now = new Date();
    this.setData({
      showAddModal: true,
      form: {
        foodName: '', foodType: '主粮', grams: '',
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        appetite: '正常', finished: true, notes: '',
      },
    });
  },
  hideAdd() { this.setData({ showAddModal: false }); },
  onFormInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onFoodTypeChange(e) { this.setData({ 'form.foodType': this.data.foodTypes[e.detail.value] }); },
  onAppetiteChange(e) { this.setData({ 'form.appetite': this.data.appetiteOptions[e.detail.value] }); },
  onTimeChange(e) { this.setData({ 'form.time': e.detail.value }); },
  onFinishedChange(e) { this.setData({ 'form.finished': e.detail.value }); },

  async onSaveFeeding() {
    const { form, currentPetId } = this.data;
    if (!form.foodName) return wx.showToast({ title: '请输入食物名称', icon: 'none' });
    if (!form.grams || isNaN(parseFloat(form.grams))) return wx.showToast({ title: '请输入克数', icon: 'none' });

    await feedingService.addFeedingRecord({
      petId: currentPetId,
      date: new Date().toISOString().split('T')[0],
      time: form.time,
      foodName: form.foodName,
      foodType: form.foodType,
      grams: parseFloat(form.grams),
      appetite: form.appetite,
      finished: form.finished,
      notes: form.notes,
    });

    this.setData({ showAddModal: false });
    wx.showToast({ title: '记录已添加 ✓', icon: 'success' });
    this.loadData();
  },

  // 快捷添加常用食物
  async onQuickFood(e) {
    const { name, type, grams } = e.currentTarget.dataset;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    await feedingService.addFeedingRecord({
      petId: this.data.currentPetId,
      date: new Date().toISOString().split('T')[0],
      time,
      foodName: name,
      foodType: type,
      grams: parseFloat(grams),
      appetite: '正常',
      finished: true,
      notes: '',
    });

    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: `${name} 已记录 ✓`, icon: 'success' });
    this.loadData();
  },
});
