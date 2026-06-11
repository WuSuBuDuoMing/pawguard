/**
 * expense-service.js - 宠物开销账本服务
 * 管理支出记录、分类统计和预算
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_EXPENSES = [
  // ===== 2026年1月 =====
  { id: 'exp_001', petId: 'pet_001', category: '食物', title: '渴望猫粮', amount: 428, date: '2026-01-03', notes: '主粮', createdAt: '2026-01-03T10:00:00Z' },
  { id: 'exp_002', petId: 'pet_003', category: '食物', title: '比乐狗粮', amount: 359, date: '2026-01-03', notes: '大型犬粮 15kg', createdAt: '2026-01-03T10:00:00Z' },
  { id: 'exp_003', petId: 'pet_001', category: '用品', title: 'pidan 猫砂 x6', amount: 294, date: '2026-01-05', notes: '', createdAt: '2026-01-05T10:00:00Z' },
  { id: 'exp_004', petId: 'pet_004', category: '洗护', title: '泰迪美容', amount: 180, date: '2026-01-10', notes: '剪毛+洗澡', createdAt: '2026-01-10T10:00:00Z' },
  { id: 'exp_005', petId: 'pet_003', category: '医疗', title: '匹莫苯丹（续药）', amount: 280, date: '2026-01-15', notes: '心脏保护药', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'exp_006', petId: 'pet_001', category: '玩具', title: '猫爬架', amount: 359, date: '2026-01-20', notes: '实木款', createdAt: '2026-01-20T10:00:00Z' },
  { id: 'exp_007', petId: 'pet_003', category: '食物', title: '零食（鸡肉干+牛皮卷）', amount: 120, date: '2026-01-22', notes: '', createdAt: '2026-01-22T10:00:00Z' },
  { id: 'exp_008', petId: 'pet_002', category: '食物', title: '猫罐头', amount: 129, date: '2026-01-25', notes: '', createdAt: '2026-01-25T10:00:00Z' },

  // ===== 2026年2月 =====
  { id: 'exp_009', petId: 'pet_003', category: '食物', title: '比乐狗粮', amount: 359, date: '2026-02-02', notes: '', createdAt: '2026-02-02T10:00:00Z' },
  { id: 'exp_010', petId: 'pet_001', category: '食物', title: '渴望猫粮', amount: 428, date: '2026-02-05', notes: '', createdAt: '2026-02-05T10:00:00Z' },
  { id: 'exp_011', petId: 'pet_001', category: '用品', title: '猫砂', amount: 200, date: '2026-02-08', notes: '', createdAt: '2026-02-08T10:00:00Z' },
  { id: 'exp_012', petId: 'pet_004', category: '医疗', title: '年度体检', amount: 450, date: '2026-02-10', notes: '包括血常规、生化', createdAt: '2026-02-10T10:00:00Z' },
  { id: 'exp_013', petId: 'pet_004', category: '医疗', title: '狂犬疫苗', amount: 80, date: '2026-02-15', notes: '', createdAt: '2026-02-15T10:00:00Z' },
  { id: 'exp_014', petId: 'pet_006', category: '食物', title: '爱肯拿幼犬粮', amount: 268, date: '2026-02-18', notes: '', createdAt: '2026-02-18T10:00:00Z' },
  { id: 'exp_015', petId: 'pet_008', category: '食物', title: '狗粮 + 零食', amount: 450, date: '2026-02-20', notes: '', createdAt: '2026-02-20T10:00:00Z' },

  // ===== 2026年3月 =====
  { id: 'exp_016', petId: 'pet_003', category: '食物', title: '比乐狗粮', amount: 359, date: '2026-03-03', notes: '', createdAt: '2026-03-03T10:00:00Z' },
  { id: 'exp_017', petId: 'pet_001', category: '食物', title: '渴望猫粮 + 罐头', amount: 557, date: '2026-03-05', notes: '', createdAt: '2026-03-05T10:00:00Z' },
  { id: 'exp_018', petId: 'pet_001', category: '用品', title: '猫砂 x3', amount: 147, date: '2026-03-08', notes: '', createdAt: '2026-03-08T10:00:00Z' },
  { id: 'exp_019', petId: 'pet_006', category: '医疗', title: '年度体检', amount: 380, date: '2026-03-18', notes: '健康', createdAt: '2026-03-18T10:00:00Z' },
  { id: 'exp_020', petId: 'pet_004', category: '洗护', title: '泰迪美容', amount: 180, date: '2026-03-20', notes: '', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'exp_021', petId: 'pet_003', category: '医疗', title: '驱虫药', amount: 158, date: '2026-03-20', notes: '体内驱虫', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'exp_022', petId: 'pet_008', category: '玩具', title: '新玩具套装', amount: 85, date: '2026-03-25', notes: '', createdAt: '2026-03-25T10:00:00Z' },

  // ===== 2026年4月 =====
  { id: 'exp_023', petId: 'pet_001', category: '食物', title: '渴望猫粮', amount: 428, date: '2026-04-02', notes: '', createdAt: '2026-04-02T10:00:00Z' },
  { id: 'exp_024', petId: 'pet_003', category: '食物', title: '比乐狗粮', amount: 359, date: '2026-04-03', notes: '', createdAt: '2026-04-03T10:00:00Z' },
  { id: 'exp_025', petId: 'pet_001', category: '用品', title: '猫砂 + 清洁用品', amount: 220, date: '2026-04-05', notes: '', createdAt: '2026-04-05T10:00:00Z' },
  { id: 'exp_026', petId: 'pet_003', category: '医疗', title: '心脏复查', amount: 680, date: '2026-04-20', notes: '心脏超声+心电图', createdAt: '2026-04-20T10:00:00Z' },
  { id: 'exp_027', petId: 'pet_003', category: '医疗', title: '匹莫苯丹 + 心脏保健品', amount: 480, date: '2026-04-20', notes: '', createdAt: '2026-04-20T10:00:00Z' },
  { id: 'exp_028', petId: 'pet_004', category: '洗护', title: '泰迪美容', amount: 180, date: '2026-04-22', notes: '', createdAt: '2026-04-22T10:00:00Z' },
  { id: 'exp_029', petId: 'pet_006', category: '食物', title: '爱肯拿幼犬粮', amount: 268, date: '2026-04-25', notes: '', createdAt: '2026-04-25T10:00:00Z' },
  { id: 'exp_030', petId: 'pet_008', category: '食物', title: '狗粮', amount: 359, date: '2026-04-28', notes: '', createdAt: '2026-04-28T10:00:00Z' },
  { id: 'exp_031', petId: 'pet_008', category: '医疗', title: '关节检查', amount: 520, date: '2026-04-28', notes: '拍片+医生诊费', createdAt: '2026-04-28T10:00:00Z' },

  // ===== 2026年5月 =====
  { id: 'exp_032', petId: 'pet_001', category: '食物', title: '渴望猫粮 + 罐头', amount: 557, date: '2026-05-03', notes: '', createdAt: '2026-05-03T10:00:00Z' },
  { id: 'exp_033', petId: 'pet_003', category: '食物', title: '比乐狗粮 + 零食', amount: 504, date: '2026-05-05', notes: '', createdAt: '2026-05-05T10:00:00Z' },
  { id: 'exp_034', petId: 'pet_008', category: '医疗', title: '软骨素保健品', amount: 198, date: '2026-05-05', notes: '', createdAt: '2026-05-05T10:00:00Z' },
  { id: 'exp_035', petId: 'pet_001', category: '医疗', title: '年度体检', amount: 560, date: '2026-05-12', notes: '含血常规、生化、B超', createdAt: '2026-05-12T10:00:00Z' },
  { id: 'exp_036', petId: 'pet_001', category: '用品', title: '猫砂 + 除臭剂', amount: 196, date: '2026-05-15', notes: '', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'exp_037', petId: 'pet_003', category: '医疗', title: '驱虫（尼可信）', amount: 158, date: '2026-05-15', notes: '', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'exp_038', petId: 'pet_004', category: '医疗', title: '皮肤检查 + 药物', amount: 380, date: '2026-05-28', notes: '过敏+开药', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'exp_039', petId: 'pet_004', category: '洗护', title: '泰迪美容', amount: 180, date: '2026-05-30', notes: '', createdAt: '2026-05-30T10:00:00Z' },
  { id: 'exp_040', petId: 'pet_006', category: '食物', title: '爱肯拿幼犬粮', amount: 268, date: '2026-05-20', notes: '', createdAt: '2026-05-20T10:00:00Z' },

  // ===== 2026年6月（当月） =====
  { id: 'exp_041', petId: 'pet_001', category: '食物', title: '渴望猫粮', amount: 428, date: '2026-06-01', notes: '', createdAt: '2026-06-01T10:00:00Z' },
  { id: 'exp_042', petId: 'pet_003', category: '食物', title: '比乐狗粮', amount: 359, date: '2026-06-02', notes: '', createdAt: '2026-06-02T10:00:00Z' },
  { id: 'exp_043', petId: 'pet_004', category: '医疗', title: '抗过敏药续方', amount: 60, date: '2026-06-03', notes: '', createdAt: '2026-06-03T10:00:00Z' },
  { id: 'exp_044', petId: 'pet_001', category: '用品', title: '猫砂补充', amount: 147, date: '2026-06-05', notes: '', createdAt: '2026-06-05T10:00:00Z' },
  { id: 'exp_045', petId: 'pet_006', category: '食物', title: '爱肯拿幼犬粮', amount: 268, date: '2026-06-06', notes: '', createdAt: '2026-06-06T10:00:00Z' },
  { id: 'exp_046', petId: 'pet_008', category: '食物', title: '狗粮 + 保健品', amount: 557, date: '2026-06-07', notes: '', createdAt: '2026-06-07T10:00:00Z' },
  { id: 'exp_047', petId: 'pet_003', category: '医疗', title: '匹莫苯丹续药', amount: 280, date: '2026-06-08', notes: '', createdAt: '2026-06-08T10:00:00Z' },
  { id: 'exp_048', petId: 'pet_001', category: '玩具', title: '新猫抓板', amount: 89, date: '2026-06-08', notes: '', createdAt: '2026-06-08T10:00:00Z' },
];

function _initData() {
  const existing = storage.get(STORAGE_KEYS.EXPENSE_RECORDS);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.EXPENSE_RECORDS, MOCK_EXPENSES);
  }
}

/**
 * 获取开销记录
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<Array>} 按日期降序的开销记录
 */
