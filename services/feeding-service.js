/**
 * @file feeding-service.js - 喂食管理服务
 *
 * 记录每只宠物的喂食详情并提供智能分析，包括：
 * - 喂食记录 CRUD（食物名称、类型、克数、时间、食欲状态）
 * - 今日喂食和历史记录查询
 * - 喂食统计和食物类型分布
 * - 智能喂食计划推荐（基于 7 天数据）
 * - 喂食规律性评分
 * - 饮食营养平衡分析（多样性、稳定性、综合评分）
 *
 * @module services/feeding-service
 * @version 2.15.0
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

/**
 * 获取智能喂食计划推荐
 * 基于宠物历史喂食数据、食欲状态和体重，生成科学的喂食方案
 * @param {string} petId - 宠物 ID
 * @returns {Promise<{recommendedGrams: number, meals: number, foodType: string, appetiteScore: number, tips: string[]}>}
 *   recommendedGrams - 建议每日总克数
 *   meals - 建议每日餐数
 *   foodType - 推荐食物类型
 *   appetiteScore - 食欲健康评分 (0-100)
 *   tips - 智能建议列表
 */
async function getSmartFeedingPlan(petId) {
  await _delay(200);
  _initData();
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const petRecords = all.filter(r => r.petId === petId);

  if (petRecords.length === 0) {
    return {
      recommendedGrams: 0,
      meals: 2,
      foodType: '主粮',
      appetiteScore: 0,
      tips: ['暂无喂食记录，添加记录后可获得智能推荐'],
    };
  }

  // 最近 7 天的数据
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];
  const weekRecords = petRecords.filter(r => r.date >= weekStr);

  // 计算日均摄入
  const dayMap = {};
  weekRecords.forEach(r => {
    if (!dayMap[r.date]) dayMap[r.date] = 0;
    dayMap[r.date] += r.grams || 0;
  });
  const dayTotals = Object.values(dayMap);
  const avgGrams = dayTotals.length > 0 ? Math.round(dayTotals.reduce((s, v) => s + v, 0) / dayTotals.length) : 0;

  // 计算食欲健康评分
  const appetiteScores = { '正常': 100, '狼吞虎咽': 80, '偏多': 70, '偏少': 40, '不吃': 0 };
  const appetiteEntries = weekRecords.filter(r => r.appetite);
  const avgAppetite = appetiteEntries.length > 0
    ? Math.round(appetiteEntries.reduce((s, r) => s + (appetiteScores[r.appetite] || 50), 0) / appetiteEntries.length)
    : 50;

  // 推荐食物类型（使用最多的类型）
  const typeMap = {};
  weekRecords.forEach(r => {
    typeMap[r.foodType] = (typeMap[r.foodType] || 0) + r.grams;
  });
  const topFoodType = Object.entries(typeMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '主粮';

  // 推断是猫还是狗
  const times = [...new Set(weekRecords.map(r => r.time))].sort();
  const isDogPattern = times.length >= 3;

  const tips = [];
  if (avgAppetite < 50) {
    tips.push('近期食欲偏低，建议检查食物是否新鲜，必要时咨询兽医');
  }
  const abnormalCount = weekRecords.filter(r => r.appetite === '偏少' || r.appetite === '不吃').length;
  if (abnormalCount >= 3) {
    tips.push('本周有超过 3 次食欲异常，建议观察是否有其他不适症状');
  }
  const unfinishedCount = weekRecords.filter(r => !r.finished).length;
  if (unfinishedCount >= weekRecords.length * 0.3) {
    tips.push('剩饭比例较高，可考虑适当减少每餐份量或更换口味');
  }
  if (tips.length === 0) {
    tips.push('喂食状态良好，请继续保持规律的喂食习惯');
  }

  return {
    recommendedGrams: avgGrams || 100,
    meals: isDogPattern ? 3 : 2,
    foodType: topFoodType,
    appetiteScore: avgAppetite,
    tips,
  };
}

/**
 * 获取喂食规律性评分
 * 分析最近 N 天的喂食时间一致性
 * @param {string} petId - 宠物 ID
 * @param {number} [days=7] - 分析天数
 * @returns {Promise<{score: number, regularity: string, missedMeals: number, details: string}>}
 *   score - 规律性评分 (0-100)
 *   regularity - 'excellent'(优秀), 'good'(良好), 'fair'(一般), 'poor'(较差)
 *   missedMeals - 预估漏餐次数
 *   details - 评分描述
 */
