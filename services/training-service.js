/**
 * training-service.js - 训练打卡服务
 * 管理宠物训练计划、技能学习进度和徽章
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS, TRAINING_COMMANDS, BADGE_CRITERIA } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_TRAINING = [
  // ===== Lucky (金毛) 训练记录 =====
  { id: 'train_001', petId: 'pet_003', command: '坐下', date: '2026-05-20', duration: 10, success: true, reward: '鸡肉干', notes: '执行很果断', createdAt: '2026-05-20T19:00:00Z' },
  { id: 'train_002', petId: 'pet_003', command: '握手', date: '2026-05-20', duration: 15, success: true, reward: '鸡肉干', notes: '左手还不太熟练', createdAt: '2026-05-20T19:15:00Z' },
  { id: 'train_003', petId: 'pet_003', command: '召回', date: '2026-05-21', duration: 20, success: true, reward: '遛弯', notes: '在公园练习，成功率约 80%', createdAt: '2026-05-21T08:00:00Z' },
  { id: 'train_004', petId: 'pet_003', command: '等待', date: '2026-05-22', duration: 8, success: true, reward: '零食', notes: '能等待 10 秒不动', createdAt: '2026-05-22T19:00:00Z' },
  { id: 'train_005', petId: 'pet_003', command: '随行', date: '2026-05-23', duration: 15, success: false, reward: null, notes: '看到松鼠就冲出去了', createdAt: '2026-05-23T08:00:00Z' },
  { id: 'train_006', petId: 'pet_003', command: '坐下', date: '2026-05-25', duration: 5, success: true, reward: '鸡肉干', notes: '完美', createdAt: '2026-05-25T19:00:00Z' },
  { id: 'train_007', petId: 'pet_003', command: '握手', date: '2026-05-26', duration: 10, success: true, reward: '鸡肉干', notes: '左手终于会了', createdAt: '2026-05-26T19:00:00Z' },
  { id: 'train_008', petId: 'pet_003', command: '召回', date: '2026-05-27', duration: 15, success: true, reward: '遛弯', notes: '召回速度有提升', createdAt: '2026-05-27T08:00:00Z' },
  { id: 'train_009', petId: 'pet_003', command: '随行', date: '2026-05-28', duration: 20, success: true, reward: '零食', notes: '全程没松绳，进步明显', createdAt: '2026-05-28T08:00:00Z' },
  { id: 'train_010', petId: 'pet_003', command: '等待', date: '2026-05-29', duration: 8, success: true, reward: '零食', notes: '能等待 15 秒', createdAt: '2026-05-29T19:00:00Z' },
  { id: 'train_011', petId: 'pet_003', command: '坐下', date: '2026-06-01', duration: 5, success: true, reward: '鸡肉干', notes: '', createdAt: '2026-06-01T19:00:00Z' },
  { id: 'train_012', petId: 'pet_003', command: '握手', date: '2026-06-02', duration: 5, success: true, reward: '鸡肉干', notes: '左右手都能流畅执行', createdAt: '2026-06-02T19:00:00Z' },
  { id: 'train_013', petId: 'pet_003', command: '召回', date: '2026-06-03', duration: 10, success: true, reward: '遛弯', notes: '公园干扰少时 100% 成功', createdAt: '2026-06-03T08:00:00Z' },
  { id: 'train_014', petId: 'pet_003', command: '随行', date: '2026-06-05', duration: 15, success: true, reward: '零食', notes: '进步稳定', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'train_015', petId: 'pet_003', command: '等待', date: '2026-06-07', duration: 8, success: true, reward: '零食', notes: '20 秒没问题', createdAt: '2026-06-07T19:00:00Z' },
  { id: 'train_016', petId: 'pet_003', command: '坐下', date: '2026-06-08', duration: 3, success: true, reward: '鸡肉干', notes: '已形成本能反应', createdAt: '2026-06-08T19:00:00Z' },
  { id: 'train_017', petId: 'pet_003', command: '握手', date: '2026-06-08', duration: 3, success: true, reward: '鸡肉干', notes: '', createdAt: '2026-06-08T19:10:00Z' },

  // ===== 奶茶 (泰迪) 训练记录 =====
  { id: 'train_018', petId: 'pet_004', command: '坐下', date: '2026-05-25', duration: 8, success: true, reward: '小饼干', notes: '学得很快', createdAt: '2026-05-25T19:00:00Z' },
  { id: 'train_019', petId: 'pet_004', command: '握手', date: '2026-05-26', duration: 12, success: true, reward: '小饼干', notes: '主动伸爪了', createdAt: '2026-05-26T19:00:00Z' },
  { id: 'train_020', petId: 'pet_004', command: '握手', date: '2026-05-28', duration: 5, success: true, reward: '小饼干', notes: '巩固', createdAt: '2026-05-28T19:00:00Z' },
  { id: 'train_021', petId: 'pet_004', command: '召回', date: '2026-05-30', duration: 15, success: false, reward: null, notes: '注意力不集中', createdAt: '2026-05-30T19:00:00Z' },
  { id: 'train_022', petId: 'pet_004', command: '坐下', date: '2026-06-01', duration: 5, success: true, reward: '小饼干', notes: '', createdAt: '2026-06-01T19:00:00Z' },
  { id: 'train_023', petId: 'pet_004', command: '握手', date: '2026-06-03', duration: 5, success: true, reward: '小饼干', notes: '稳定', createdAt: '2026-06-03T19:00:00Z' },
  { id: 'train_024', petId: 'pet_004', command: '召回', date: '2026-06-05', duration: 10, success: true, reward: '玩具', notes: '用玩具当奖励效果好', createdAt: '2026-06-05T19:00:00Z' },
  { id: 'train_025', petId: 'pet_004', command: '等待', date: '2026-06-07', duration: 8, success: true, reward: '小饼干', notes: '能等 5 秒', createdAt: '2026-06-07T19:00:00Z' },
  { id: 'train_026', petId: 'pet_004', command: '坐下', date: '2026-06-08', duration: 3, success: true, reward: '小饼干', notes: '完美', createdAt: '2026-06-08T19:00:00Z' },

  // ===== 豆豆 (柴犬) 训练记录 =====
  { id: 'train_027', petId: 'pet_006', command: '坐下', date: '2026-05-20', duration: 15, success: true, reward: '鸡肉条', notes: '柴犬就是倔，但学会了就忘不了', createdAt: '2026-05-20T19:00:00Z' },
  { id: 'train_028', petId: 'pet_006', command: '握手', date: '2026-05-22', duration: 20, success: false, reward: null, notes: '不太愿意配合，柴犬的自尊心', createdAt: '2026-05-22T19:00:00Z' },
  { id: 'train_029', petId: 'pet_006', command: '召回', date: '2026-05-24', duration: 20, success: false, reward: null, notes: '在外面玩得太开心，不理会', createdAt: '2026-05-24T08:00:00Z' },
  { id: 'train_030', petId: 'pet_006', command: '坐下', date: '2026-05-26', duration: 10, success: true, reward: '鸡肉条', notes: '口头指令已掌握', createdAt: '2026-05-26T19:00:00Z' },
  { id: 'train_031', petId: 'pet_006', command: '握手', date: '2026-05-28', duration: 15, success: true, reward: '鸡肉条', notes: '终于愿意了！', createdAt: '2026-05-28T19:00:00Z' },
  { id: 'train_032', petId: 'pet_006', command: '随行', date: '2026-05-30', duration: 20, success: false, reward: null, notes: '看到其他狗就冲', createdAt: '2026-05-30T08:00:00Z' },
  { id: 'train_033', petId: 'pet_006', command: '坐下', date: '2026-06-01', duration: 5, success: true, reward: '鸡肉条', notes: '条件反射级别', createdAt: '2026-06-01T19:00:00Z' },
  { id: 'train_034', petId: 'pet_006', command: '握手', date: '2026-06-03', duration: 8, success: true, reward: '鸡肉条', notes: '进步中', createdAt: '2026-06-03T19:00:00Z' },
  { id: 'train_035', petId: 'pet_006', command: '召回', date: '2026-06-05', duration: 15, success: true, reward: '遛弯', notes: '在家练习成功率高', createdAt: '2026-06-05T19:00:00Z' },
  { id: 'train_036', petId: 'pet_006', command: '随行', date: '2026-06-07', duration: 15, success: true, reward: '鸡肉条', notes: '安静路段随行不错', createdAt: '2026-06-07T08:00:00Z' },
  { id: 'train_037', petId: 'pet_006', command: '坐下', date: '2026-06-08', duration: 3, success: true, reward: '鸡肉条', notes: '', createdAt: '2026-06-08T19:00:00Z' },

  // ===== 巧克力 (拉布拉多) 训练记录 =====
  { id: 'train_038', petId: 'pet_008', command: '坐下', date: '2026-05-20', duration: 5, success: true, reward: '狗粮', notes: '老狗了，服从性依然很好', createdAt: '2026-05-20T19:00:00Z' },
  { id: 'train_039', petId: 'pet_008', command: '握手', date: '2026-05-20', duration: 3, success: true, reward: '狗粮', notes: '左右手都行', createdAt: '2026-05-20T19:05:00Z' },
  { id: 'train_040', petId: 'pet_008', command: '等待', date: '2026-05-22', duration: 5, success: true, reward: '狗粮', notes: '能等 30 秒', createdAt: '2026-05-22T19:00:00Z' },
  { id: 'train_041', petId: 'pet_008', command: '召回', date: '2026-05-24', duration: 10, success: true, reward: '遛弯', notes: '听到口令立刻跑来', createdAt: '2026-05-24T08:00:00Z' },
  { id: 'train_042', petId: 'pet_008', command: '随行', date: '2026-05-26', duration: 10, success: true, reward: '遛弯', notes: '老拉布拉多的随行就是好', createdAt: '2026-05-26T08:00:00Z' },
  { id: 'train_043', petId: 'pet_008', command: '坐下', date: '2026-06-01', duration: 3, success: true, reward: '狗粮', notes: '', createdAt: '2026-06-01T19:00:00Z' },
  { id: 'train_044', petId: 'pet_008', command: '握手', date: '2026-06-01', duration: 3, success: true, reward: '狗粮', notes: '', createdAt: '2026-06-01T19:05:00Z' },
  { id: 'train_045', petId: 'pet_008', command: '等待', date: '2026-06-03', duration: 5, success: true, reward: '狗粮', notes: '40 秒', createdAt: '2026-06-03T19:00:00Z' },
  { id: 'train_046', petId: 'pet_008', command: '召回', date: '2026-06-05', duration: 5, success: true, reward: '遛弯', notes: '', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'train_047', petId: 'pet_008', command: '随行', date: '2026-06-07', duration: 8, success: true, reward: '遛弯', notes: '关节不好，散步时间缩短', createdAt: '2026-06-07T08:00:00Z' },
  { id: 'train_048', petId: 'pet_008', command: '坐下', date: '2026-06-08', duration: 3, success: true, reward: '狗粮', notes: '', createdAt: '2026-06-08T19:00:00Z' },
];

function _initData() {
  const existing = storage.get(STORAGE_KEYS.TRAINING_RECORDS);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.TRAINING_RECORDS, MOCK_TRAINING);
  }
}

/**
 * 获取指定宠物的训练记录
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Array>} 按日期降序的训练记录
 */
