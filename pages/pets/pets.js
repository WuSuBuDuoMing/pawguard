const petService = require('../../services/pet-service');
const themeBehavior = require('../../utils/theme-behavior');
const { getBreedOptions } = require('../../utils/pet-utils');
const { validatePet, showErrors } = require('../../utils/validators');

const defaultForm = { name: '', species: 'cat', breed: '', gender: 'male', birthday: '', weight: '', notes: '', personality: [] };

const PERSONALITY_OPTIONS = ['粘人', '独立', '活泼', '安静', '聪明', '贪吃', '胆小', '勇敢', '爱睡觉', '好奇心强', '高冷', '温顺', '固执', '爱叫', '认生', '友善'];

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], showModal: false, editingPet: null,
    form: { ...defaultForm }, breedList: [], personalityOptions: PERSONALITY_OPTIONS,
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.loadPets();
  },
  async loadPets() {
    const pets = await petService.getAllPets();
    this.setData({ pets });
  },
  onPetTap(e) {
    const id = e.detail?.pet?.id || e.currentTarget.dataset.id;
    // 跳转到宠物详情页
    wx.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${id}` });
  },
  onAdd() { this.setData({ showModal: true, editingPet: null, form: { ...defaultForm }, breedList: getBreedOptions('cat') }); },
  hideModal() { this.setData({ showModal: false }); },
  onSpecies(e) {
    const v = e.currentTarget.dataset.v;
    this.setData({ 'form.species': v, 'form.breed': '', breedList: getBreedOptions(v) });
  },
  onGender(e) { this.setData({ 'form.gender': e.currentTarget.dataset.v }); },
  onBreedChange(e) { this.setData({ 'form.breed': this.data.breedList[e.detail.value] }); },
  onBirthday(e) { this.setData({ 'form.birthday': e.detail.value }); },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  togglePersonality(e) {
    const tag = e.currentTarget.dataset.tag;
    const personality = [...(this.data.form.personality || [])];
    const idx = personality.indexOf(tag);
    if (idx > -1) personality.splice(idx, 1);
    else if (personality.length < 5) personality.push(tag);
    else return wx.showToast({ title: '最多选 5 个标签', icon: 'none' });
    this.setData({ 'form.personality': personality });
  },
  async onSave() {
    const { form, editingPet } = this.data;
    const validation = validatePet(form);
    if (!showErrors(validation)) return;
    form.weight = parseFloat(form.weight) || 0;
    if (editingPet) {
      await petService.updatePet(editingPet.id, form);
    } else {
      await petService.addPet(form);
    }
    this.setData({ showModal: false });
    this.loadPets();
    wx.showToast({ title: editingPet ? '已更新 ✓' : '已添加 ✓', icon: 'success' });
  },
});