async function getExpenses(petId) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  if (!petId) return all.sort((a, b) => b.date.localeCompare(a.date));
  return all.filter(e => e.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 添加开销记录
 * @param {Object} record - 开销数据
 * @returns {Promise<Object>} 添加后的记录
 */
async function addExpense(record) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  const newRecord = { ...record, id: `exp_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  all.push(newRecord);
  storage.set(STORAGE_KEYS.EXPENSE_RECORDS, all);
  return newRecord;
}

/**
 * 获取月度消费总额
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<number>} 月度总额
 */
async function getMonthlyTotal(year, month, petId) {
  await _delay(100);
  _initData();
  let all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  if (petId) all = all.filter(e => e.petId === petId);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return all.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
}

/**
 * 获取分类消费占比
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<Array<{category: string, amount: number, percentage: number}>>}
 */
async function getCategoryBreakdown(year, month, petId) {
  await _delay(100);
  _initData();
  let all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  if (petId) all = all.filter(e => e.petId === petId);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = all.filter(e => e.date.startsWith(monthStr));
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const breakdown = {};
  monthExpenses.forEach(e => {
    if (!breakdown[e.category]) breakdown[e.category] = 0;
    breakdown[e.category] += e.amount;
  });
  return Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);
}

/**
 * 获取各宠物消费占比
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @returns {Promise<Array<{petId: string, amount: number}>>}
 */
async function getPetBreakdown(year, month) {
  await _delay(100);
  const all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = all.filter(e => e.date.startsWith(monthStr));
  const breakdown = {};
  monthExpenses.forEach(e => {
    if (!breakdown[e.petId]) breakdown[e.petId] = 0;
    breakdown[e.petId] += e.amount;
  });
  return Object.entries(breakdown).map(([petId, amount]) => ({ petId, amount })).sort((a, b) => b.amount - a.amount);
}

/**
 * 获取年度消费总额
 * @param {number} year - 年份
 * @returns {Promise<number>}
 */
async function getYearlyTotal(year) {
  await _delay(100);
  const all = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  return all.filter(e => e.date.startsWith(String(year))).reduce((s, e) => s + e.amount, 0);
}

/** 月度预算设置 */
const BUDGET_KEY = 'expense_budget';

/**
 * 获取月度预算设置
 * @returns {Promise<{monthly: number, enabled: boolean}>}
 */
async function getBudget() {
  await _delay(50);
  return storage.get(BUDGET_KEY) || { monthly: 3000, enabled: true };
}

/**
 * 设置月度预算
 * @param {number} amount - 预算金额
 * @returns {Promise<{monthly: number, enabled: boolean}>}
 */
async function setBudget(amount) {
  await _delay(100);
  const budget = { monthly: amount, enabled: true };
  storage.set(BUDGET_KEY, budget);
  return budget;
}

/**
 * 获取预算执行状态
 * @returns {Promise<{budget: number, spent: number, remaining: number, percentage: number, status: string, daysLeft: number, dailyBudget: number}|null>}
 */
async function getBudgetStatus() {
  await _delay(100);
  const budget = await getBudget();
  if (!budget.enabled) return null;
  const now = new Date();
  const spent = await getMonthlyTotal(now.getFullYear(), now.getMonth() + 1);
  const remaining = budget.monthly - spent;
  const pct = budget.monthly > 0 ? Math.round((spent / budget.monthly) * 100) : 0;
  return {
    budget: budget.monthly,
    spent,
    remaining,
    percentage: pct,
    status: pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'normal',
    daysLeft: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
    dailyBudget: remaining > 0 ? Math.round(remaining / Math.max(1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate())) : 0,
  };
}

module.exports = { getExpenses, addExpense, getMonthlyTotal, getCategoryBreakdown, getPetBreakdown, getYearlyTotal, getBudget, setBudget, getBudgetStatus };
