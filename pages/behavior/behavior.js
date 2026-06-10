const petService = require('../../services/pet-service');
const behaviorService = require('../../services/behavior-service');
const themeBehavior = require('../../utils/theme-behavior');

const BEHAVIOR_ICONS = { eating: '🍖', drinking: '💧', sleeping: '😴', playing: '🎾', grooming: '✨', toilet: '🚽', social: '🤝', movement: '🏃' };

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    stats: { healthScore: 100, normal: 0, abnormal: 0 },
    abnormals: [], records: [], behaviorTypes: BEHAVIOR_ICONS, behaviorTypeList: [],
    showAbnormalModal: false,
    abnormalForm: { type: 'eating', note: '', severity: 'mild' },
    severityOptions: [
      { id: 'mild', name: '🟡 轻微 - 偶尔发生' },
      { id: 'moderate', name: '🟠 中等 - 持续数天' },
      { id: 'severe', name: '🔴 严重 - 需要就医' },
    ],
  },
  onShow() { this.init(); },
  async init() {
    const pets = await petService.getAllPets();
    const types = behaviorService.getBehaviorTypes();
    this.setData({ pets, petNames: pets.map(p => p.name), currentPetId: pets[0]?.id, currentPetName: pets[0]?.name, currentPetSpecies: pets[0]?.species || 'cat', behaviorTypeList: types });
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
    const [records, abnormals, stats] = await Promise.all([
      behaviorService.getBehaviors(pid),
      behaviorService.getAbnormalBehaviors(pid),
      behaviorService.getBehaviorStats(pid),
    ]);
    this.setData({ records: records.slice(0, 20), abnormals: abnormals.slice(0, 5), stats });
  },
  onQuickRecord(e) {
    const type = e.currentTarget.dataset.type;
    wx.showModal({
      title: `记录${type.name}`,
      editable: true,
      placeholderText: '输入观察到的行为...',
      success: async (res) => {
        if (res.confirm) {
          const now = new Date();
          await behaviorService.addBehavior({
            petId: this.data.currentPetId, type: type.id, status: 'normal',
            note: res.content || type.normal, date: now.toISOString().split('T')[0],
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          });
          wx.showToast({ title: '已记录', icon: 'success' });
          this.loadData();
        }
      }
    });
  },

  // 异常行为报告
  showAbnormal() {
    this.setData({
      showAbnormalModal: true,
      abnormalForm: { type: 'eating', note: '', severity: 'mild' },
    });
  },
  hideAbnormal() { this.setData({ showAbnormalModal: false }); },
  onAbnormalTypeChange(e) {
    const types = Object.keys(BEHAVIOR_ICONS);
    this.setData({ 'abnormalForm.type': types[e.detail.value] || 'eating' });
  },
  onSeverityChange(e) { this.setData({ 'abnormalForm.severity': this.data.severityOptions[e.detail.value].id }); },
  onAbnormalInput(e) { this.setData({ [`abnormalForm.${e.currentTarget.dataset.field}`]: e.detail.value }); },

  async onSaveAbnormal() {
    const { abnormalForm, currentPetId } = this.data;
    if (!abnormalForm.note.trim()) return wx.showToast({ title: '请描述异常行为', icon: 'none' });

    const now = new Date();
    await behaviorService.addBehavior({
      petId: currentPetId,
      type: abnormalForm.type,
      status: 'abnormal',
      severity: abnormalForm.severity,
      note: abnormalForm.note.trim(),
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    });

    this.setData({ showAbnormalModal: false });
    wx.vibrateShort({ type: 'heavy' });
    wx.showToast({ title: '异常已记录', icon: 'success' });

    // 严重异常提醒就医
    if (abnormalForm.severity === 'severe') {
      wx.showModal({
        title: '⚠️ 严重异常提醒',
        content: '您记录的异常行为较为严重，建议尽快联系兽医进行检查。\n\n本应用无法替代专业医疗诊断。',
        showCancel: false,
        confirmText: '知道了',
      });
    }

    this.loadData();
  },
});
