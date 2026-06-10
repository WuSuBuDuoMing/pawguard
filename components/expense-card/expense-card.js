const CAT_ICONS = {
  '食物': '🍖', '医疗': '🏥', '洗护': '🧴', '玩具': '🎾',
  '用品': '📦', '寄养': '🏠', '保险': '🛡️', '其他': '💡'
};
Component({
  properties: { record: { type: Object, value: {} } },
  data: { categoryIcon: '💡' },
  observers: { 'record.category'(cat) { this.setData({ categoryIcon: CAT_ICONS[cat] || '💡' }); } },
  methods: { onTap() { this.triggerEvent('tap', { record: this.properties.record }); } }
});
