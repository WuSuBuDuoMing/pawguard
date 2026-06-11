/**
 * feeding-service.js - 喂食管理服务
 * 记录每只宠物的喂食详情：食物名称、类型、克数、时间、是否吃完、食欲状态
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

/** 食物类型 */
const FOOD_TYPES = ['主粮', '罐头', '冻干', '零食', '自制食物', '处方粮', '生骨肉', '营养膏'];

/** 食欲状态 */
const APPETITE_STATUS = ['正常', '偏少', '偏多', '不吃', '狼吞虎咽'];

/** 生成 mock 喂食记录 */
function _generateMockFeeding() {
  const records = [];
  const today = new Date();
  const petFoods = {
    'pet_001': { name: '渴望猫粮', type: '主粮', grams: 50, brand: 'Orijen' },
    'pet_002': { name: '皇家猫粮', type: '主粮', grams: 55, brand: 'Royal Canin' },
    'pet_003': { name: '比乐狗粮', type: '主粮', grams: 200, brand: 'Pure&Natural' },
    'pet_004': { name: '皇家小型犬粮', type: '主粮', grams: 60, brand: 'Royal Canin' },
    'pet_005': { name: '网易严选猫粮', type: '主粮', grams: 55, brand: '网易严选' },
    'pet_006': { name: '柴犬专用粮', type: '主粮', grams: 100, brand: '爱肯拿' },
    'pet_007': { name: '蓝氏猫粮', type: '主粮', grams: 40, brand: '蓝氏' },
    'pet_008': { name: '拉布拉多专用粮', type: '主粮', grams: 250, brand: '皇家' },
  };

  const wetFoods = [
    { name: '希宝猫罐头', type: '罐头', grams: 80 },
    { name: '巅峰牛肉冻干', type: '冻干', grams: 15 },
    { name: '鸡胸肉', type: '自制食物', grams: 30 },
    { name: '猫条', type: '零食', grams: 15 },
  ];

  for (let day = 0; day < 14; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];

    Object.entries(petFoods).forEach(([petId, food]) => {
      const isDog = ['pet_003', 'pet_004', 'pet_006', 'pet_008'].includes(petId);
      const meals = isDog ? [
        { time: '07:30', factor: 0.4 },
        { time: '12:00', factor: 0.2 },
        { time: '18:30', factor: 0.4 },
      ] : [
        { time: '08:00', factor: 0.5 },
        { time: '19:00', factor: 0.5 },
      ];

      meals.forEach((meal, mi) => {
        const isCompleted = day >= 1 || (day === 0 && new Date().getHours() >= parseInt(meal.time));
        const appetiteOptions = isCompleted ? ['正常', '正常', '正常', '正常', '偏少', '狼吞虎咽'] : [];
        const appetite = isCompleted ? appetiteOptions[Math.floor(Math.random() * appetiteOptions.length)] : '';
        const finished = isCompleted ? Math.random() > 0.15 : false;

        records.push({
          id: `feed_${petId}_${dateStr}_${mi}`,
          petId,
          date: dateStr,
          time: meal.time,
          foodName: food.name,
          foodType: food.type,
          brand: food.brand || '',
          grams: Math.round(food.grams * meal.factor),
          appetite,
          finished,
          notes: !finished && isCompleted ? '剩了一些' : '',
          createdAt: `${dateStr}T${meal.time}:00.000Z`,
        });
      });

      // 偶尔添加零食/湿粮
      if (day % 2 === 0 && Math.random() > 0.4) {
        const wet = wetFoods[Math.floor(Math.random() * wetFoods.length)];
        records.push({
          id: `feed_${petId}_${dateStr}_wet`,
          petId,
          date: dateStr,
          time: '15:00',
          foodName: wet.name,
          foodType: wet.type,
          brand: '',
          grams: wet.grams,
          appetite: '狼吞虎咽',
          finished: true,
          notes: '',
          createdAt: `${dateStr}T15:00:00.000Z`,
        });
      }
    });
  }
  return records;
}

function _initData() {
  const existing = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords');
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords', _generateMockFeeding());
  }
}

/**
 * 获取指定宠物的喂食记录
 * @param {string} petId - 宠物 ID
 * @param {string} [date] - 可选日期筛选 (YYYY-MM-DD)
 * @returns {Promise<Array>} 按日期和时间排序的喂食记录
 */
async function getFeedingRecords(petId, date) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  let filtered = all.filter(r => r.petId === petId);
  if (date) filtered = filtered.filter(r => r.date === date);
  return filtered.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.time.localeCompare(b.time);
  });
}

/**
 * 获取今日喂食记录
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Array>} 今日喂食记录
 */
async function getTodayFeedings(petId) {
  const today = new Date().toISOString().split('T')[0];
  return getFeedingRecords(petId, today);
}

/**
 * 添加喂食记录
 * @param {Object} record - 喂食数据
 * @returns {Promise<Object>} 添加后的记录
 */
async function addFeedingRecord(record) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const newRecord = {
    ...record,
    id: record.id || `feed_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newRecord);
  storage.set(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords', all);
  return newRecord;
}

/**
 * 获取喂食统计
 * @param {string} petId - 宠物 ID
 * @param {number} [days=7] - 统计天数
 * @returns {Promise<Array<{date: string, count: number, totalGrams: number, normalCount: number, abnormalCount: number}>>}
 */
async function getFeedingStats(petId, days = 7) {
  await _delay(100);
  _initData();
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const today = new Date();
  const stats = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayRecords = all.filter(r => r.petId === petId && r.date === dateStr);
    const totalGrams = dayRecords.reduce((s, r) => s + (r.grams || 0), 0);
    const normalCount = dayRecords.filter(r => r.appetite === '正常' || r.appetite === '狼吞虎咽').length;
    const abnormalCount = dayRecords.filter(r => r.appetite === '偏少' || r.appetite === '不吃').length;
    stats.push({
      date: dateStr,
      count: dayRecords.length,
      totalGrams,
      normalCount,
      abnormalCount,
    });
  }
  return stats;
}

/**
 * 获取一周食物类型分布
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Array<{type: string, grams: number}>>} 按克数降序的食物类型分布
 */
async function getFoodTypeDistribution(petId) {
  await _delay(100);
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];

  const weekRecords = all.filter(r => r.petId === petId && r.date >= weekStr);
  const distribution = {};
  weekRecords.forEach(r => {
    distribution[r.foodType] = (distribution[r.foodType] || 0) + r.grams;
  });

  return Object.entries(distribution).map(([type, grams]) => ({ type, grams }))
    .sort((a, b) => b.grams - a.grams);
}

/**
 * 删除喂食记录
 * @param {string} id - 记录 ID
 * @returns {Promise<boolean>} 是否成功删除
 */
async function deleteFeedingRecord(id) {
  await _delay(150);
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const filtered = all.filter(r => r.id !== id);
  storage.set(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords', filtered);
  return filtered.length < all.length;
}

module.exports = {
  FOOD_TYPES, APPETITE_STATUS,
  getFeedingRecords, getTodayFeedings, addFeedingRecord, deleteFeedingRecord,
  getFeedingStats, getFoodTypeDistribution,
};