async function getTrainingRecords(petId) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.TRAINING_RECORDS) || [];
  return all.filter(r => r.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 添加训练记录
 * @param {Object} record - 训练数据
 * @returns {Promise<Object>} 添加后的记录
 */
async function addTrainingRecord(record) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.TRAINING_RECORDS) || [];
  const newRecord = { ...record, id: `train_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  all.push(newRecord);
  storage.set(STORAGE_KEYS.TRAINING_RECORDS, all);
  return newRecord;
}

/**
 * 获取各科目的训练进度和徽章
 * @param {string} petId - 宠物 ID
 * @returns {Promise<Object>} 按科目分组的进度数据，含 totalCount、successCount、successRate、badge
 */
async function getCommandProgress(petId) {
  await _delay(100);
  const records = await getTrainingRecords(petId);
  const progress = {};
  TRAINING_COMMANDS.forEach(cmd => {
    const cmdRecords = records.filter(r => r.command === cmd);
    const successCount = cmdRecords.filter(r => r.success).length;
    const totalCount = cmdRecords.length;
    // 计算徽章
    let badge = null;
    for (let i = BADGE_CRITERIA.length - 1; i >= 0; i--) {
      if (successCount >= BADGE_CRITERIA[i].minCount) {
        badge = BADGE_CRITERIA[i];
        break;
      }
    }
    progress[cmd] = {
      totalCount,
      successCount,
      successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
      badge,
      lastDate: cmdRecords.length > 0 ? cmdRecords[0].date : null,
    };
  });
  return progress;
}

/**
 * 获取本周训练报告
 * @param {string} petId - 宠物 ID
 * @returns {Promise<{totalSessions: number, successSessions: number, successRate: number, totalDuration: number, commands: string[]}>}
 */
async function getWeeklyReport(petId) {
  await _delay(200);
  const records = await getTrainingRecords(petId);
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekRecords = records.filter(r => new Date(r.date) >= weekAgo);
  return {
    totalSessions: weekRecords.length,
    successSessions: weekRecords.filter(r => r.success).length,
    successRate: weekRecords.length > 0 ? Math.round((weekRecords.filter(r => r.success).length / weekRecords.length) * 100) : 0,
    totalDuration: weekRecords.reduce((s, r) => s + (r.duration || 0), 0),
    commands: [...new Set(weekRecords.map(r => r.command))],
  };
}

/**
 * 获取连续训练天数
 * @param {string} petId - 宠物 ID
 * @returns {Promise<{streak: number, bestStreak: number, lastDate: string|null}>}
 */
async function getTrainingStreak(petId) {
  await _delay(100);
  const records = await getTrainingRecords(petId);
  if (records.length === 0) return { streak: 0, bestStreak: 0, lastDate: null };

  const dates = [...new Set(records.map(r => r.date))].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 从最近的日期开始计算连续天数
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (dates.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, bestStreak: Math.max(streak, dates.length > 0 ? Math.min(dates.length, 30) : 0), lastDate: dates[0] || null };
}

/**
 * 获取 AI 训练建议
 * @param {string} petId - 宠物 ID
 * @returns {Promise<string>} 训练建议文本
 */
async function getTrainingSuggestion(petId) {
  await _delay(200);
  const progress = await getCommandProgress(petId);
  const suggestions = [];

  Object.entries(progress).forEach(([cmd, data]) => {
    if (data.successRate < 50 && data.totalCount > 0) {
      suggestions.push(`${cmd} 的成功率较低 (${data.successRate}%)，建议缩短训练时间，增加奖励频率`);
    }
    if (data.totalCount === 0) {
      suggestions.push(`还没有开始 ${cmd} 的训练，建议从今天开始！`);
    }
    if (data.successRate >= 80 && data.totalCount >= 10) {
      suggestions.push(`${cmd} 已经很棒了！可以尝试在有干扰的环境下练习`);
    }
  });

  return suggestions.length > 0 ? suggestions[0] : '训练进展顺利，继续保持每天练习的好习惯！';
}

module.exports = { getTrainingRecords, addTrainingRecord, getCommandProgress, getWeeklyReport, getTrainingStreak, getTrainingSuggestion };
