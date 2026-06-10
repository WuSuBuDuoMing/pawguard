const petService = require('../../services/pet-service');
const healthService = require('../../services/health-service');
const themeBehavior = require('../../utils/theme-behavior');
const { getDaysUntil } = require('../../utils/date-utils');

const TYPE_COLORS = {
  vaccine: '#7EC8E3', deworming: '#52C41A',
  visit: '#FF9F5A', medication: '#FFB5C2', abnormal: '#FF4D4F'
};
const TYPE_LABELS = {
  vaccine: '疫苗', deworming: '驱虫', visit: '就诊', medication: '用药', abnormal: '异常观察'
};

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    allRecords: [], filteredRecords: [], activeFilter: '', summaryItems: [],
    urgentReminders: [], typeColors: TYPE_COLORS, typeLabels: TYPE_LABELS,
    weightHistory: [], currentWeight: 0, weightTrend: '', chartWidth: 300,
    loading: true,
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ chartWidth: sysInfo.windowWidth - 120 });
  },
  onShow() { this.init(); },
  async init() {
    const pets = await petService.getAllPets();
    this.setData({ pets, petNames: pets.map(p => p.name), currentPetId: pets[0]?.id, currentPetName: pets[0]?.name, currentPetSpecies: pets[0]?.species || 'cat' });
    this.loadData();
  },
  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ petIndex: idx, currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species, activeFilter: '' });
    this.loadData();
  },
  async loadData() {
    this.setData({ loading: true });
    try {
      const [records, summary, weightHistory] = await Promise.all([
        healthService.getHealthRecords(this.data.currentPetId),
        healthService.getHealthSummary(this.data.currentPetId),
        petService.getWeightHistory(this.data.currentPetId),
      ]);
    // 处理记录状态
    const processedRecords = records.map(r => ({
      ...r,
      _isOverdue: r.nextDate ? getDaysUntil(r.nextDate) < 0 : false,
      _isUpcoming: r.nextDate ? (getDaysUntil(r.nextDate) >= 0 && getDaysUntil(r.nextDate) <= 30) : false,
    }));
    // 紧急提醒
    const urgentReminders = processedRecords.filter(r => r._isOverdue || r._isUpcoming).slice(0, 3);
    const summaryItems = [
      { key: 'vaccine', label: '疫苗', count: summary.vaccines, color: TYPE_COLORS.vaccine },
      { key: 'deworming', label: '驱虫', count: summary.dewormings, color: TYPE_COLORS.deworming },
      { key: 'visit', label: '就诊', count: summary.visits, color: TYPE_COLORS.visit },
      { key: 'abnormal', label: '异常', count: summary.abnormals, color: TYPE_COLORS.abnormal },
    ];

    // 体重趋势
    let currentWeight = 0, weightTrend = '', weightChartData = [];
    if (weightHistory.length > 0) {
      currentWeight = weightHistory[weightHistory.length - 1].weight;
      weightChartData = weightHistory.map(w => ({ label: w.date.slice(5), value: w.weight }));
      if (weightHistory.length >= 2) {
        const diff = weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight;
        weightTrend = diff > 0 ? `📈 +${diff.toFixed(1)}kg` : diff < 0 ? `📉 ${diff.toFixed(1)}kg` : '➡️ 稳定';
      }
    }

    this.setData({
      allRecords: processedRecords, filteredRecords: processedRecords, summaryItems, urgentReminders,
      weightHistory: weightChartData, currentWeight, weightTrend, loading: false,
    });
    } catch(e) {
      console.error('loadData error:', e);
      this.setData({ loading: false });
    }
  },
  onFilter(e) {
    const type = e.currentTarget.dataset.type;
    const filtered = type ? this.data.allRecords.filter(r => r.type === type) : this.data.allRecords;
    this.setData({ activeFilter: type, filteredRecords: filtered });
  },
  onRecordTap(e) {
    const record = e.currentTarget.dataset.record;
    wx.showModal({ title: record.title, content: record.notes || '暂无备注', showCancel: false });
  },

  onAddRecord() {
    wx.navigateTo({ url: '/pages/add-health-record/add-health-record' });
  },

  // 快速记录体重
  onRecordWeight() {
    const currentWeight = this.data.currentWeight || '';
    wx.showModal({
      title: '记录体重 (kg)',
      editable: true,
      placeholderText: '输入当前体重',
      content: String(currentWeight),
      success: async (res) => {
        if (res.confirm && res.content) {
          const weight = parseFloat(res.content);
          if (!isNaN(weight) && weight > 0 && weight < 100) {
            await petService.recordWeight(this.data.currentPetId, weight);
            wx.vibrateShort({ type: 'medium' });
            wx.showToast({ title: `体重已记录: ${weight}kg`, icon: 'success' });
            this.loadData();
          }
        }
      }
    });
  },
});
