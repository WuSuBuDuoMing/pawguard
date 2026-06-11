/**
 * water-service.js - 饮水管理服务
 * 记录宠物的饮水/换水情况，分析饮水异常
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

/** 水源类型 */
const WATER_TYPES = ['自来水', '纯净水', '矿泉水', '过滤水', '流动饮水器'];

/** 生成 mock 饮水记录 */
function _generateMockWater() {
  const records = [];
  const today = new Date();

  // 每只宠物每天 1-3 条饮水记录
  const petWater = {
    'pet_001': { base: 180, unit: 'ml' },
    'pet_002': { base: 200, unit: 'ml' },
    'pet_003': { base: 800, unit: 'ml' },
    'pet_004': { base: 250, unit: 'ml' },
    'pet_005': { base: 220, unit: 'ml' },
    'pet_006': { base: 400, unit: 'ml' },
    'pet_007': { base: 150, unit: 'ml' },
    'pet_008': { base: 700, unit: 'ml' },
  };

  const changeTimes = ['08:00', '14:00', '20:00'];

  for (let day = 0; day < 14; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];

    Object.entries(petWater).forEach(([petId, water]) => {
      const isDog = ['pet_003', 'pet_004', 'pet_006', 'pet_008'].includes(petId);

      // 换水记录（每天 1-2 次）
      const changes = day % 2 === 0 ? 2 : 1;
      for (let c = 0; c < changes; c++) {
        const time = changeTimes[c];
        const isCompleted = day >= 1 || (day === 0 && new Date().getHours() >= parseInt(time));
        records.push({
          id: `water_change_${petId}_${dateStr}_${c}`,
          petId,
          date: dateStr,
          time,
          type: 'change',
          waterType: isDog ? '自来水' : '纯净水',
          amount: Math.round(water.base * (0.8 + Math.random() * 0.4)),
          unit: water.unit,
          isCompleted,
          notes: '',
          createdAt: `${dateStr}T${time}:00.000Z`,
        });
      }

      // 饮水量估算记录
      const variation = 0.7 + Math.random() * 0.6;
      const drank = Math.round(water.base * variation);
      const isLow = drank < water.base * 0.6;
      const isHigh = drank > water.base * 1.4;

      records.push({
        id: `water_intake_${petId}_${dateStr}`,
        petId,
        date: dateStr,
        time: '21:00',
        type: 'intake',
        amount: drank,
        unit: water.unit,
        isCompleted: day >= 1,
        isLow,
        isHigh,
        notes: isLow ? '⚠️ 饮水量偏低' : isHigh ? '⚠️ 饮水量偏高' : '正常',
        createdAt: `${dateStr}T21:00:00.000Z`,
      });
    });
  }
  return records;
}

function _initData() {
  const existing = storage.get(STORAGE_KEYS.WATER_RECORDS);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.WATER_RECORDS, _generateMockWater());
  }
}

/**
 * 获取饮水记录
 * @param {string} petId - 宠物 ID
 * @param {string} [date] - 可选日期筛选
 * @returns {Promise<Array>} 按日期和时间排序的饮水记录
 */
async function getWaterRecords(petId, date) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.WATER_RECORDS) || [];
  let filtered = all.filter(r => r.petId === petId);
  if (date) filtered = filtered.filter(r => r.date === date);
  return filtered.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.time.localeCompare(b.time);
  });
}

/**
 * 获取今日饮水记录
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Array>}
 */
async function getTodayWater(petId) {
  const today = new Date().toISOString().split('T')[0];
  return getWaterRecords(petId, today);
}

/**
 * 添加饮水/换水记录
 * @param {Object} record - 饮水数据
 * @returns {Promise<Object>} 添加后的记录
 */
async function addWaterRecord(record) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.WATER_RECORDS) || [];
  const newRecord = {
    ...record,
    id: record.id || `water_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newRecord);
  storage.set(STORAGE_KEYS.WATER_RECORDS, all);
  return newRecord;
}

/**
 * 获取每日饮水量统计
 * @param {string} petId - 宠物 ID
 * @param {number} [days=14] - 统计天数
 * @returns {Promise<Array<{date: string, intake: number, changeCount: number, hasAnomaly: boolean}>>}
 */
async function getDailyIntake(petId, days = 14) {
  await _delay(100);
  _initData();
  const all = storage.get(STORAGE_KEYS.WATER_RECORDS) || [];
  const today = new Date();
  const stats = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const intakeRecords = all.filter(r => r.petId === petId && r.date === dateStr && r.type === 'intake');
    const changeRecords = all.filter(r => r.petId === petId && r.date === dateStr && r.type === 'change');
    const totalIntake = intakeRecords.reduce((s, r) => s + (r.amount || 0), 0);
    const changeCount = changeRecords.length;
    stats.push({
      date: dateStr,
      intake: totalIntake,
      changeCount,
      hasAnomaly: intakeRecords.some(r => r.isLow || r.isHigh),
    });
  }
  return stats;
}

/**
 * 检测饮水异常
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Array<{type: string, message: string, severity: string}>>} 异常列表
 */
async function detectAnomalies(petId) {
  await _delay(100);
  const stats = await getDailyIntake(petId, 7);
  const anomalies = [];

  if (stats.length < 3) return anomalies;

  const recent = stats.slice(0, 3);
  const avg = recent.reduce((s, d) => s + d.intake, 0) / recent.length;

  // 检查连续低饮水
  const lowDays = recent.filter(d => {
    const record = d;
    return record.intake < avg * 0.6;
  });
  if (lowDays.length >= 2) {
    anomalies.push({
      type: 'low',
      message: `最近 ${lowDays.length} 天饮水量明显偏低，注意观察是否有其他异常`,
      severity: 'warning',
    });
  }

  // 检查连续高饮水
  const highDays = recent.filter(d => d.intake > avg * 1.5);
  if (highDays.length >= 2) {
    anomalies.push({
      type: 'high',
      message: `最近 ${highDays.length} 天饮水量明显偏高，可能是糖尿病或肾脏问题的信号，建议就医检查`,
      severity: 'urgent',
    });
  }

  // 检查长时间未换水
  const lastChange = stats.find(d => d.changeCount > 0);
  if (lastChange) {
    const daysSinceChange = Math.floor((new Date() - new Date(lastChange.date)) / 86400000);
    if (daysSinceChange >= 2) {
      anomalies.push({
        type: 'stale',
        message: `已经 ${daysSinceChange} 天没有换水了，建议及时更换新鲜饮水`,
        severity: 'warning',
      });
    }
  }

  return anomalies;
}

module.exports = {
  WATER_TYPES,
  getWaterRecords, getTodayWater, addWaterRecord,
  getDailyIntake, detectAnomalies,
};
