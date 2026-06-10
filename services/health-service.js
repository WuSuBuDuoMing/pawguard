/**
 * health-service.js - 健康记录服务
 * 管理疫苗、驱虫、就诊、用药记录和异常观察
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_HEALTH = [
  // ===== 疫苗记录 =====
  { id: 'health_001', petId: 'pet_001', type: 'vaccine', title: '猫三联（首免）', date: '2023-07-15', nextDate: '2024-07-15', clinic: '爱宠诊所', notes: '接种后轻微嗜睡，第二天恢复正常', createdAt: '2023-07-15T10:00:00Z' },
  { id: 'health_002', petId: 'pet_001', type: 'vaccine', title: '猫三联（加强）', date: '2024-07-18', nextDate: '2025-07-18', clinic: '爱宠诊所', notes: '无不良反应', createdAt: '2024-07-18T10:00:00Z' },
  { id: 'health_003', petId: 'pet_001', type: 'vaccine', title: '狂犬疫苗', date: '2024-07-18', nextDate: '2025-07-18', clinic: '爱宠诊所', notes: '一次性接种，状态正常', createdAt: '2024-07-18T10:00:00Z' },
  { id: 'health_004', petId: 'pet_001', type: 'vaccine', title: '猫三联（年免）', date: '2025-07-20', nextDate: '2026-07-20', clinic: '瑞鹏宠物医院', notes: '状态良好', createdAt: '2025-07-20T10:00:00Z' },
  { id: 'health_005', petId: 'pet_003', type: 'vaccine', title: '犬四联', date: '2023-01-10', nextDate: '2024-01-10', clinic: '爱宠诊所', notes: '', createdAt: '2023-01-10T10:00:00Z' },
  { id: 'health_006', petId: 'pet_003', type: 'vaccine', title: '犬四联（加强）', date: '2024-01-15', nextDate: '2025-01-15', clinic: '爱宠诊所', notes: '', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'health_007', petId: 'pet_003', type: 'vaccine', title: '犬四联（年免）', date: '2025-01-18', nextDate: '2026-01-18', clinic: '瑞鹏宠物医院', notes: '已过期未接种！', createdAt: '2025-01-18T10:00:00Z' },
  { id: 'health_008', petId: 'pet_003', type: 'vaccine', title: '狂犬疫苗', date: '2025-01-18', nextDate: '2026-01-18', clinic: '瑞鹏宠物医院', notes: '⚠️ 已过期', createdAt: '2025-01-18T10:00:00Z' },
  { id: 'health_009', petId: 'pet_004', type: 'vaccine', title: '犬五联', date: '2024-02-10', nextDate: '2025-02-10', clinic: '芭比堂动物医院', notes: '', createdAt: '2024-02-10T10:00:00Z' },
  { id: 'health_010', petId: 'pet_004', type: 'vaccine', title: '狂犬疫苗', date: '2025-02-15', nextDate: '2026-06-15', clinic: '芭比堂动物医院', notes: '即将到期', createdAt: '2025-02-15T10:00:00Z' },
  { id: 'health_011', petId: 'pet_002', type: 'vaccine', title: '猫三联（首免）', date: '2024-04-10', nextDate: '2025-04-10', clinic: '爱宠诊所', notes: '', createdAt: '2024-04-10T10:00:00Z' },
  { id: 'health_012', petId: 'pet_002', type: 'vaccine', title: '猫三联（年免）', date: '2025-04-15', nextDate: '2026-04-15', clinic: '瑞鹏宠物医院', notes: '⚠️ 已过期未接种', createdAt: '2025-04-15T10:00:00Z' },
  { id: 'health_013', petId: 'pet_005', type: 'vaccine', title: '猫三联', date: '2025-10-10', nextDate: '2026-10-10', clinic: '爱宠诊所', notes: '状态正常', createdAt: '2025-10-10T10:00:00Z' },
  { id: 'health_014', petId: 'pet_006', type: 'vaccine', title: '犬四联', date: '2025-05-10', nextDate: '2026-05-10', clinic: '芭比堂动物医院', notes: '⚠️ 需要接种加强针', createdAt: '2025-05-10T10:00:00Z' },
  { id: 'health_015', petId: 'pet_007', type: 'vaccine', title: '猫三联（首免）', date: '2024-03-01', nextDate: '2025-03-01', clinic: '瑞鹏宠物医院', notes: '', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'health_016', petId: 'pet_008', type: 'vaccine', title: '犬八联', date: '2025-08-10', nextDate: '2026-08-10', clinic: '爱宠诊所', notes: '正常', createdAt: '2025-08-10T10:00:00Z' },

  // ===== 驱虫记录 =====
  { id: 'health_017', petId: 'pet_001', type: 'deworming', title: '体外驱虫（福来恩）', date: '2026-05-10', nextDate: '2026-06-10', clinic: '自行操作', notes: '滴剂，涂于后颈部', createdAt: '2026-05-10T10:00:00Z' },
  { id: 'health_018', petId: 'pet_001', type: 'deworming', title: '体内驱虫（拜耳）', date: '2026-04-10', nextDate: '2026-07-10', clinic: '自行操作', notes: '口服，混在猫条中喂入', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'health_019', petId: 'pet_003', type: 'deworming', title: '体外驱虫（尼可信）', date: '2026-05-15', nextDate: '2026-06-15', clinic: '自行操作', notes: '口服驱虫药', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'health_020', petId: 'pet_003', type: 'deworming', title: '体内驱虫', date: '2026-03-20', nextDate: '2026-06-20', clinic: '爱宠诊所', notes: '', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'health_021', petId: 'pet_004', type: 'deworming', title: '体外驱虫', date: '2026-06-01', nextDate: '2026-07-01', clinic: '自行操作', notes: '', createdAt: '2026-06-01T10:00:00Z' },
  { id: 'health_022', petId: 'pet_005', type: 'deworming', title: '内外同驱（大宠爱）', date: '2026-05-20', nextDate: '2026-06-20', clinic: '自行操作', notes: '', createdAt: '2026-05-20T10:00:00Z' },
  { id: 'health_023', petId: 'pet_006', type: 'deworming', title: '体外驱虫', date: '2026-05-01', nextDate: '2026-06-01', clinic: '自行操作', notes: '⚠️ 已过期', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'health_024', petId: 'pet_002', type: 'deworming', title: '体内驱虫', date: '2026-04-01', nextDate: '2026-07-01', clinic: '自行操作', notes: '', createdAt: '2026-04-01T10:00:00Z' },
  { id: 'health_025', petId: 'pet_007', type: 'deworming', title: '体外驱虫', date: '2026-05-25', nextDate: '2026-06-25', clinic: '自行操作', notes: '', createdAt: '2026-05-25T10:00:00Z' },
  { id: 'health_026', petId: 'pet_008', type: 'deworming', title: '内外同驱', date: '2026-04-15', nextDate: '2026-07-15', clinic: '爱宠诊所', notes: '', createdAt: '2026-04-15T10:00:00Z' },

  // ===== 就诊记录 =====
  { id: 'health_027', petId: 'pet_001', type: 'visit', title: '年度体检', date: '2026-05-12', nextDate: '2027-05-12', clinic: '瑞鹏宠物医院', notes: '各项指标正常，体重略有增加', createdAt: '2026-05-12T10:00:00Z' },
  { id: 'health_028', petId: 'pet_003', type: 'visit', title: '心脏复查', date: '2026-04-20', nextDate: '2026-10-20', clinic: '瑞鹏宠物医院', notes: '心脏偏大，需每半年复查一次，注意控制运动量', createdAt: '2026-04-20T10:00:00Z' },
  { id: 'health_029', petId: 'pet_005', type: 'visit', title: '绝育手术', date: '2024-03-10', nextDate: null, clinic: '芭比堂动物医院', notes: '手术顺利，恢复期两周', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'health_030', petId: 'pet_004', type: 'visit', title: '皮肤检查', date: '2026-05-28', nextDate: '2026-06-28', clinic: '爱宠诊所', notes: '轻度过敏，开了口服抗过敏药', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'health_031', petId: 'pet_006', type: 'visit', title: '年度体检', date: '2026-03-18', nextDate: '2027-03-18', clinic: '芭比堂动物医院', notes: '健康', createdAt: '2026-03-18T10:00:00Z' },
  { id: 'health_032', petId: 'pet_008', type: 'visit', title: '关节检查', date: '2026-05-05', nextDate: '2026-11-05', clinic: '瑞鹏宠物医院', notes: '轻度关节炎，补充关节保健品', createdAt: '2026-05-05T10:00:00Z' },

  // ===== 用药记录 =====
  { id: 'health_033', petId: 'pet_004', type: 'medication', title: '抗过敏药（氯雷他定）', date: '2026-05-28', nextDate: '2026-06-11', clinic: '爱宠诊所', notes: '每天半片，连服两周', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'health_034', petId: 'pet_008', type: 'medication', title: '关节保健品（软骨素）', date: '2026-05-05', nextDate: null, clinic: '瑞鹏宠物医院', notes: '长期服用，每天一粒混在饭里', createdAt: '2026-05-05T10:00:00Z' },
  { id: 'health_035', petId: 'pet_003', type: 'medication', title: '心脏保护药（匹莫苯丹）', date: '2026-04-20', nextDate: null, clinic: '瑞鹏宠物医院', notes: '每天两次，早晚各一粒，长期服用', createdAt: '2026-04-20T10:00:00Z' },

  // ===== 异常观察 =====
  { id: 'health_036', petId: 'pet_001', type: 'abnormal', title: '呕吐（疑似毛球）', date: '2026-06-05', nextDate: null, clinic: null, notes: '吐出毛球状物，建议加强梳毛频率，如持续呕吐请联系兽医', createdAt: '2026-06-05T10:00:00Z' },
  { id: 'health_037', petId: 'pet_005', type: 'abnormal', title: '食欲下降', date: '2026-06-07', nextDate: null, clinic: null, notes: '连续两天吃得少，精神状态还行，观察中。如 3 天内无好转建议就诊', createdAt: '2026-06-07T10:00:00Z' },
  { id: 'health_038', petId: 'pet_004', type: 'abnormal', title: '频繁抓挠', date: '2026-05-25', nextDate: null, clinic: null, notes: '发现她经常抓耳朵附近，怀疑过敏或耳螨，后经皮肤检查确认为过敏', createdAt: '2026-05-25T10:00:00Z' },
  { id: 'health_039', petId: 'pet_008', type: 'abnormal', title: '走路跛行', date: '2026-04-28', nextDate: null, clinic: null, notes: '左后腿偶尔跛行，已预约关节检查', createdAt: '2026-04-28T10:00:00Z' },
  { id: 'health_040', petId: 'pet_002', type: 'abnormal', title: '软便', date: '2026-06-03', nextDate: null, clinic: null, notes: '换了新猫粮后出现软便，可能需要过渡期更长。如持续 3 天以上建议就诊', createdAt: '2026-06-03T10:00:00Z' },
  { id: 'health_041', petId: 'pet_003', type: 'abnormal', title: '运动后喘粗气', date: '2026-06-08', nextDate: null, clinic: null, notes: '遛弯 15 分钟后明显喘气，比以前加重，需关注心脏状况', createdAt: '2026-06-08T10:00:00Z' },
  { id: 'health_042', petId: 'pet_006', type: 'abnormal', title: '便便有虫', date: '2026-05-30', nextDate: null, clinic: null, notes: '发现粪便中有白色小虫，需尽快安排体内驱虫', createdAt: '2026-05-30T10:00:00Z' },
  { id: 'health_043', petId: 'pet_007', type: 'abnormal', title: '打喷嚏频繁', date: '2026-06-01', nextDate: null, clinic: null, notes: '换季期间偶有打喷嚏，观察 2 天后好转', createdAt: '2026-06-01T10:00:00Z' },
];

function _initData() {
  const existing = storage.get(STORAGE_KEYS.HEALTH_RECORDS);
  if (!existing || existing.length === 0) {
    storage.set(STORAGE_KEYS.HEALTH_RECORDS, MOCK_HEALTH);
  }
}

async function getHealthRecords(petId) {
  await _delay(150);
  _initData();
  const all = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
  return all.filter(r => r.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

async function addHealthRecord(record) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
  const newRecord = {
    ...record,
    id: record.id || `health_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newRecord);
  storage.set(STORAGE_KEYS.HEALTH_RECORDS, all);
  return newRecord;
}

async function getHealthSummary(petId) {
  await _delay(100);
  const records = await getHealthRecords(petId);
  return {
    total: records.length,
    vaccines: records.filter(r => r.type === 'vaccine').length,
    dewormings: records.filter(r => r.type === 'deworming').length,
    visits: records.filter(r => r.type === 'visit').length,
    medications: records.filter(r => r.type === 'medication').length,
    abnormals: records.filter(r => r.type === 'abnormal').length,
  };
}

async function getUpcomingReminders(petId) {
  await _delay(100);
  _initData();
  const all = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
  const today = new Date().toISOString().split('T')[0];
  return all
    .filter(r => r.petId === petId && r.nextDate && r.nextDate >= today)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}

async function deleteHealthRecord(id) {
  await _delay(200);
  const all = storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [];
  const filtered = all.filter(r => r.id !== id);
  storage.set(STORAGE_KEYS.HEALTH_RECORDS, filtered);
  return filtered.length < all.length;
}

module.exports = { getHealthRecords, addHealthRecord, deleteHealthRecord, getHealthSummary, getUpcomingReminders };
