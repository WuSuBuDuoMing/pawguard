/**
 * inventory-service.js - 宠物用品库存服务
 * 管理库存列表、消耗记录和补货提醒
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_INVENTORY = [
  // ===== 食物类 =====
  { id: 'inv_001', name: '渴望猫粮（鸡肉配方）', type: '猫粮', brand: 'Orijen', currentStock: 1.8, unit: 'kg', capacity: 5.4, dailyUsage: 0.12, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 1.0, price: 428, notes: '六种鱼配方也不错', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'inv_002', name: '皇家猫粮（布偶专用）', type: '猫粮', brand: 'Royal Canin', currentStock: 0.8, unit: 'kg', capacity: 4.0, dailyUsage: 0.15, petIds: ['pet_001'], restockThreshold: 1.0, price: 328, notes: '⚠️ 库存不足！', createdAt: '2026-04-15T10:00:00Z' },
  { id: 'inv_003', name: '比乐天然狗粮（大型犬）', type: '狗粮', brand: 'Pure&Natural', currentStock: 4.5, unit: 'kg', capacity: 15.0, dailyUsage: 0.6, petIds: ['pet_003', 'pet_008'], restockThreshold: 3.0, price: 359, notes: '', createdAt: '2026-05-10T10:00:00Z' },
  { id: 'inv_004', name: '爱肯拿母幼犬粮', type: '狗粮', brand: 'Acana', currentStock: 2.0, unit: 'kg', capacity: 6.0, dailyUsage: 0.15, petIds: ['pet_004', 'pet_006'], restockThreshold: 1.5, price: 268, notes: '', createdAt: '2026-05-20T10:00:00Z' },
  { id: 'inv_005', name: '网易严选猫罐头（鸡肉味）', type: '零食', brand: '网易严选', currentStock: 12, unit: '罐', capacity: 24, dailyUsage: 1.5, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 6, price: 129, notes: '按箱买更划算', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'inv_006', name: '麦富迪鸡肉干', type: '零食', brand: '麦富迪', currentStock: 3, unit: '袋', capacity: 6, dailyUsage: 0.3, petIds: ['pet_003', 'pet_004', 'pet_006', 'pet_008'], restockThreshold: 2, price: 45, notes: '训练必备奖励零食', createdAt: '2026-05-25T10:00:00Z' },
  { id: 'inv_007', name: '冻干鸡肉粒', type: '零食', brand: '朗诺', currentStock: 1, unit: '袋', capacity: 4, dailyUsage: 0.2, petIds: ['pet_001', 'pet_002', 'pet_005'], restockThreshold: 1, price: 68, notes: '⚠️ 快用完了', createdAt: '2026-05-28T10:00:00Z' },

  // ===== 猫砂 =====
  { id: 'inv_008', name: 'pidan 豆腐猫砂', type: '猫砂', brand: 'pidan', currentStock: 1, unit: '袋', capacity: 6, dailyUsage: 0.25, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 2, price: 49, notes: '⚠️ 仅剩一袋！', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'inv_009', name: '混合猫砂（膨润土+豆腐）', type: '猫砂', brand: '洁客', currentStock: 4, unit: '袋', capacity: 6, dailyUsage: 0.15, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 2, price: 35, notes: '', createdAt: '2026-05-20T10:00:00Z' },

  // ===== 玩具 =====
  { id: 'inv_010', name: '逗猫棒（羽毛款）', type: '玩具', brand: '自选', currentStock: 2, unit: '个', capacity: 5, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 1, price: 15, notes: '消耗品，猫喜欢咬羽毛', createdAt: '2026-04-01T10:00:00Z' },
  { id: 'inv_011', name: '橡胶球（狗用）', type: '玩具', brand: 'Kong', currentStock: 3, unit: '个', capacity: 5, dailyUsage: 0, petIds: ['pet_003', 'pet_008'], restockThreshold: 1, price: 35, notes: '耐咬', createdAt: '2026-03-10T10:00:00Z' },
  { id: 'inv_012', name: '激光笔', type: '玩具', brand: '自选', currentStock: 1, unit: '个', capacity: 1, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_005'], restockThreshold: 1, price: 25, notes: '用完需要换电池', createdAt: '2026-04-20T10:00:00Z' },
  { id: 'inv_013', name: '绳结玩具', type: '玩具', brand: '自选', currentStock: 2, unit: '个', capacity: 3, dailyUsage: 0, petIds: ['pet_003', 'pet_004', 'pet_006', 'pet_008'], restockThreshold: 1, price: 20, notes: '', createdAt: '2026-05-01T10:00:00Z' },

  // ===== 药品 =====
  { id: 'inv_014', name: '福来恩体外驱虫（猫用）', type: '药品', brand: 'Frontline', currentStock: 2, unit: '支', capacity: 6, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 3, price: 89, notes: '每月一次', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'inv_015', name: '尼可信体外驱虫（狗用）', type: '药品', brand: 'NexGard', currentStock: 1, unit: '粒', capacity: 6, dailyUsage: 0, petIds: ['pet_003', 'pet_004', 'pet_006', 'pet_008'], restockThreshold: 2, price: 158, notes: '口服驱虫药，⚠️ 库存不足', createdAt: '2026-04-15T10:00:00Z' },
  { id: 'inv_016', name: '拜耳内虫逃', type: '药品', brand: 'Bayer', currentStock: 4, unit: '片', capacity: 10, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_003', 'pet_004', 'pet_005', 'pet_006', 'pet_007', 'pet_008'], restockThreshold: 3, price: 65, notes: '每三个月一次', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'inv_017', name: '关节保健品（软骨素）', type: '药品', brand: 'Dasuquin', currentStock: 15, unit: '粒', capacity: 30, dailyUsage: 1, petIds: ['pet_008'], restockThreshold: 10, price: 198, notes: '巧克力每天一粒', createdAt: '2026-05-05T10:00:00Z' },
  { id: 'inv_018', name: '匹莫苯丹', type: '药品', brand: 'Vetmedin', currentStock: 20, unit: '粒', capacity: 50, dailyUsage: 2, petIds: ['pet_003'], restockThreshold: 14, price: 280, notes: 'Lucky 心脏保护药，每天早晚各一粒', createdAt: '2026-04-20T10:00:00Z' },

  // ===== 洗护用品 =====
  { id: 'inv_019', name: '猫咪专用沐浴露', type: '洗护用品', brand: '雪貂', currentStock: 1, unit: '瓶', capacity: 1, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 1, price: 68, notes: '还剩约 1/3', createdAt: '2026-02-01T10:00:00Z' },
  { id: 'inv_020', name: '狗狗沐浴露（金毛专用）', type: '洗护用品', brand: 'ISB', currentStock: 1, unit: '瓶', capacity: 1, dailyUsage: 0, petIds: ['pet_003', 'pet_004', 'pet_006', 'pet_008'], restockThreshold: 1, price: 89, notes: '', createdAt: '2026-03-15T10:00:00Z' },
  { id: 'inv_021', name: '宠物牙刷套装', type: '洗护用品', brand: 'Virbac', currentStock: 2, unit: '套', capacity: 3, dailyUsage: 0, petIds: ['pet_003', 'pet_008'], restockThreshold: 1, price: 45, notes: '', createdAt: '2026-01-10T10:00:00Z' },
  { id: 'inv_022', name: '指甲钳', type: '洗护用品', brand: '多格漫', currentStock: 1, unit: '把', capacity: 1, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_003', 'pet_004', 'pet_005', 'pet_006', 'pet_007', 'pet_008'], restockThreshold: 1, price: 35, notes: '', createdAt: '2025-10-01T10:00:00Z' },

  // ===== 清洁用品 =====
  { id: 'inv_023', name: '宠物消毒喷雾', type: '清洁用品', brand: 'Petio', currentStock: 1, unit: '瓶', capacity: 1, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_003', 'pet_004', 'pet_005', 'pet_006', 'pet_007', 'pet_008'], restockThreshold: 1, price: 45, notes: '喷猫砂盆周边用', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'inv_024', name: '除臭剂（猫用）', type: '清洁用品', brand: 'Nature\'s Miracle', currentStock: 0.3, unit: '瓶', capacity: 1, dailyUsage: 0, petIds: ['pet_001', 'pet_002', 'pet_005', 'pet_007'], restockThreshold: 1, price: 78, notes: '⚠️ 快用完了！', createdAt: '2026-04-01T10:00:00Z' },
  { id: 'inv_025', name: '尿垫（狗用）', type: '清洁用品', brand: '怡亲', currentStock: 30, unit: '片', capacity: 100, dailyUsage: 2, petIds: ['pet_003', 'pet_004', 'pet_006', 'pet_008'], restockThreshold: 20, price: 59, notes: '', createdAt: '2026-05-15T10:00:00Z' },
];

function _initData() {
  const existing = storage.get(STORAGE_KEYS.INVENTORY_LIST);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.INVENTORY_LIST, MOCK_INVENTORY);
  }
}

async function getInventoryList() {
  await _delay(150);
  _initData();
  return storage.get(STORAGE_KEYS.INVENTORY_LIST) || [];
}

async function getInventoryByType(type) {
  await _delay(100);
  const all = await getInventoryList();
  return all.filter(i => i.type === type);
}

async function addInventoryItem(item) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.INVENTORY_LIST) || [];
  const newItem = { ...item, id: `inv_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  all.push(newItem);
  storage.set(STORAGE_KEYS.INVENTORY_LIST, all);
  return newItem;
}

async function updateInventoryItem(id, updates) {
  await _delay(150);
  const all = storage.get(STORAGE_KEYS.INVENTORY_LIST) || [];
  const idx = all.findIndex(i => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  storage.set(STORAGE_KEYS.INVENTORY_LIST, all);
  return all[idx];
}

async function getLowStockItems() {
  await _delay(100);
  const all = await getInventoryList();
  return all.filter(i => i.currentStock <= i.restockThreshold);
}

async function getShoppingList() {
  await _delay(100);
  const lowItems = await getLowStockItems();
  return lowItems.map(i => ({
    id: i.id,
    name: i.name,
    brand: i.brand,
    type: i.type,
    price: i.price,
    currentStock: i.currentStock,
    suggestedQty: Math.ceil(i.capacity - i.currentStock),
  }));
}

module.exports = { getInventoryList, getInventoryByType, addInventoryItem, updateInventoryItem, getLowStockItems, getShoppingList };
