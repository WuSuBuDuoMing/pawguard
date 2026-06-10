const petService = require('../../services/pet-service');
const careService = require('../../services/care-service');
const healthService = require('../../services/health-service');
const expenseService = require('../../services/expense-service');
const inventoryService = require('../../services/inventory-service');
const diaryService = require('../../services/diary-service');
const trainingService = require('../../services/training-service');
const feedingService = require('../../services/feeding-service');
const waterService = require('../../services/water-service');
const themeBehavior = require('../../utils/theme-behavior');
const { getRecentDays } = require('../../utils/date-utils');

const PET_COLORS = ['#FF9F5A','#7EC8E3','#FFB5C2','#52C41A','#FAAD14','#9B59B6','#3498DB','#E74C3C'];

Page({
  behaviors: [themeBehavior],
  data: {
    activeRange: 'month', chartWidth: 300,
    overview: { careCount: 0, trainingCount: 0, diaryCount: 0, expenseTotal: '0' },
    careTrend: [], careAvgRate: 0,
    expenseTrend: [],
    petExpenses: [],
    healthOverview: [], healthAlerts: 0,
    invTotal: 0, invHealthy: 0, invLow: 0, invHealthPct: 100,
    feedingTrend: [], avgDailyGrams: 0,
    waterTrend: [], avgDailyWater: 0,
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ chartWidth: sysInfo.windowWidth - 120 });
  },
  onShow() { this.loadAll(); },

  setRange(e) {
    this.setData({ activeRange: e.currentTarget.dataset.range });
    this.loadAll();
  },

  async loadAll() {
    const now = new Date();
    const pets = await petService.getAllPets();
    await Promise.all([
      this.loadOverview(pets),
      this.loadCareTrend(pets),
      this.loadExpenseTrend(pets),
      this.loadPetExpenses(pets),
      this.loadHealthOverview(pets),
      this.loadInventoryHealth(),
      this.loadFeedingTrend(pets),
      this.loadWaterTrend(pets),
    ]);
  },

  async loadOverview(pets) {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    let careCount = 0, trainingCount = 0, diaryCount = 0;
    for (const pet of pets) {
      const [cares, trains, diaries] = await Promise.all([
        careService.getTodayCares(pet.id),
        trainingService.getTrainingRecords(pet.id),
        diaryService.getDiaries(pet.id),
      ]);
      careCount += cares.filter(c => c.completed).length;
      trainingCount += trains.length;
      diaryCount += diaries.length;
    }
    const expenseTotal = await expenseService.getMonthlyTotal(year, month);
    this.setData({ overview: { careCount, trainingCount, diaryCount, expenseTotal: Math.round(expenseTotal).toString() } });
  },

  async loadCareTrend(pets) {
    const days = 14;
    const dates = getRecentDays(days);
    const trend = [];
    for (const date of dates) {
      let total = 0, completed = 0;
      for (const pet of pets) {
        const stats = await careService.getCareStats(pet.id, days);
        const dayStat = stats.find(s => s.date === date);
        if (dayStat) { total += dayStat.total; completed += dayStat.completed; }
      }
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      trend.push({ label: date.slice(5), value: rate });
    }
    const avg = trend.length > 0 ? Math.round(trend.reduce((s, t) => s + t.value, 0) / trend.length) : 0;
    this.setData({ careTrend: trend, careAvgRate: avg });
  },

  async loadExpenseTrend() {
    const now = new Date();
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      let m = now.getMonth() - i, y = now.getFullYear();
      if (m < 0) { m += 12; y--; }
      const total = await expenseService.getMonthlyTotal(y, m + 1);
      trend.push({ label: `${m + 1}月`, value: Math.round(total) });
    }
    this.setData({ expenseTrend: trend });
  },

  async loadPetExpenses(pets) {
    const now = new Date();
    const bd = await expenseService.getPetBreakdown(now.getFullYear(), now.getMonth() + 1);
    const total = bd.reduce((s, p) => s + p.amount, 0);
    const petExpenses = bd.map((p, i) => {
      const pet = pets.find(pp => pp.id === p.petId);
      return { ...p, name: pet?.name || p.petId, species: pet?.species || 'cat', pct: total > 0 ? Math.round(p.amount / total * 100) : 0, color: PET_COLORS[i % PET_COLORS.length] };
    });
    this.setData({ petExpenses });
  },

  async loadHealthOverview(pets) {
    let vaccines = 0, dewormings = 0, visits = 0, abnormals = 0, alerts = 0;
    for (const pet of pets) {
      const summary = await healthService.getHealthSummary(pet.id);
      vaccines += summary.vaccines;
      dewormings += summary.dewormings;
      visits += summary.visits;
      abnormals += summary.abnormals;
      const reminders = await healthService.getUpcomingReminders(pet.id);
      alerts += reminders.length;
    }
    this.setData({
      healthOverview: [
        { type: 'vaccine', icon: '💉', count: vaccines, label: '疫苗' },
        { type: 'deworming', icon: '🐛', count: dewormings, label: '驱虫' },
        { type: 'visit', icon: '🏥', count: visits, label: '就诊' },
        { type: 'abnormal', icon: '🔍', count: abnormals, label: '异常' },
      ],
      healthAlerts: alerts,
    });
  },

  async loadInventoryHealth() {
    const all = await inventoryService.getInventoryList();
    const low = await inventoryService.getLowStockItems();
    const healthy = all.length - low.length;
    const pct = all.length > 0 ? Math.round((healthy / all.length) * 100) : 100;
    this.setData({ invTotal: all.length, invHealthy: healthy, invLow: low.length, invHealthPct: pct });
  },

  async loadFeedingTrend(pets) {
    const petId = pets.length > 0 ? pets[0].id : '';
    if (!petId) return;
    try {
      const stats = await feedingService.getFeedingStats(petId, 14);
      const trend = stats.reverse().map(s => ({ label: s.date.slice(5), value: s.totalGrams }));
      const totalGrams = trend.reduce((s, t) => s + t.value, 0);
      const daysWithData = trend.filter(t => t.value > 0).length || 1;
      this.setData({ feedingTrend: trend, avgDailyGrams: Math.round(totalGrams / daysWithData) });
    } catch(e) {}
  },

  async loadWaterTrend(pets) {
    const petId = pets.length > 0 ? pets[0].id : '';
    if (!petId) return;
    try {
      const stats = await waterService.getDailyIntake(petId, 14);
      const trend = stats.reverse().map(s => ({ label: s.date.slice(5), value: s.intake }));
      const totalWater = trend.reduce((s, t) => s + t.value, 0);
      const daysWithData = trend.filter(t => t.value > 0).length || 1;
      this.setData({ waterTrend: trend, avgDailyWater: Math.round(totalWater / daysWithData) });
    } catch(e) {}
  },
});
