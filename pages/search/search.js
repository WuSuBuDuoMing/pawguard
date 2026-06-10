const petService = require('../../services/pet-service');
const diaryService = require('../../services/diary-service');
const healthService = require('../../services/health-service');
const expenseService = require('../../services/expense-service');
const inventoryService = require('../../services/inventory-service');
const feedingService = require('../../services/feeding-service');
const themeBehavior = require('../../utils/theme-behavior');

const HISTORY_KEY = 'searchHistory';
const HOT_KEYWORDS = ['疫苗', '驱虫', '猫粮', '体检', '训练', '驱虫过期', '库存不足', '洗澡', '呕吐', '不喝水', '掉毛'];

Page({
  behaviors: [themeBehavior],
  data: {
    keyword: '', searched: false, activeTab: '',
    searchHistory: [], hotKeywords: HOT_KEYWORDS,
    results: { pets: [], diaries: [], health: [], expenses: [], feeding: [], inventory: [] },
    resultTotal: 0,
  },
  onLoad() {
    try {
      const history = wx.getStorageSync(HISTORY_KEY) || [];
      this.setData({ searchHistory: history });
    } catch(e) {}
  },
  onInput(e) {
    this.setData({ keyword: e.detail.value });
    if (e.detail.value.length >= 2) this.doSearch(e.detail.value);
    else if (!e.detail.value) this.setData({ searched: false, results: { pets: [], diaries: [], health: [], expenses: [], feeding: [], inventory: [] }, resultTotal: 0 });
  },
  onSearch() { if (this.data.keyword) this.doSearch(this.data.keyword); },
  onClear() { this.setData({ keyword: '', searched: false, results: { pets: [], diaries: [], health: [], expenses: [] }, resultTotal: 0 }); },
  onCancel() { wx.navigateBack(); },
  onHistoryTap(e) {
    const word = e.currentTarget.dataset.word;
    this.setData({ keyword: word });
    this.doSearch(word);
  },
  clearHistory() {
    wx.removeStorageSync(HISTORY_KEY);
    this.setData({ searchHistory: [] });
  },
  onTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },

  async doSearch(kw) {
    const q = kw.toLowerCase();
    // 保存搜索历史
    let history = this.data.searchHistory.filter(h => h !== kw);
    history.unshift(kw);
    if (history.length > 15) history = history.slice(0, 15);
    try { wx.setStorageSync(HISTORY_KEY, history); } catch(e) {}
    this.setData({ searchHistory: history });

    // 并行搜索所有模块
    const [pets, diaries, allHealth, allExpenses, inventoryItems] = await Promise.all([
      petService.getAllPets(),
      diaryService.getDiaries(),
      healthService.getHealthRecords(''),
      expenseService.getExpenses(),
      inventoryService.getInventoryList(),
    ]);

    const petResults = pets.filter(p =>
      p.name.toLowerCase().includes(q) || p.breed.includes(q) ||
      (p.personality || []).some(t => t.includes(q)) || (p.notes || '').includes(q)
    );

    const diaryResults = diaries.filter(d =>
      d.title.toLowerCase().includes(q) || d.content.includes(q) ||
      (d.tags || []).some(t => t.includes(q))
    );

    // health 和 expense 需要逐个宠物查询
    const healthResults = [];
    for (const pet of pets) {
      const records = allHealth.filter(r => r.petId === pet.id);
      records.filter(r => r.title.includes(q) || (r.notes || '').includes(q) || r.type.includes(q))
        .forEach(r => healthResults.push(r));
    }

    const expenseResults = allExpenses.filter(e =>
      e.title.includes(q) || e.category.includes(q) || (e.notes || '').includes(q)
    );

    // 搜索库存
    const inventoryResults = inventoryItems.filter(i =>
      i.name.includes(q) || i.type.includes(q) || (i.brand || '').includes(q)
    );

    // 搜索喂食记录（通过食物名称）
    const feedingResults = [];
    for (const pet of pets) {
      try {
        const feedings = await feedingService.getFeedingRecords(pet.id);
        feedings.filter(f => f.foodName.includes(q) || f.foodType.includes(q) || (f.brand || '').includes(q))
          .slice(0, 5)
          .forEach(f => feedingResults.push({ ...f, petName: pet.name }));
      } catch(e) {}
    }

    const results = {
      pets: petResults, diaries: diaryResults.slice(0, 10),
      health: healthResults.slice(0, 10), expenses: expenseResults.slice(0, 10),
      feeding: feedingResults.slice(0, 10), inventory: inventoryResults.slice(0, 10),
    };
    const resultTotal = results.pets.length + results.diaries.length + results.health.length +
      results.expenses.length + results.feeding.length + results.inventory.length;

    this.setData({ results, resultTotal, searched: true, activeTab: '' });
  },

  goPet(e) { wx.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${e.currentTarget.dataset.id}` }); },
  goDiary() { wx.navigateTo({ url: '/pages/diary/diary' }); },
  goHealth() { wx.navigateTo({ url: '/pages/health/health' }); },
  goExpense() { wx.navigateTo({ url: '/pages/expense/expense' }); },
  goFeeding() { wx.navigateTo({ url: '/pages/feeding/feeding' }); },
  goInventory() { wx.navigateTo({ url: '/pages/inventory/inventory' }); },
});
