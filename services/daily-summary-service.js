/**
 * daily-summary-service.js - 每日摘要服务
 * 生成每日待办事项和完成情况汇总
 */

const petService = require('./pet-service');
const careService = require('./care-service');
const healthService = require('./health-service');
const inventoryService = require('./inventory-service');
const expenseService = require('./expense-service');
const { CARE_TYPES } = require('../utils/constants');
const { getDaysUntil, formatDate } = require('../utils/date-utils');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

/**
 * 生成今日摘要
 * @returns {Promise<Object>}
 */
async function getDailySummary() {
  await _delay(300);
  const pets = await petService.getAllPets();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const summary = {
    date: todayStr,
    greeting: getGreeting(),
    totalPets: pets.length,
    tasks: { total: 0, completed: 0, pending: 0, items: [] },
    reminders: [],
    expenses: { today: 0, month: 0 },
    highlights: [],
  };

  // 汇总照护任务
  for (const pet of pets) {
    const cares = await careService.getTodayCares(pet.id);
    cares.forEach(c => {
      const ct = CARE_TYPES.find(t => t.id === c.type);
      summary.tasks.total++;
      if (c.completed) summary.tasks.completed++;
      else summary.tasks.pending++;
      if (!c.completed) {
        summary.tasks.items.push({
          petName: pet.name, petSpecies: pet.species,
          taskName: ct?.name || c.type, icon: ct?.icon || '📋',
          time: c.scheduledTime,
        });
      }
    });
  }

  // 汇总健康提醒
  for (const pet of pets) {
    const reminders = await healthService.getUpcomingReminders(pet.id);
    reminders.forEach(r => {
      const days = getDaysUntil(r.nextDate);
      if (days <= 7) {
        summary.reminders.push({
          petName: pet.name, title: r.title, days, isOverdue: days < 0,
        });
      }
    });
  }

  // 汇总库存预警
  const lowStock = await inventoryService.getLowStockItems();
  lowStock.forEach(item => {
    summary.reminders.push({
      petName: item.type, title: `${item.name} 库存不足`, days: 0, isInventory: true,
    });
  });

  // 今日开销
  const todayExpenses = (await expenseService.getExpenses()).filter(e => e.date === todayStr);
  summary.expenses.today = todayExpenses.reduce((s, e) => s + e.amount, 0);
  summary.expenses.month = await expenseService.getMonthlyTotal(today.getFullYear(), today.getMonth() + 1);

  // 生成亮点
  if (summary.tasks.completed > 0) {
    summary.highlights.push(`✅ 已完成 ${summary.tasks.completed} 项照护任务`);
  }
  if (summary.tasks.pending > 0) {
    summary.highlights.push(`📋 还有 ${summary.tasks.pending} 项待完成`);
  }
  if (summary.reminders.length > 0) {
    const urgent = summary.reminders.filter(r => r.isOverdue).length;
    if (urgent > 0) summary.highlights.push(`🚨 ${urgent} 条紧急提醒`);
  }
  if (lowStock.length > 0) {
    summary.highlights.push(`📦 ${lowStock.length} 种物品需要补货`);
  }

  return summary;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，注意休息 🌙';
  if (h < 9) return '早安，新的一天开始了 ☀️';
  if (h < 12) return '上午好，今天也要好好照顾毛孩子们 🌤️';
  if (h < 14) return '中午好，别忘了喂饭哦 🍽️';
  if (h < 18) return '下午好，带毛孩子出去走走吧 🌅';
  if (h < 21) return '傍晚好，今晚和宠物一起放松吧 🌆';
  return '晚安，明天继续做个好铲屎官 🌙';
}

module.exports = { getDailySummary };
