const petService = require('../../services/pet-service');
const diaryService = require('../../services/diary-service');
const albumService = require('../../services/album-service');
const inventoryService = require('../../services/inventory-service');
const expenseService = require('../../services/expense-service');
const careService = require('../../services/care-service');
const settingsService = require('../../services/settings-service');
const integrityService = require('../../services/data-integrity-service');
const storage = require('../../utils/storage-utils');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    petCount: 0, diaryCount: 0, photoCount: 0, careCount: 0, totalDays: 0,
    monthlyExpense: '0', lowStockCount: 0, dataScore: 0,
    badges: [
      { id: 'b1', icon: '🐾', name: '初识宠物', unlocked: true },
      { id: 'b2', icon: '📋', name: '照护达人', unlocked: false },
      { id: 'b3', icon: '💊', name: '健康管家', unlocked: false },
      { id: 'b4', icon: '🎯', name: '训练师', unlocked: false },
      { id: 'b5', icon: '💰', name: '精明铲屎官', unlocked: false },
      { id: 'b6', icon: '📝', name: '日记作者', unlocked: false },
      { id: 'b7', icon: '📷', name: '摄影大师', unlocked: false },
      { id: 'b8', icon: '🏆', name: '全能管家', unlocked: false },
    ],
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.loadStats();
  },
  async loadStats() {
    try {
      const [pets, diaries, photos, lowStock, now] = [
        await petService.getAllPets(),
        await diaryService.getDiaries(),
        await albumService.getPhotos(),
        await inventoryService.getLowStockItems(),
        new Date(),
      ];
      const monthlyTotal = await expenseService.getMonthlyTotal(now.getFullYear(), now.getMonth() + 1);
      // 模拟打卡数
      const careCount = 247;
      // 计算成就
      const badges = [...this.data.badges];
      badges[0].unlocked = pets.length > 0;
      badges[1].unlocked = careCount >= 100;
      badges[2].unlocked = true; // 有健康记录
      badges[3].unlocked = true; // 有训练记录
      badges[4].unlocked = monthlyTotal > 0;
      badges[5].unlocked = diaries.length >= 5;
      badges[6].unlocked = photos.length >= 20;
      badges[7].unlocked = badges.filter(b => b.unlocked).length >= 6;

      this.setData({
        petCount: pets.length,
        diaryCount: diaries.length,
        photoCount: photos.length,
        careCount,
        totalDays: 120, // mock
        monthlyExpense: Math.round(monthlyTotal).toLocaleString(),
        lowStockCount: lowStock.length,
        badges,
      });
    } catch (e) {
      console.error('loadStats error:', e);
    }
  },
  goPage(e) {
    const url = e.currentTarget.dataset.url;
    const tabPages = ['/pages/index/index', '/pages/care/care', '/pages/pets/pets', '/pages/profile/profile'];
    if (tabPages.includes(url)) wx.switchTab({ url });
    else wx.navigateTo({ url });
  },
  onExportData() {
    wx.showLoading({ title: '导出中...' });
    settingsService.exportData().then(data => {
      wx.hideLoading();
      const summary = `🐾 AI 宠物管家 数据报告\n` +
        `导出时间：${data.exportDate}\n` +
        `宠物：${data.pets.length} 只\n` +
        `照护记录：${data.careRecords.length} 条\n` +
        `喂食记录：${data.feedingRecords.length} 条\n` +
        `饮水记录：${data.waterRecords.length} 条\n` +
        `健康记录：${data.healthRecords.length} 条\n` +
        `训练记录：${data.trainingRecords.length} 条\n` +
        `库存物品：${data.inventoryList.length} 种\n` +
        `开销记录：${data.expenseRecords.length} 条\n` +
        `日记：${data.diaries.length} 篇\n` +
        `照片：${data.album.length} 张`;
      wx.setClipboardData({
        data: summary,
        success: () => wx.showToast({ title: '数据报告已复制', icon: 'success' }),
      });
    });
  },
  onClearCache() {
    wx.showModal({
      title: '确认清除', content: '清除后所有本地数据将被重置为初始 mock 数据。',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.loadStats();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  },
  onAbout() {
    wx.showModal({
      title: '关于 AI 宠物管家',
      content: '一款面向养宠用户和多宠家庭的智能宠物管理小程序。\n\n版本：v1.5.0\n功能：宠物档案 · 照护打卡 · 喂食管理 · 饮水管理 · 健康记录 · 训练打卡 · 用品库存 · 开销账本 · 成长日记 · 宠物相册 · AI 助手 · 全局搜索 · 提醒中心 · 数据统计 · 多物种支持\n\n⚠️ 健康模块仅提供记录和提醒功能，不替代专业兽医建议。AI 助手仅提供参考建议，不做医学诊断。',
      showCancel: false, confirmText: '知道了',
    });
  },

  async onHealthCheck() {
    wx.showLoading({ title: '检查中...' });
    try {
      const result = await integrityService.runHealthCheck();
      wx.hideLoading();
      this.setData({ dataScore: result.score });
      const issueText = result.issues.length > 0
        ? result.issues.slice(0, 5).map(i => `${i.level === 'error' ? '❌' : i.level === 'warning' ? '⚠️' : 'ℹ️'} ${i.message}`).join('\n')
        : '✅ 数据状态良好';
      wx.showModal({
        title: `数据健康度：${result.score}/100`,
        content: `${result.summary.totalIssues} 个问题\n\n${issueText}`,
        showCancel: false, confirmText: '知道了',
      });
    } catch(e) {
      wx.hideLoading();
      wx.showToast({ title: '检查失败', icon: 'none' });
    }
  },
});
