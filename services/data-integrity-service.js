/**
 * data-integrity-service.js - 数据完整性检查服务
 * 检测数据一致性、异常值和潜在问题
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');
const { getDaysUntil } = require('../utils/date-utils');

function _delay(ms = 100) { return new Promise(r => setTimeout(r, ms)); }

/**
 * 执行全面的数据健康检查
 * @returns {Promise<{score: number, issues: Array, summary: Object}>}
 */
async function runHealthCheck() {
  await _delay(200);
  const issues = [];
  let score = 100;

  // 1. 检查宠物数据
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  if (pets.length === 0) {
    issues.push({ level: 'info', module: 'pets', message: '还没有添加宠物', suggestion: '点击"添加宠物"开始使用' });
  }
  pets.forEach(pet => {
    if (!pet.name) { issues.push({ level: 'error', module: 'pets', message: `宠物 ${pet.id} 缺少名字` }); score -= 5; }
    if (!pet.birthday) { issues.push({ level: 'warning', module: 'pets', message: `${pet.name} 没有设置生日` }); score -= 2; }
    if (!pet.weight || pet.weight <= 0) { issues.push({ level: 'warning', module: 'pets', message: `${pet.name} 没有记录体重` }); score -= 2; }
    if (pet.birthday && new Date(pet.birthday) > new Date()) {
      issues.push({ level: 'error', module: 'pets', message: `${pet.name} 的生日在未来` }); score -= 5;
    }
    if (pet.weight && (pet.weight > 80 || pet.weight < 0.1)) {
      issues.push({ level: 'warning', module: 'pets', message: `${pet.name} 的体重 ${pet.weight}kg 可能不准确` }); score -= 2;
    }
  });

  // 2. 检查健康记录
  const healthRecords = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
  let overdueCount = 0;
  healthRecords.forEach(r => {
    if (r.nextDate) {
      const days = getDaysUntil(r.nextDate);
      if (days < -30) {
        issues.push({ level: 'warning', module: 'health', message: `${r.title} 已过期 ${Math.abs(days)} 天` });
        overdueCount++;
        score -= 2;
      }
    }
  });

  // 3. 检查库存
  const inventory = storage.get(STORAGE_KEYS.INVENTORY_LIST) || [];
  const lowStock = inventory.filter(i => i.currentStock <= (i.restockThreshold || 0));
  if (lowStock.length > 0) {
    issues.push({ level: 'warning', module: 'inventory', message: `${lowStock.length} 种物品库存不足` });
    score -= Math.min(10, lowStock.length * 2);
  }

  // 4. 检查开销
  const expenses = storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [];
  const abnormalExpenses = expenses.filter(e => e.amount > 1000);
  if (abnormalExpenses.length > 0) {
    issues.push({ level: 'info', module: 'expense', message: `${abnormalExpenses.length} 笔大额支出（>¥1000）` });
  }

  // 5. 检查照护完成率
  const careRecords = storage.get(STORAGE_KEYS.CARE_RECORDS) || [];
  const today = new Date().toISOString().split('T')[0];
  const todayCares = careRecords.filter(r => r.date === today);
  const incompleteToday = todayCares.filter(r => !r.completed);
  if (incompleteToday.length > 3) {
    issues.push({ level: 'warning', module: 'care', message: `今日还有 ${incompleteToday.length} 项照护未完成` });
    score -= 3;
  }

  score = Math.max(0, Math.min(100, score));

  // 6. 检查喂食记录
  const feedingRecords = storage.get(STORAGE_KEYS.FEEDING_RECORDS) || [];
  const todayFeedings = feedingRecords.filter(r => r.date === today);
  const abnormalAppetite = todayFeedings.filter(r => r.appetite === '不吃' || r.appetite === '偏少');
  if (abnormalAppetite.length > 0) {
    issues.push({ level: 'warning', module: 'feeding', message: `今日有 ${abnormalAppetite.length} 条食欲异常记录` });
    score -= 2;
  }

  // 7. 检查饮水异常
  const waterRecords = storage.get(STORAGE_KEYS.WATER_RECORDS) || [];
  const todayWater = waterRecords.filter(r => r.date === today);
  const lowWater = todayWater.filter(r => r.isLow);
  if (lowWater.length > 0) {
    issues.push({ level: 'warning', module: 'water', message: '今日饮水量偏低' });
    score -= 2;
  }

  return {
    score,
    issues: issues.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return (order[a.level] || 3) - (order[b.level] || 3);
    }),
    summary: {
      totalIssues: issues.length,
      errors: issues.filter(i => i.level === 'error').length,
      warnings: issues.filter(i => i.level === 'warning').length,
      infos: issues.filter(i => i.level === 'info').length,
      pets: pets.length,
      healthRecords: healthRecords.length,
      inventoryItems: inventory.length,
      expenses: expenses.length,
      feedingRecords: feedingRecords.length,
      waterRecords: waterRecords.length,
    },
  };
}

/**
 * 检查单个模块的数据一致性
 * @param {string} module - 模块名
 * @returns {Promise<Array>}
 */
async function checkModule(module) {
  await _delay(100);
  const checks = {
    pets: () => {
      const data = storage.get(STORAGE_KEYS.PET_LIST) || [];
      const ids = new Set();
      return data.filter(p => {
        if (ids.has(p.id)) return true;
        ids.add(p.id);
        return false;
      }).map(p => ({ level: 'error', message: `重复的宠物ID: ${p.id}` }));
    },
    health: () => {
      const data = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
      const petIds = new Set((storage.get(STORAGE_KEYS.PET_LIST) || []).map(p => p.id));
      return data.filter(r => !petIds.has(r.petId)).map(r => ({
        level: 'warning', message: `健康记录 ${r.id} 关联的宠物不存在`,
      }));
    },
  };
  return checks[module] ? checks[module]() : [];
}

module.exports = { runHealthCheck, checkModule };