async function getFeedingRegularity(petId, days = 7) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const today = new Date();

  const dayRecords = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dayRecords[dateStr] = all.filter(r => r.petId === petId && r.date === dateStr);
  }

  let totalScore = 0;
  let missedMeals = 0;
  const allDays = Object.entries(dayRecords);

  allDays.forEach(([, records]) => {
    if (records.length === 0) {
      totalScore += 0;
      missedMeals++;
    } else {
      const hasAbnormal = records.some(r => r.appetite === '偏少' || r.appetite === '不吃');
      totalScore += hasAbnormal ? 60 : 100;
    }
  });

  const score = allDays.length > 0 ? Math.round(totalScore / allDays.length) : 0;
  let regularity = 'poor';
  if (score >= 90) regularity = 'excellent';
  else if (score >= 70) regularity = 'good';
  else if (score >= 50) regularity = 'fair';

  const detailMap = {
    excellent: '喂食非常规律，继续保持！',
    good: '喂食较为规律，偶有波动属正常',
    fair: '喂食规律性一般，建议设定固定时间提醒',
    poor: '喂食规律性较差，建议使用提醒功能固定喂食时间',
  };

  return { score, regularity, missedMeals, details: detailMap[regularity] };
}

/**
 * 获取饮食营养平衡分析
 * 分析最近 7 天的食物类型分布、摄入量波动和饮食多样性
 * @param {string} petId - 宠物 ID
 * @returns {Promise<{diversity: number, stability: number, balance: number, details: string[], warnings: string[]}>}
 *   diversity - 饮食多样性评分 (0-100)，食物种类越多分数越高
 *   stability - 摄入稳定性评分 (0-100)，每日摄入越稳定分数越高
 *   balance - 综合营养平衡评分 (0-100)
 *   details - 分析详情列表
 *   warnings - 警告信息列表
 */
async function getNutritionBalance(petId) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.FEEDING_RECORDS || 'feedingRecords') || [];
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];
  const weekRecords = all.filter(r => r.petId === petId && r.date >= weekStr);

  if (weekRecords.length === 0) {
    return { diversity: 0, stability: 0, balance: 0, details: ['暂无喂食数据，无法分析营养平衡'], warnings: [] };
  }

  // 1. 多样性评分 (0-100)
  const uniqueTypes = new Set(weekRecords.map(r => r.foodType));
  const uniqueNames = new Set(weekRecords.map(r => r.foodName));
  // 理想情况: 3-5 种食物类型, 5+ 种食物
  const diversity = Math.min(100, Math.round(
    (Math.min(uniqueTypes.size, 5) / 5 * 60) + (Math.min(uniqueNames.size, 8) / 8 * 40)
  ));

  // 2. 稳定性评分 (0-100)
  const dayGrams = {};
  weekRecords.forEach(r => {
    if (!dayGrams[r.date]) dayGrams[r.date] = 0;
    dayGrams[r.date] += r.grams || 0;
  });
  const dayValues = Object.values(dayGrams);
  const avg = dayValues.length > 0 ? dayValues.reduce((s, v) => s + v, 0) / dayValues.length : 0;
  const variance = dayValues.length > 0
    ? dayValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / dayValues.length
    : 0;
  const cv = avg > 0 ? Math.sqrt(variance) / avg : 1; // 变异系数
  // 变异系数越小越好, 0-0.1: 优秀, 0.1-0.2: 良好, 0.2-0.3: 一般, >0.3: 较差
  const stability = Math.max(0, Math.round(100 - cv * 200));

  // 3. 综合评分
  const balance = Math.round(diversity * 0.4 + stability * 0.6);

  // 4. 详情
  const details = [];
  details.push(`本周共喂食 ${weekRecords.length} 次，涉及 ${uniqueTypes.size} 种食物类型`);
  if (avg > 0) details.push(`日均摄入约 ${Math.round(avg)}g`);
  const daysRecorded = Object.keys(dayGrams).length;
  details.push(`记录天数: ${daysRecorded}/7 天`);

  // 5. 警告
  const warnings = [];
  if (uniqueTypes.size <= 1) {
    warnings.push('食物类型过于单一，建议增加食物种类以保证营养均衡');
  }
  if (cv > 0.3) {
    warnings.push('每日摄入量波动较大，建议保持规律的喂食量');
  }
  if (daysRecorded < 5) {
    warnings.push('记录天数不足，建议坚持每天记录以获得更准确的分析');
  }
  const unfinishedPct = weekRecords.filter(r => !r.finished).length / weekRecords.length;
  if (unfinishedPct > 0.2) {
    warnings.push('剩饭比例超过 20%，建议调整每餐份量或更换食物');
  }

  return { diversity, stability, balance, details, warnings };
}

module.exports = {
  FOOD_TYPES, APPETITE_STATUS,
  getFeedingRecords, getTodayFeedings, addFeedingRecord, deleteFeedingRecord,
  getFeedingStats, getFoodTypeDistribution,
  getSmartFeedingPlan, getFeedingRegularity, getNutritionBalance,
};
