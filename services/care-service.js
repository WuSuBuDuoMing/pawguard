/**
 * care-service.js - 日常照护服务
 * 管理照护任务、完成打卡和统计数据
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS, CARE_TYPES } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

/** 生成最近 14 天的照护记录 */
function _generateMockCares() {
  const records = [];
  const today = new Date();
  const petIds = ['pet_001', 'pet_002', 'pet_003', 'pet_004', 'pet_005', 'pet_006', 'pet_007', 'pet_008'];

  for (let day = 0; day < 14; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];

    for (const petId of petIds) {
      const isDog = ['pet_003', 'pet_004', 'pet_006', 'pet_008'].includes(petId);
      const isCat = !isDog;

      // 喂食 (每天2-3次)
      const feedTimes = isDog ? 3 : 2;
      for (let i = 0; i < feedTimes; i++) {
        const hours = [7, 12, 18];
        const completed = day >= 1 || (day === 0 && new Date().getHours() >= hours[i]);
        records.push({
          id: `care_${petId}_${dateStr}_feed_${i}`,
          petId, type: 'feeding', date: dateStr,
          scheduledTime: `${String(hours[i]).padStart(2, '0')}:00`,
          completed, completedAt: completed ? `${dateStr}T${String(hours[i]).padStart(2, '0')}:05:00.000Z` : null,
          notes: i === 0 ? '主粮 + 湿粮' : '主粮',
          createdAt: `${dateStr}T06:00:00.000Z`
        });
      }

      // 饮水 (每天1条记录)
      records.push({
        id: `care_${petId}_${dateStr}_water`,
        petId, type: 'water', date: dateStr,
        scheduledTime: '09:00',
        completed: day >= 1 || (day === 0 && new Date().getHours() >= 9),
        completedAt: day >= 1 ? `${dateStr}T09:10:00.000Z` : null,
        notes: `约 ${isDog ? '500ml' : '200ml'}`,
        createdAt: `${dateStr}T06:00:00.000Z`
      });

      // 遛狗 (只有狗)
      if (isDog) {
        const walkDone = day >= 1 || (day === 0 && new Date().getHours() >= 8);
        records.push({
          id: `care_${petId}_${dateStr}_walk`,
          petId, type: 'walking', date: dateStr,
          scheduledTime: '08:00',
          completed: walkDone,
          completedAt: walkDone ? `${dateStr}T08:35:00.000Z` : null,
          notes: walkDone ? `${20 + Math.floor(Math.random() * 30)}分钟` : '',
          createdAt: `${dateStr}T06:00:00.000Z`
        });
      }

      // 猫砂盆 (只有猫，每天)
      if (isCat) {
        records.push({
          id: `care_${petId}_${dateStr}_litter`,
          petId, type: 'litter_box', date: dateStr,
          scheduledTime: '10:00',
          completed: day >= 1 || (day === 0 && new Date().getHours() >= 10),
          completedAt: day >= 1 ? `${dateStr}T10:15:00.000Z` : null,
          notes: '正常排泄',
          createdAt: `${dateStr}T06:00:00.000Z`
        });
      }

      // 玩耍 (每天)
      if (day % 2 === 0 || day === 0) {
        const playDone = day >= 1;
        records.push({
          id: `care_${petId}_${dateStr}_play`,
          petId, type: 'playing', date: dateStr,
          scheduledTime: '19:00',
          completed: playDone,
          completedAt: playDone ? `${dateStr}T19:20:00.000Z` : null,
          notes: isDog ? '捡球游戏' : '逗猫棒',
          createdAt: `${dateStr}T06:00:00.000Z`
        });
      }

      // 梳毛 (每周2次)
      if (day % 3 === 0) {
        records.push({
          id: `care_${petId}_${dateStr}_groom`,
          petId, type: 'grooming', date: dateStr,
          scheduledTime: '20:00',
          completed: day >= 3,
          completedAt: day >= 3 ? `${dateStr}T20:10:00.000Z` : null,
          notes: '',
          createdAt: `${dateStr}T06:00:00.000Z`
        });
      }
    }
  }
  return records;
}

const MOCK_CARES = _generateMockCares();

function _initData() {
  const existing = storage.get(STORAGE_KEYS.CARE_RECORDS);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.CARE_RECORDS, MOCK_CARES);
  }
}

/** 获取指定日期的照护任务 */
async function getCareByDate(petId, date) {
  await _delay(100);
  _initData();
  const all = storage.get(STORAGE_KEYS.CARE_RECORDS) || [];
  return all.filter(r => r.petId === petId && r.date === date);
}

/** 获取今日照护任务 */
async function getTodayCares(petId) {
  const today = new Date().toISOString().split('T')[0];
  return getCareByDate(petId, today);
}

/** 完成照护打卡 */
async function completeCare(careId) {
  await _delay(150);
  const all = storage.get(STORAGE_KEYS.CARE_RECORDS) || [];
  const idx = all.findIndex(r => r.id === careId);
  if (idx === -1) return null;
  all[idx].completed = true;
  all[idx].completedAt = new Date().toISOString();
  storage.set(STORAGE_KEYS.CARE_RECORDS, all);
  return all[idx];
}

/** 获取照护统计 */
async function getCareStats(petId, days = 14) {
  await _delay(100);
  _initData();
  const all = storage.get(STORAGE_KEYS.CARE_RECORDS) || [];
  const today = new Date();
  const stats = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayRecords = all.filter(r => r.petId === petId && r.date === dateStr);
    const completed = dayRecords.filter(r => r.completed).length;
    stats.push({
      date: dateStr,
      total: dayRecords.length,
      completed,
      rate: dayRecords.length > 0 ? Math.round((completed / dayRecords.length) * 100) : 0,
    });
  }
  return stats;
}

/** 获取本周完成率 */
async function getWeeklyRate(petId) {
  const stats = await getCareStats(petId, 7);
  const total = stats.reduce((s, d) => s + d.total, 0);
  const completed = stats.reduce((s, d) => s + d.completed, 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/** 获取 AI 照护建议 (mock) */
async function getAISuggestion(petId) {
  await _delay(300);
  const suggestions = [
    '今天气温较高，建议增加饮水量并避免正午遛狗 🌡️',
    'Mochi 最近体重略有增长，建议减少零食投喂 🍖',
    'Lucky 该驱虫了，建议本周内安排一次体外驱虫 💊',
    '猫咪活跃度下降，可能是天气原因，观察 2-3 天如无好转请联系兽医 👀',
    '土豆 的毛发有些打结，建议今天安排一次梳毛 ✨',
    '奶茶 已经连续 5 天完成训练计划，今天可以休息一天 🎉',
  ];
  const idx = Math.floor(Math.random() * suggestions.length);
  return suggestions[idx];
}

module.exports = { getCareByDate, getTodayCares, completeCare, getCareStats, getWeeklyRate, getAISuggestion };
