/**
 * pages/water/water.js - 饮水管理页面
 */
const petService = require('../../services/pet-service');
const waterService = require('../../services/water-service');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    todayRecords: [], anomalies: [],
    todayIntake: 0, todayChanges: 0, weekAvg: 0, weekTrend: [],
    chartWidth: 300,
    showAddModal: false,
    form: { type: 'intake', amount: '', waterType: '纯净水', time: '', notes: '' },
    recordTypes: [
      { id: 'intake', name: '💧 饮水记录', icon: '💧' },
      { id: 'change', name: '🔄 换水记录', icon: '🔄' },
    ],
    waterTypes: waterService.WATER_TYPES,
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

    const [todayRecords, dailyIntake, anomalies] = await Promise.all([
      waterService.getTodayWater(petId),
      waterService.getDailyIntake(petId, 14),
      waterService.detectAnomalies(petId),
    ]);

    const todayChanges = todayRecords.filter(r => r.type === 'change').length;
    const todayIntake = todayRecords.filter(r => r.type === 'intake').reduce((s, r) => s + (r.amount || 0), 0);

    // 一周平均
    const weekData = dailyIntake.slice(0, 7);
    const weekAvg = weekData.length > 0 ? Math.round(weekData.reduce((s, d) => s + d.intake, 0) / weekData.length) : 0;

    // 图表数据
    const weekTrend = dailyIntake.slice(0, 14).reverse().map(d => ({
      label: d.date.slice(5),
      value: d.intake,
    }));

    this.setData({
      todayRecords, anomalies,
      todayIntake, todayChanges, weekAvg, weekTrend,
    });
  },

  // 添加记录
  showAdd() {
    const now = new Date();
    this.setData({
      showAddModal: true,
      form: {
        type: 'intake', amount: '',
        waterType: '纯净水',
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        notes: '',
      },
    });
  },
  hideAdd() { this.setData({ showAddModal: false }); },
  onFormInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onTypeChange(e) { this.setData({ 'form.type': this.data.recordTypes[e.detail.value].id }); },
  onWaterTypeChange(e) { this.setData({ 'form.waterType': this.data.waterTypes[e.detail.value] }); },
  onTimeChange(e) { this.setData({ 'form.time': e.detail.value }); },

  async onSave() {
    const { form, currentPetId } = this.data;
    if (!form.amount || isNaN(parseFloat(form.amount))) return wx.showToast({ title: '请输入数量', icon: 'none' });

    await waterService.addWaterRecord({
      petId: currentPetId,
      date: new Date().toISOString().split('T')[0],
      time: form.time,
      type: form.type,
      amount: parseFloat(form.amount),
      unit: 'ml',
      waterType: form.waterType,
      isCompleted: true,
      notes: form.notes,
    });

    this.setData({ showAddModal: false });
    wx.showToast({ title: '记录已添加 ✓', icon: 'success' });
    this.loadData();
  },

  // 快捷记录
  onQuickAdd(e) {
    const amount = e.currentTarget.dataset.amount;
    const type = e.currentTarget.dataset.type;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    waterService.addWaterRecord({
      petId: this.data.currentPetId,
      date: new Date().toISOString().split('T')[0],
      time,
      type,
      amount: parseInt(amount),
      unit: 'ml',
      isCompleted: true,
      notes: '',
    }).then(() => {
      wx.showToast({ title: '记录已添加 ✓', icon: 'success' });
      this.loadData();
    });
  },
});
