const invService = require('../../services/inventory-service');
const themeBehavior = require('../../utils/theme-behavior');
const { INVENTORY_TYPES } = require('../../utils/constants');

Page({
  behaviors: [themeBehavior],
  data: {
    allItems: [], filteredItems: [], types: INVENTORY_TYPES, activeType: '', lowCount: 0,
    viewMode: 'stock', // 'stock' | 'shop'
    shoppingList: [], shoppingTotal: '0',
    checkedIds: {},
    showAddModal: false,
    form: { name: '', type: '猫粮', brand: '', currentStock: '', unit: 'kg', capacity: '', restockThreshold: '', price: '', expiryDate: '' },
  },
  onShow() { this.loadData(); },
  async onPullDownRefresh() { await this.loadData(); wx.stopPullDownRefresh(); },

  async loadData() {
    const items = await invService.getInventoryList();
    const lowItems = items.filter(i => i.currentStock <= i.restockThreshold);
    const shoppingList = lowItems.map(i => ({
      ...i, suggestedQty: Math.ceil(i.capacity - i.currentStock),
      checked: this.data.checkedIds[i.id] || false,
    }));
    const shoppingTotal = shoppingList.filter(i => !i.checked).reduce((s, i) => s + (i.price || 0), 0);
    this.setData({
      allItems: items, filteredItems: items,
      lowCount: lowItems.length, shoppingList, shoppingTotal: shoppingTotal.toString(),
    });
  },

  switchMode(e) { this.setData({ viewMode: e.currentTarget.dataset.mode }); },

  onFilter(e) {
    const type = e.currentTarget.dataset.type;
    const filtered = type ? this.data.allItems.filter(i => i.type === type) : this.data.allItems;
    this.setData({ activeType: type, filteredItems: filtered });
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const checkedIds = { ...this.data.checkedIds, [id]: !this.data.checkedIds[id] };
    const shoppingList = this.data.shoppingList.map(i => ({ ...i, checked: !!checkedIds[i.id] }));
    const shoppingTotal = shoppingList.filter(i => !i.checked).reduce((s, i) => s + (i.price || 0), 0);
    this.setData({ checkedIds, shoppingList, shoppingTotal: shoppingTotal.toString() });
    wx.vibrateShort({ type: 'light' });
  },

  // 添加库存物品
  showAdd() {
    this.setData({
      showAddModal: true,
      form: { name: '', type: '猫粮', brand: '', currentStock: '', unit: 'kg', capacity: '', restockThreshold: '', price: '', expiryDate: '' },
    });
  },
  hideAdd() { this.setData({ showAddModal: false }); },
  onFormInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onTypeChange(e) { this.setData({ 'form.type': this.data.types[e.detail.value] }); },
  onExpiryChange(e) { this.setData({ 'form.expiryDate': e.detail.value }); },

  async onSave() {
    const { form } = this.data;
    if (!form.name.trim()) return wx.showToast({ title: '请输入物品名称', icon: 'none' });
    if (!form.currentStock || isNaN(parseFloat(form.currentStock))) return wx.showToast({ title: '请输入当前库存', icon: 'none' });

    await invService.addInventoryItem({
      name: form.name.trim(),
      type: form.type,
      brand: form.brand.trim() || '',
      currentStock: parseFloat(form.currentStock),
      unit: form.unit || 'kg',
      capacity: form.capacity ? parseFloat(form.capacity) : parseFloat(form.currentStock) * 2,
      restockThreshold: form.restockThreshold ? parseFloat(form.restockThreshold) : parseFloat(form.currentStock) * 0.3,
      price: form.price ? parseFloat(form.price) : 0,
      expiryDate: form.expiryDate || null,
      purchaseDate: new Date().toISOString().split('T')[0],
    });

    this.setData({ showAddModal: false });
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '物品已添加 ✓', icon: 'success' });
    this.loadData();
  },

  // 快捷更新库存
  onUpdateStock(e) {
    const { id, name, stock } = e.currentTarget.dataset;
    wx.showModal({
      title: `更新 ${name} 库存`,
      editable: true,
      placeholderText: '输入新库存数量',
      content: String(stock),
      success: async (res) => {
        if (res.confirm && res.content) {
          const newStock = parseFloat(res.content);
          if (!isNaN(newStock) && newStock >= 0) {
            await invService.updateInventoryItem(id, { currentStock: newStock });
            wx.showToast({ title: '库存已更新', icon: 'success' });
            this.loadData();
          }
        }
      }
    });
  },
});
