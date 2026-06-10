const expenseService = require('../../services/expense-service');
const petService = require('../../services/pet-service');
const themeBehavior = require('../../utils/theme-behavior');

const BAR_COLORS = ['#FF9F5A','#7EC8E3','#FFB5C2','#52C41A','#FAAD14','#9B59B6','#3498DB','#E74C3C'];

Page({
  behaviors: [themeBehavior],
  data: {
    year: 2026, month: 6,
    monthlyTotal: '0.00', dailyAvg: '0.00', yearlyEstimate: '0',
    recordCount: 0, categories: [], records: [],
    petBreakdown: [], barColors: BAR_COLORS, budgetStatus: null,
  },
  onLoad() {
    const now = new Date();
    this.setData({ year: now.getFullYear(), month: now.getMonth() + 1 });
  },
  onShow() { this.loadData(); },

  async prevMonth() {
    let { year, month } = this.data;
    month--; if (month < 1) { month = 12; year--; }
    this.setData({ year, month });
    this.loadData();
  },
  async nextMonth() {
    let { year, month } = this.data;
    const now = new Date();
    if (year === now.getFullYear() && month >= now.getMonth() + 1) return;
    month++; if (month > 12) { month = 1; year++; }
    this.setData({ year, month });
    this.loadData();
  },

  async loadData() {
    const { year, month } = this.data;
    const [total, categories, allRecords, petBd, pets, budgetStatus] = await Promise.all([
      expenseService.getMonthlyTotal(year, month),
      expenseService.getCategoryBreakdown(year, month),
      expenseService.getExpenses(),
      expenseService.getPetBreakdown(year, month),
      petService.getAllPets(),
      expenseService.getBudgetStatus(),
    ]);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const daysSoFar = (today.getFullYear() === year && today.getMonth() + 1 === month) ? today.getDate() : daysInMonth;
    const dailyAvg = daysSoFar > 0 ? (total / daysSoFar).toFixed(2) : '0.00';
    const yearlyEstimate = Math.round(total / Math.max(1, daysSoFar) * 365);

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const records = allRecords.filter(r => r.date.startsWith(monthStr));

    // 多宠分摊
    const totalForPct = petBd.reduce((s, p) => s + p.amount, 0);
    const petBreakdown = petBd.map(p => {
      const pet = pets.find(pp => pp.id === p.petId);
      return { ...p, name: pet?.name || p.petId, species: pet?.species || 'cat', percentage: totalForPct > 0 ? Math.round(p.amount / totalForPct * 100) : 0 };
    });

    this.setData({
      monthlyTotal: total.toFixed(2), dailyAvg, yearlyEstimate: yearlyEstimate.toLocaleString(),
      recordCount: records.length, categories, records: records.slice(0, 30), petBreakdown, budgetStatus,
    });
  },

  onEditBudget() {
    const current = this.data.budgetStatus?.budget || 3000;
    wx.showModal({
      title: '设置月度预算',
      editable: true,
      placeholderText: '请输入预算金额',
      content: String(current),
      success: async (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (!isNaN(amount) && amount > 0) {
            await expenseService.setBudget(amount);
            this.loadData();
            wx.showToast({ title: '预算已更新', icon: 'success' });
          }
        }
      }
    });
  },
});
