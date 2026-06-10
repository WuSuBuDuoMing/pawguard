const TYPE_ICONS = {
  '猫粮': '🐱', '狗粮': '🐶', '猫砂': '🧱', '零食': '🦴',
  '玩具': '🎾', '药品': '💊', '洗护用品': '🧴', '清洁用品': '🧹'
};
Component({
  properties: { item: { type: Object, value: {} } },
  data: { typeIcon: '📦', isLow: false, stockPercent: 100 },
  observers: {
    'item': function(item) {
      if (!item || !item.type) return;
      const pct = item.capacity > 0 ? Math.min(100, Math.round((item.currentStock / item.capacity) * 100)) : 100;
      this.setData({
        typeIcon: TYPE_ICONS[item.type] || '📦',
        isLow: item.currentStock <= (item.restockThreshold || 0),
        stockPercent: pct,
      });
    }
  },
  methods: { onTap() { this.triggerEvent('tap', { item: this.properties.item }); } }
});
