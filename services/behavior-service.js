/**
 * behavior-service.js - 宠物行为追踪服务
 * 记录宠物日常行为模式，检测异常行为
 */

const storage = require('../utils/storage-utils');
const { generateId } = require('../utils/mock-utils');

function _delay(ms = 150) { return new Promise(r => setTimeout(r, ms)); }

const BEHAVIOR_TYPES = [
  { id: 'eating', name: '进食', icon: '🍖', normal: '正常进食', abnormal: ['拒食', '暴食', '只吃零食'] },
  { id: 'drinking', name: '饮水', icon: '💧', normal: '正常饮水', abnormal: ['饮水过多', '饮水过少'] },
  { id: 'sleeping', name: '睡眠', icon: '😴', normal: '正常睡眠', abnormal: ['嗜睡', '失眠', '呼吸异常'] },
  { id: 'playing', name: '玩耍', icon: '🎾', normal: '正常玩耍', abnormal: ['无精打采', '过度兴奋', '攻击性增强'] },
  { id: 'grooming', name: '自理', icon: '✨', normal: '正常自理', abnormal: ['过度舔毛', '不舔毛', '蹭屁股'] },
  { id: 'toilet', name: '排泄', icon: '🚽', normal: '正常排泄', abnormal: ['腹泻', '便秘', '尿频', '血尿'] },
  { id: 'social', name: '社交', icon: '🤝', normal: '正常社交', abnormal: ['躲避人类', '攻击同类', '过度粘人'] },
  { id: 'movement', name: '活动', icon: '🏃', normal: '正常活动', abnormal: ['跛行', '不愿动', '转圈', '歪头'] },
];

const MOCK_BEHAVIORS = [
  { id: 'bh_001', petId: 'pet_001', type: 'eating', status: 'normal', note: '今天胃口不错，猫粮吃了一半', date: '2026-06-09', time: '08:30', createdAt: '2026-06-09T08:30:00Z' },
  { id: 'bh_002', petId: 'pet_001', type: 'sleeping', status: 'normal', note: '在窗台晒太阳睡了一下午', date: '2026-06-09', time: '14:00', createdAt: '2026-06-09T14:00:00Z' },
  { id: 'bh_003', petId: 'pet_003', type: 'movement', status: 'abnormal', note: '遛弯时左后腿偶尔跛行，需要关注', date: '2026-06-09', time: '07:30', createdAt: '2026-06-09T07:30:00Z' },
  { id: 'bh_004', petId: 'pet_003', type: 'eating', status: 'normal', note: '早餐全部吃完', date: '2026-06-09', time: '08:00', createdAt: '2026-06-09T08:00:00Z' },
  { id: 'bh_005', petId: 'pet_005', type: 'eating', status: 'abnormal', note: '连续第三天食欲不振，只吃了几口', date: '2026-06-09', time: '09:00', createdAt: '2026-06-09T09:00:00Z' },
  { id: 'bh_006', petId: 'pet_005', type: 'toilet', status: 'normal', note: '排泄正常', date: '2026-06-09', time: '10:00', createdAt: '2026-06-09T10:00:00Z' },
  { id: 'bh_007', petId: 'pet_004', type: 'grooming', status: 'abnormal', note: '又在抓耳朵附近，过敏药还需要继续吃', date: '2026-06-09', time: '11:00', createdAt: '2026-06-09T11:00:00Z' },
  { id: 'bh_008', petId: 'pet_006', type: 'social', status: 'normal', note: '散步时遇到其他狗，友好互动', date: '2026-06-09', time: '08:00', createdAt: '2026-06-09T08:00:00Z' },
  { id: 'bh_009', petId: 'pet_007', type: 'social', status: 'abnormal', note: '来客人了，躲到床底下不出来', date: '2026-06-08', time: '15:00', createdAt: '2026-06-08T15:00:00Z' },
  { id: 'bh_010', petId: 'pet_008', type: 'movement', status: 'normal', note: '散步 20 分钟，状态不错', date: '2026-06-09', time: '07:00', createdAt: '2026-06-09T07:00:00Z' },
  { id: 'bh_011', petId: 'pet_002', type: 'playing', status: 'normal', note: '追了半小时激光笔，累趴了', date: '2026-06-08', time: '20:00', createdAt: '2026-06-08T20:00:00Z' },
  { id: 'bh_012', petId: 'pet_001', type: 'grooming', status: 'abnormal', note: '吐了毛球，需要加强梳毛', date: '2026-06-07', time: '16:00', createdAt: '2026-06-07T16:00:00Z' },
];

const BEHAVIOR_STORAGE_KEY = 'behaviorRecords';

function _initData() {
  const existing = storage.get(BEHAVIOR_STORAGE_KEY);
  if (!existing || existing.length === 0) {
    storage.set(BEHAVIOR_STORAGE_KEY, MOCK_BEHAVIORS);
  }
}

async function getBehaviors(petId) {
  await _delay(100);
  _initData();
  const all = storage.get(BEHAVIOR_STORAGE_KEY) || [];
  if (!petId) return all.sort((a, b) => b.date.localeCompare(a.date));
  return all.filter(b => b.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

async function addBehavior(record) {
  await _delay(150);
  const all = storage.get(BEHAVIOR_STORAGE_KEY) || [];
  const newRecord = { ...record, id: generateId('bh'), createdAt: new Date().toISOString() };
  all.push(newRecord);
  storage.set(BEHAVIOR_STORAGE_KEY, all);
  return newRecord;
}

async function getAbnormalBehaviors(petId) {
  await _delay(100);
  const behaviors = await getBehaviors(petId);
  return behaviors.filter(b => b.status === 'abnormal');
}

async function getBehaviorStats(petId, days = 7) {
  await _delay(100);
  const behaviors = await getBehaviors(petId);
  const today = new Date();
  const recent = behaviors.filter(b => {
    const diff = Math.ceil((today - new Date(b.date)) / 86400000);
    return diff <= days;
  });
  const abnormalCount = recent.filter(b => b.status === 'abnormal').length;
  const typeCount = {};
  recent.forEach(b => { typeCount[b.type] = (typeCount[b.type] || 0) + 1; });
  return {
    total: recent.length,
    normal: recent.length - abnormalCount,
    abnormal: abnormalCount,
    healthScore: recent.length > 0 ? Math.round(((recent.length - abnormalCount) / recent.length) * 100) : 100,
    typeBreakdown: typeCount,
  };
}

function getBehaviorTypes() { return BEHAVIOR_TYPES; }

module.exports = { getBehaviors, addBehavior, getAbnormalBehaviors, getBehaviorStats, getBehaviorTypes };
