const petService = require('../../services/pet-service');
const healthService = require('../../services/health-service');
const inventoryService = require('../../services/inventory-service');
const careService = require('../../services/care-service');
const feedingService = require('../../services/feeding-service');
const waterService = require('../../services/water-service');
const themeBehavior = require('../../utils/theme-behavior');
const { getDaysUntil } = require('../../utils/date-utils');

Page({
  behaviors: [themeBehavior],
  data: {
    allReminders: [], filteredReminders: [],
    urgentCount: 0, warningCount: 0, normalCount: 0,
    activeFilter: '',
  },
  onShow() { this.loadReminders(); },

  async loadReminders() {
    const pets = await petService.getAllPets();
    const reminders = [];
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // 健康提醒
    for (const pet of pets) {
      const records = await healthService.getHealthRecords(pet.id);
      records.filter(r => r.nextDate).forEach(r => {
        const days = getDaysUntil(r.nextDate);
        let level = 'normal', levelLabel = '待处理';
        if (days < 0) { level = 'urgent'; levelLabel = `已过期${Math.abs(days)}天`; }
        else if (days <= 7) { level = 'warning'; levelLabel = `${days}天后`; }
        else if (days <= 30) { levelLabel = `${days}天后`; }
        if (days <= 30) {
          reminders.push({
            id: r.id, type: 'health', icon: level === 'urgent' ? '🚨' : '💊',
            title: r.title, petName: pet.name, detail: r.clinic || '',
            dateLabel: r.nextDate, level, levelLabel,
          });
        }
      });

      // 今日照护未完成提醒
      try {
        const cares = await careService.getTodayCares(pet.id);
        const pending = cares.filter(c => !c.completed);
        if (pending.length > 0 && currentHour >= 10) {
          const level = currentHour >= 18 ? 'urgent' : 'warning';
          reminders.push({
            id: `care_${pet.id}`, type: 'care', icon: '📋',
            title: `${pending.length} 项照护未完成`, petName: pet.name,
            detail: pending.map(c => c.type).join('、'),
            dateLabel: today, level,
            levelLabel: level === 'urgent' ? '今日未完成' : '待完成',
          });
        }
      } catch(e) {}

      // 饮水异常提醒
      try {
        const anomalies = await waterService.detectAnomalies(pet.id);
        anomalies.forEach((a, i) => {
          reminders.push({
            id: `water_${pet.id}_${i}`, type: 'water', icon: a.severity === 'urgent' ? '🚨' : '💧',
            title: a.message, petName: pet.name, detail: '',
            dateLabel: today, level: a.severity === 'urgent' ? 'urgent' : 'warning',
            levelLabel: a.severity === 'urgent' ? '异常' : '注意',
          });
        });
      } catch(e) {}

      // 今日未喂食提醒（过了早餐时间还没有记录）
      try {
        if (currentHour >= 10) {
          const todayFeedings = await feedingService.getTodayFeedings(pet.id);
          if (todayFeedings.length === 0) {
            reminders.push({
              id: `feed_${pet.id}`, type: 'feeding', icon: '🍽️',
              title: '今天还没有喂食记录', petName: pet.name, detail: '',
              dateLabel: today, level: currentHour >= 14 ? 'urgent' : 'warning',
              levelLabel: '未喂食',
            });
          }
        }
      } catch(e) {}
    }

    // 库存提醒
    const lowStock = await inventoryService.getLowStockItems();
    lowStock.forEach(item => {
      reminders.push({
        id: item.id, type: 'inventory', icon: '📦',
        title: item.name, petName: item.type, detail: `剩余${item.currentStock}${item.unit}`,
        dateLabel: '需补货', level: item.currentStock <= item.restockThreshold * 0.5 ? 'urgent' : 'warning',
        levelLabel: item.currentStock <= item.restockThreshold * 0.5 ? '紧急' : '即将用完',
      });
    });

    // 排序：紧急 > 即将到期 > 普通
    const order = { urgent: 0, warning: 1, normal: 2 };
    reminders.sort((a, b) => order[a.level] - order[b.level]);

    const urgentCount = reminders.filter(r => r.level === 'urgent').length;
    const warningCount = reminders.filter(r => r.level === 'warning').length;
    const normalCount = reminders.filter(r => r.level === 'normal').length;

    this.setData({ allReminders: reminders, filteredReminders: reminders, urgentCount, warningCount, normalCount });
  },

  onFilter(e) {
    const type = e.currentTarget.dataset.type;
    const filtered = type ? this.data.allReminders.filter(r => r.type === type) : this.data.allReminders;
    this.setData({ activeFilter: type, filteredReminders: filtered });
  },

  onReminderTap(e) {
    const r = e.currentTarget.dataset.reminder;
    const urls = { health: '/pages/health/health', inventory: '/pages/inventory/inventory', care: '/pages/care/care', feeding: '/pages/feeding/feeding', water: '/pages/water/water' };
    if (urls[r.type]) wx.navigateTo({ url: urls[r.type] });
  },
});
