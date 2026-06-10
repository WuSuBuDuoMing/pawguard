/**
 * pages/add-health-record/add-health-record.js - 添加健康记录页面
 * 支持添加疫苗、驱虫、就诊、用药、异常观察记录
 */
const petService = require('../../services/pet-service');
const healthService = require('../../services/health-service');
const themeBehavior = require('../../utils/theme-behavior');

const TYPE_CONFIG = {
  vaccine: { label: '疫苗记录', icon: '💉', color: '#7EC8E3', fields: ['title', 'date', 'clinic', 'nextDate', 'notes'] },
  deworming: { label: '驱虫记录', icon: '🐛', color: '#52C41A', fields: ['title', 'date', 'clinic', 'nextDate', 'notes'] },
  visit: { label: '就诊记录', icon: '🏥', color: '#FF9F5A', fields: ['title', 'date', 'clinic', 'nextDate', 'notes'] },
  medication: { label: '用药记录', icon: '💊', color: '#FFB5C2', fields: ['title', 'date', 'clinic', 'notes'] },
  abnormal: { label: '异常观察', icon: '🔍', color: '#FF4D4F', fields: ['title', 'date', 'notes'] },
};

const VACCINE_TEMPLATES = [
  '猫三联（首免）', '猫三联（加强）', '猫三联（年免）',
  '犬四联', '犬六联', '犬八联',
  '狂犬疫苗', '猫五联',
];

const DEWORMING_TEMPLATES = [
  '体内驱虫（拜耳）', '体内驱虫（海乐妙）',
  '体外驱虫（福来恩）', '体外驱虫（尼可信）',
  '内外同驱（大宠爱）', '内外同驱（博来恩）',
];

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '',
    typeConfig: TYPE_CONFIG,
    recordType: 'vaccine',
    form: {
      title: '', date: '', clinic: '', nextDate: '', notes: '',
    },
    templates: VACCINE_TEMPLATES,
    showTemplates: true,
    today: '',
  },

  onLoad(options) {
    const today = new Date().toISOString().split('T')[0];
    this.setData({ today });
    if (options.type) {
      this.setData({ recordType: options.type });
    }
    this.init();
  },

  async init() {
    const pets = await petService.getAllPets();
    this.setData({
      pets, petNames: pets.map(p => p.name),
      currentPetId: pets[0]?.id,
    });
    this.updateTemplates();
  },

  onPetChange(e) {
    const idx = e.detail.value;
    this.setData({ petIndex: idx, currentPetId: this.data.pets[idx].id });
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ recordType: type, form: { title: '', date: '', clinic: '', nextDate: '', notes: '' } });
    this.updateTemplates();
  },

  updateTemplates() {
    const type = this.data.recordType;
    let templates = [];
    if (type === 'vaccine') templates = VACCINE_TEMPLATES;
    else if (type === 'deworming') templates = DEWORMING_TEMPLATES;
    this.setData({ templates, showTemplates: templates.length > 0 });
  },

  onTemplateTap(e) {
    const title = e.currentTarget.dataset.title;
    this.setData({ 'form.title': title, showTemplates: false });
  },

  onFormInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ 'form.date': e.detail.value });
  },

  onNextDateChange(e) {
    this.setData({ 'form.nextDate': e.detail.value });
  },

  toggleTemplates() {
    this.setData({ showTemplates: !this.data.showTemplates });
  },

  async onSave() {
    const { form, currentPetId, recordType } = this.data;

    if (!form.title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' });
    if (!form.date) return wx.showToast({ title: '请选择日期', icon: 'none' });

    wx.showLoading({ title: '保存中...' });

    try {
      await healthService.addHealthRecord({
        petId: currentPetId,
        type: recordType,
        title: form.title.trim(),
        date: form.date,
        clinic: form.clinic.trim() || null,
        nextDate: form.nextDate || null,
        notes: form.notes.trim() || '',
      });

      wx.hideLoading();
      wx.showToast({ title: '记录已添加 ✓', icon: 'success' });

      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },
});
