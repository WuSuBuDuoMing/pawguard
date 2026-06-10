/**
 * pet-service.js - 宠物档案服务
 * 提供宠物 CRUD 操作和数据管理
 * 当前使用 mock 数据，后期可替换为真实后端
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

/** Mock 宠物数据 */
const MOCK_PETS = [
  {
    id: 'pet_001', name: 'Mochi', species: 'cat', breed: '布偶猫',
    gender: 'female', birthday: '2023-05-12', weight: 4.8, neutered: true,
    avatar: '/assets/images/pets/mochi.png',
    personality: ['粘人', '爱睡觉', '胆小'],
    notes: '不喜欢吹风机声音，洗澡需要用零食安抚',
    createdAt: '2023-05-15T10:00:00.000Z', updatedAt: '2026-06-01T08:00:00.000Z'
  },
  {
    id: 'pet_002', name: '土豆', species: 'cat', breed: '英国短毛猫',
    gender: 'male', birthday: '2024-02-01', weight: 5.2,
    avatar: '/assets/images/pets/tudou.png',
    personality: ['活泼', '贪吃', '好奇心强'],
    notes: '喜欢追激光笔，看到塑料袋会发疯',
    createdAt: '2024-02-05T10:00:00.000Z', updatedAt: '2026-05-28T08:00:00.000Z'
  },
  {
    id: 'pet_003', name: 'Lucky', species: 'dog', breed: '金毛寻回犬',
    gender: 'male', birthday: '2022-10-15', weight: 31.5, neutered: false,
    avatar: '/assets/images/pets/lucky.png',
    personality: ['温顺', '友善', '爱水'],
    notes: '游泳高手，每次遛弯都要去湖边，定期体检心脏偏大',
    createdAt: '2022-10-20T10:00:00.000Z', updatedAt: '2026-06-05T08:00:00.000Z'
  },
  {
    id: 'pet_004', name: '奶茶', species: 'dog', breed: '泰迪/贵宾犬',
    gender: 'female', birthday: '2023-07-22', weight: 3.8,
    avatar: '/assets/images/pets/naicha.png',
    personality: ['粘人', '聪明', '爱叫'],
    notes: '会握手和转圈，但有时候在沙发上偷偷尿尿',
    createdAt: '2023-08-01T10:00:00.000Z', updatedAt: '2026-06-02T08:00:00.000Z'
  },
  {
    id: 'pet_005', name: '橘子', species: 'cat', breed: '中华田园猫',
    gender: 'male', birthday: '2022-09-10', weight: 6.1, neutered: true,
    avatar: '/assets/images/pets/juzi.png',
    personality: ['高冷', '独立', '粘人时特别粘'],
    notes: '公猫已绝育，喜欢窗台晒太阳，偶尔会叼袜子到猫窝',
    createdAt: '2022-09-15T10:00:00.000Z', updatedAt: '2026-05-30T08:00:00.000Z'
  },
  {
    id: 'pet_006', name: '豆豆', species: 'dog', breed: '柴犬',
    gender: 'male', birthday: '2024-03-18', weight: 8.2,
    avatar: '/assets/images/pets/doudou.png',
    personality: ['固执', '表情丰富', '爱干净'],
    notes: '散步时不喜欢走重复路线，会原地罢工',
    createdAt: '2024-03-25T10:00:00.000Z', updatedAt: '2026-06-08T08:00:00.000Z'
  },
  {
    id: 'pet_007', name: '雪花', species: 'cat', breed: '俄罗斯蓝猫',
    gender: 'female', birthday: '2023-12-25', weight: 3.6,
    avatar: '/assets/images/pets/xuehua.png',
    personality: ['安静', '优雅', '认生'],
    notes: '只让主人摸，陌生人来了就躲床底，银渐层毛色很漂亮',
    createdAt: '2024-01-05T10:00:00.000Z', updatedAt: '2026-06-04T08:00:00.000Z'
  },
  {
    id: 'pet_008', name: '巧克力', species: 'dog', breed: '拉布拉多犬',
    gender: 'female', birthday: '2021-06-15', weight: 28.0,
    avatar: '/assets/images/pets/chocolate.png',
    personality: ['贪吃', '热情', '服从性好'],
    notes: '什么都想吃，需要严格控制饮食，喜欢叼鞋子',
    createdAt: '2021-06-20T10:00:00.000Z', updatedAt: '2026-06-07T08:00:00.000Z'
  }
];

