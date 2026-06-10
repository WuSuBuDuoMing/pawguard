const petService = require('../../services/pet-service');
const trainingService = require('../../services/training-service');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'dog',
    records: [], commands: [], weeklyReport: null, streak: 0, suggestion: '',
    showAddModal: false,
    form: { command: '坐下', result: 'success', duration: '', note: '' },
    commandOptions: ['坐下', '握手', '召回', '等待', '随行', '趴下', '翻滚', '装死', '转圈', '跳跃'],
    resultOptions: [
      { id: 'success', name: '✅ 成功' },
      { id: 'partial', name: '⚠️ 部分完成' },
      { id: 'fail', name: '❌ 未完成' },
    ],
  },
  onShow() { this.init(); },
  async init() {
    const pets = await petService.getAllPets();
    const dogPets = pets.filter(p => p.species === 'dog');
    const target = dogPets.length > 0 ? dogPets : pets;
    this.setData({ pets: target, petNames: target.map(p => p.name), currentPetId: target[0]?.id, currentPetName: target[0]?.name, currentPetSpecies: target[0]?.species || 'dog' });
    this.loadData();
  },
  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ petIndex: idx, currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species });
    this.loadData();
  },
  onSkillTap(e) {
    const cmd = e.currentTarget.dataset.cmd;
    wx.showModal({
      title: `${cmd.command} 训练详情`,
      content: `成功 ${cmd.successCount} 次 / 总计 ${cmd.totalCount} 次\n成功率 ${cmd.successRate}%\n${cmd.badge ? '当前徽章：' + cmd.badge.icon + ' ' + cmd.badge.name : '暂无徽章'}\n${cmd.lastDate ? '最后训练：' + cmd.lastDate : ''}`,
      showCancel: false,
    });
  },
  async loadData() {
    const pid = this.data.currentPetId;
    if (!pid) return;
    const [records, progress, report, streakData, suggestion] = await Promise.all([
      trainingService.getTrainingRecords(pid),
      trainingService.getCommandProgress(pid),
      trainingService.getWeeklyReport(pid),
      trainingService.getTrainingStreak(pid),
      trainingService.getTrainingSuggestion(pid),
    ]);
    const commands = Object.entries(progress).map(([command, data]) => ({ command, ...data }));
    this.setData({ records, commands, weeklyReport: report, streak: streakData.streak, suggestion });
  },

  // 添加训练记录弹窗
  showAdd() {
    const now = new Date();
    this.setData({
      showAddModal: true,
      form: { command: '坐下', result: 'success', duration: '', note: '' },
    });
  },
  hideAdd() { this.setData({ showAddModal: false }); },
  onCommandChange(e) { this.setData({ 'form.command': this.data.commandOptions[e.detail.value] }); },
  onResultChange(e) { this.setData({ 'form.result': this.data.resultOptions[e.detail.value].id }); },
  onFormInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },

  async onSave() {
    const { form, currentPetId } = this.data;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    await trainingService.addTrainingRecord({
      petId: currentPetId,
      command: form.command,
      result: form.result,
      duration: form.duration ? parseInt(form.duration) : 0,
      note: form.note || '',
      date,
      time,
    });

    this.setData({ showAddModal: false });
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '训练记录已添加 ✓', icon: 'success' });
    this.loadData();
  },
});