/** 体重历史记录 mock */
const MOCK_WEIGHT_HISTORY = [
  { petId: 'pet_001', weight: 4.2, date: '2025-12-10' },
  { petId: 'pet_001', weight: 4.4, date: '2026-01-10' },
  { petId: 'pet_001', weight: 4.6, date: '2026-02-10' },
  { petId: 'pet_001', weight: 4.7, date: '2026-03-10' },
  { petId: 'pet_001', weight: 4.8, date: '2026-04-10' },
  { petId: 'pet_001', weight: 4.8, date: '2026-05-10' },
  { petId: 'pet_001', weight: 4.8, date: '2026-06-08' },
  { petId: 'pet_003', weight: 29.8, date: '2025-12-10' },
  { petId: 'pet_003', weight: 30.2, date: '2026-01-10' },
  { petId: 'pet_003', weight: 30.8, date: '2026-02-10' },
  { petId: 'pet_003', weight: 31.0, date: '2026-03-10' },
  { petId: 'pet_003', weight: 31.2, date: '2026-04-10' },
  { petId: 'pet_003', weight: 31.5, date: '2026-05-10' },
  { petId: 'pet_003', weight: 31.5, date: '2026-06-08' },
  { petId: 'pet_005', weight: 5.8, date: '2025-12-10' },
  { petId: 'pet_005', weight: 5.9, date: '2026-01-10' },
  { petId: 'pet_005', weight: 6.0, date: '2026-02-10' },
  { petId: 'pet_005', weight: 6.0, date: '2026-03-10' },
  { petId: 'pet_005', weight: 6.1, date: '2026-04-10' },
  { petId: 'pet_005', weight: 6.1, date: '2026-05-10' },
  { petId: 'pet_005', weight: 6.1, date: '2026-06-08' },
];

/** 初始化 mock 数据 */
function _initMockData() {
  const existing = storage.get(STORAGE_KEYS.PET_LIST);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.PET_LIST, MOCK_PETS);
  }
}

/** 模拟延迟 */
function _delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * 获取所有宠物列表
 * @returns {Promise<Array>}
 */
async function getAllPets() {
  await _delay();
  _initMockData();
  return storage.get(STORAGE_KEYS.PET_LIST) || [];
}

/**
 * 根据 ID 获取宠物
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getPetById(id) {
  await _delay(100);
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  return pets.find(p => p.id === id) || null;
}

/**
 * 添加宠物
 * @param {Object} petData
 * @returns {Promise<Object>}
 */
async function addPet(petData) {
  await _delay();
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  const newPet = {
    ...petData,
    id: petData.id || `pet_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  pets.push(newPet);
  storage.set(STORAGE_KEYS.PET_LIST, pets);
  return newPet;
}

/**
 * 更新宠物信息
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
async function updatePet(id, updates) {
  await _delay();
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  const idx = pets.findIndex(p => p.id === id);
  if (idx === -1) return null;
  pets[idx] = { ...pets[idx], ...updates, updatedAt: new Date().toISOString() };
  storage.set(STORAGE_KEYS.PET_LIST, pets);
  return pets[idx];
}

/**
 * 删除宠物
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deletePet(id) {
  await _delay();
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  const filtered = pets.filter(p => p.id !== id);
  if (filtered.length === pets.length) return false;
  storage.set(STORAGE_KEYS.PET_LIST, filtered);
  return true;
}

/**
 * 获取体重记录
 * @param {string} petId
 * @returns {Promise<Array>}
 */
async function getWeightHistory(petId) {
  await _delay(100);
  return MOCK_WEIGHT_HISTORY.filter(w => w.petId === petId).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 记录新体重
 * @param {string} petId
 * @param {number} weight
 * @param {string} date
 * @returns {Promise<Object>}
 */
async function recordWeight(petId, weight, date) {
  await _delay(200);
  const today = date || new Date().toISOString().split('T')[0];
  MOCK_WEIGHT_HISTORY.push({ petId, weight, date: today });
  // 同时更新宠物档案中的体重
  const pets = storage.get(STORAGE_KEYS.PET_LIST) || [];
  const pet = pets.find(p => p.id === petId);
  if (pet) {
    pet.weight = weight;
    pet.updatedAt = new Date().toISOString();
    storage.set(STORAGE_KEYS.PET_LIST, pets);
  }
  return { petId, weight, date: today };
}

module.exports = { getAllPets, getPetById, addPet, updatePet, deletePet, getWeightHistory, recordWeight };
