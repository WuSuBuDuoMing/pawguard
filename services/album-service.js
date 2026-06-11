/**
 * album-service.js - 宠物相册服务
 * 管理相册图片的 CRUD、分类和统计
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_ALBUM = [
  // ===== Mochi 的相册 =====
  { id: 'photo_001', petId: 'pet_001', url: '/assets/images/album/mochi_1.png', thumbnail: '/assets/images/album/mochi_1_thumb.png', title: '窗台晒太阳', tags: ['日常', '可爱'], date: '2026-06-08', createdAt: '2026-06-08T14:00:00Z' },
  { id: 'photo_002', petId: 'pet_001', url: '/assets/images/album/mochi_2.png', thumbnail: '/assets/images/album/mochi_2_thumb.png', title: '睡觉四仰八叉', tags: ['睡觉', '搞笑'], date: '2026-06-05', createdAt: '2026-06-05T16:00:00Z' },
  { id: 'photo_003', petId: 'pet_001', url: '/assets/images/album/mochi_3.png', thumbnail: '/assets/images/album/mochi_3_thumb.png', title: '追逗猫棒中', tags: ['玩耍', '运动'], date: '2026-06-02', createdAt: '2026-06-02T19:00:00Z' },
  { id: 'photo_004', petId: 'pet_001', url: '/assets/images/album/mochi_4.png', thumbnail: '/assets/images/album/mochi_4_thumb.png', title: '偷看我吃东西', tags: ['贪吃', '日常'], date: '2026-05-28', createdAt: '2026-05-28T12:00:00Z' },
  { id: 'photo_005', petId: 'pet_001', url: '/assets/images/album/mochi_5.png', thumbnail: '/assets/images/album/mochi_5_thumb.png', title: '洗完澡一脸不爽', tags: ['洗澡', '表情'], date: '2026-05-20', createdAt: '2026-05-20T15:00:00Z' },
  { id: 'photo_006', petId: 'pet_001', url: '/assets/images/album/mochi_6.png', thumbnail: '/assets/images/album/mochi_6_thumb.png', title: '和纸箱的亲密接触', tags: ['搞笑', '玩具'], date: '2026-05-15', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'photo_007', petId: 'pet_001', url: '/assets/images/album/mochi_7.png', thumbnail: '/assets/images/album/mochi_7_thumb.png', title: '布偶猫的蓝眼睛特写', tags: ['颜值', '特写'], date: '2026-05-10', createdAt: '2026-05-10T11:00:00Z' },
  { id: 'photo_008', petId: 'pet_001', url: '/assets/images/album/mochi_8.png', thumbnail: '/assets/images/album/mochi_8_thumb.png', title: '和土豆同框', tags: ['合照', '多猫'], date: '2026-05-05', createdAt: '2026-05-05T18:00:00Z' },

  // ===== Lucky 的相册 =====
  { id: 'photo_009', petId: 'pet_003', url: '/assets/images/album/lucky_1.png', thumbnail: '/assets/images/album/lucky_1_thumb.png', title: '公园追球', tags: ['运动', '户外'], date: '2026-06-07', createdAt: '2026-06-07T10:00:00Z' },
  { id: 'photo_010', petId: 'pet_003', url: '/assets/images/album/lucky_2.png', thumbnail: '/assets/images/album/lucky_2_thumb.png', title: '游泳中的金毛', tags: ['游泳', '夏天'], date: '2026-06-03', createdAt: '2026-06-03T15:00:00Z' },
  { id: 'photo_011', petId: 'pet_003', url: '/assets/images/album/lucky_3.png', thumbnail: '/assets/images/album/lucky_3_thumb.png', title: '学会了握手', tags: ['训练', '突破'], date: '2026-05-26', createdAt: '2026-05-26T19:30:00Z' },
  { id: 'photo_012', petId: 'pet_003', url: '/assets/images/album/lucky_4.png', thumbnail: '/assets/images/album/lucky_4_thumb.png', title: '趴在地上休息', tags: ['休息', '日常'], date: '2026-05-22', createdAt: '2026-05-22T14:00:00Z' },
  { id: 'photo_013', petId: 'pet_003', url: '/assets/images/album/lucky_5.png', thumbnail: '/assets/images/album/lucky_5_thumb.png', title: '和新朋友玩耍', tags: ['社交', '开心'], date: '2026-05-18', createdAt: '2026-05-18T11:00:00Z' },
  { id: 'photo_014', petId: 'pet_003', url: '/assets/images/album/lucky_6.png', thumbnail: '/assets/images/album/lucky_6_thumb.png', title: '被风吹乱毛的金毛', tags: ['搞笑', '颜值'], date: '2026-05-12', createdAt: '2026-05-12T09:00:00Z' },
  { id: 'photo_015', petId: 'pet_003', url: '/assets/images/album/lucky_7.png', thumbnail: '/assets/images/album/lucky_7_thumb.png', title: '嘴里叼着鞋', tags: ['搞笑', '调皮'], date: '2026-05-08', createdAt: '2026-05-08T08:00:00Z' },
  { id: 'photo_016', petId: 'pet_003', url: '/assets/images/album/lucky_8.png', thumbnail: '/assets/images/album/lucky_8_thumb.png', title: '雪天散步', tags: ['散步', '冬天'], date: '2026-01-15', createdAt: '2026-01-15T10:00:00Z' },

  // ===== 奶茶的相册 =====
  { id: 'photo_017', petId: 'pet_004', url: '/assets/images/album/naicha_1.png', thumbnail: '/assets/images/album/naicha_1_thumb.png', title: '泰迪装出炉', tags: ['美容', '可爱'], date: '2026-06-01', createdAt: '2026-06-01T16:00:00Z' },
  { id: 'photo_018', petId: 'pet_004', url: '/assets/images/album/naicha_2.png', thumbnail: '/assets/images/album/naicha_2_thumb.png', title: '趴在沙发上', tags: ['日常', '可爱'], date: '2026-05-28', createdAt: '2026-05-28T20:00:00Z' },
  { id: 'photo_019', petId: 'pet_004', url: '/assets/images/album/naicha_3.png', thumbnail: '/assets/images/album/naicha_3_thumb.png', title: '学握手中', tags: ['训练', '进步'], date: '2026-05-26', createdAt: '2026-05-26T19:00:00Z' },
  { id: 'photo_020', petId: 'pet_004', url: '/assets/images/album/naicha_4.png', thumbnail: '/assets/images/album/naicha_4_thumb.png', title: '穿小裙子', tags: ['穿搭', '萌'], date: '2026-05-20', createdAt: '2026-05-20T14:00:00Z' },
  { id: 'photo_021', petId: 'pet_004', url: '/assets/images/album/naicha_5.png', thumbnail: '/assets/images/album/naicha_5_thumb.png', title: '和豆豆合影', tags: ['合照', '狗狗'], date: '2026-05-15', createdAt: '2026-05-15T11:00:00Z' },
  { id: 'photo_022', petId: 'pet_004', url: '/assets/images/album/naicha_6.png', thumbnail: '/assets/images/album/naicha_6_thumb.png', title: '被偷拍的表情', tags: ['搞笑', '表情'], date: '2026-05-10', createdAt: '2026-05-10T09:00:00Z' },

  // ===== 土豆的相册 =====
  { id: 'photo_023', petId: 'pet_002', url: '/assets/images/album/tudou_1.png', thumbnail: '/assets/images/album/tudou_1_thumb.png', title: '英短的大脸', tags: ['颜值', '特写'], date: '2026-06-04', createdAt: '2026-06-04T17:00:00Z' },
  { id: 'photo_024', petId: 'pet_002', url: '/assets/images/album/tudou_2.png', thumbnail: '/assets/images/album/tudou_2_thumb.png', title: '追激光笔', tags: ['玩耍', '运动'], date: '2026-06-01', createdAt: '2026-06-01T20:00:00Z' },
  { id: 'photo_025', petId: 'pet_002', url: '/assets/images/album/tudou_3.png', thumbnail: '/assets/images/album/tudou_3_thumb.png', title: '偷吃蛋糕被抓', tags: ['搞笑', '贪吃'], date: '2026-05-25', createdAt: '2026-05-25T19:30:00Z' },
  { id: 'photo_026', petId: 'pet_002', url: '/assets/images/album/tudou_4.png', thumbnail: '/assets/images/album/tudou_4_thumb.png', title: '和橘子打架中', tags: ['打架', '日常'], date: '2026-05-18', createdAt: '2026-05-18T20:00:00Z' },
  { id: 'photo_027', petId: 'pet_002', url: '/assets/images/album/tudou_5.png', thumbnail: '/assets/images/album/tudou_5_thumb.png', title: '躲在纸箱里', tags: ['搞笑', '纸箱'], date: '2026-05-12', createdAt: '2026-05-12T13:00:00Z' },
  { id: 'photo_028', petId: 'pet_002', url: '/assets/images/album/tudou_6.png', thumbnail: '/assets/images/album/tudou_6_thumb.png', title: '胖土豆的全身照', tags: ['颜值', '胖'], date: '2026-05-05', createdAt: '2026-05-05T15:00:00Z' },

  // ===== 其他宠物 =====
  { id: 'photo_029', petId: 'pet_005', url: '/assets/images/album/juzi_1.png', thumbnail: '/assets/images/album/juzi_1_thumb.png', title: '窗台上的橘猫', tags: ['日常', '颜值'], date: '2026-06-06', createdAt: '2026-06-06T14:00:00Z' },
  { id: 'photo_030', petId: 'pet_005', url: '/assets/images/album/juzi_2.png', thumbnail: '/assets/images/album/juzi_2_thumb.png', title: '高冷侧颜', tags: ['颜值', '特写'], date: '2026-05-28', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'photo_031', petId: 'pet_005', url: '/assets/images/album/juzi_3.png', thumbnail: '/assets/images/album/juzi_3_thumb.png', title: '橘猫标准体重照', tags: ['搞笑', '胖'], date: '2026-05-15', createdAt: '2026-05-15T16:00:00Z' },
  { id: 'photo_032', petId: 'pet_005', url: '/assets/images/album/juzi_4.png', thumbnail: '/assets/images/album/juzi_4_thumb.png', title: '看雨中的橘子', tags: ['治愈', '日常'], date: '2026-05-10', createdAt: '2026-05-10T15:00:00Z' },
  { id: 'photo_033', petId: 'pet_005', url: '/assets/images/album/juzi_5.png', thumbnail: '/assets/images/album/juzi_5_thumb.png', title: '叼着袜子走来走去', tags: ['搞笑', '搞笑'], date: '2026-05-01', createdAt: '2026-05-01T11:00:00Z' },
  { id: 'photo_034', petId: 'pet_006', url: '/assets/images/album/doudou_1.png', thumbnail: '/assets/images/album/doudou_1_thumb.png', title: '柴犬微笑', tags: ['可爱', '表情'], date: '2026-06-07', createdAt: '2026-06-07T09:00:00Z' },
  { id: 'photo_035', petId: 'pet_006', url: '/assets/images/album/doudou_2.png', thumbnail: '/assets/images/album/doudou_2_thumb.png', title: '散步罢工中', tags: ['搞笑', '散步'], date: '2026-06-03', createdAt: '2026-06-03T08:30:00Z' },
  { id: 'photo_036', petId: 'pet_006', url: '/assets/images/album/doudou_3.png', thumbnail: '/assets/images/album/doudou_3_thumb.png', title: '固执脸', tags: ['表情', '柴犬'], date: '2026-05-25', createdAt: '2026-05-25T18:00:00Z' },
  { id: 'photo_037', petId: 'pet_006', url: '/assets/images/album/doudou_4.png', thumbnail: '/assets/images/album/doudou_4_thumb.png', title: '学会握手了', tags: ['训练', '突破'], date: '2026-05-28', createdAt: '2026-05-28T19:00:00Z' },
  { id: 'photo_038', petId: 'pet_007', url: '/assets/images/album/xuehua_1.png', thumbnail: '/assets/images/album/xuehua_1_thumb.png', title: '蓝猫银渐层特写', tags: ['颜值', '特写'], date: '2026-06-04', createdAt: '2026-06-04T11:00:00Z' },
  { id: 'photo_039', petId: 'pet_007', url: '/assets/images/album/xuehua_2.png', thumbnail: '/assets/images/album/xuehua_2_thumb.png', title: '面包猫窝里的雪花', tags: ['可爱', '猫窝'], date: '2026-05-30', createdAt: '2026-05-30T14:00:00Z' },
  { id: 'photo_040', petId: 'pet_007', url: '/assets/images/album/xuehua_3.png', thumbnail: '/assets/images/album/xuehua_3_thumb.png', title: '终于翻肚皮了', tags: ['突破', '亲密'], date: '2026-06-02', createdAt: '2026-06-02T21:30:00Z' },
  { id: 'photo_041', petId: 'pet_007', url: '/assets/images/album/xuehua_4.png', thumbnail: '/assets/images/album/xuehua_4_thumb.png', title: '躲床底偷看', tags: ['害羞', '日常'], date: '2026-05-20', createdAt: '2026-05-20T09:00:00Z' },
  { id: 'photo_042', petId: 'pet_008', url: '/assets/images/album/choco_1.png', thumbnail: '/assets/images/album/choco_1_thumb.png', title: '5 岁生日', tags: ['生日', '纪念日'], date: '2026-06-15', createdAt: '2026-06-15T12:00:00Z' },
  { id: 'photo_043', petId: 'pet_008', url: '/assets/images/album/choco_2.png', thumbnail: '/assets/images/album/choco_2_thumb.png', title: '散步的拉布拉多', tags: ['散步', '日常'], date: '2026-06-07', createdAt: '2026-06-07T08:00:00Z' },
  { id: 'photo_044', petId: 'pet_008', url: '/assets/images/album/choco_3.png', thumbnail: '/assets/images/album/choco_3_thumb.png', title: '叼着玩具跑', tags: ['玩耍', '运动'], date: '2026-05-28', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'photo_045', petId: 'pet_008', url: '/assets/images/album/choco_4.png', thumbnail: '/assets/images/album/choco_4_thumb.png', title: '老狗晒太阳', tags: ['休息', '治愈'], date: '2026-05-20', createdAt: '2026-05-20T14:00:00Z' },
];

function _initData() {
  const existing = storage.get('album');
  if (!existing || existing.length === 0) {
    storage.set('album', MOCK_ALBUM);
  }
}

/**
 * 获取照片列表
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<Array>} 按日期降序的照片列表
 */
async function getPhotos(petId) {
  await _delay(150);
  _initData();
  const all = storage.get('album') || [];
  if (!petId) return all.sort((a, b) => b.date.localeCompare(a.date));
  return all.filter(p => p.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 添加照片
 * @param {Object} photo - 照片数据
 * @returns {Promise<Object>}
 */
async function addPhoto(photo) {
  await _delay(200);
  const all = storage.get('album') || [];
  const newPhoto = { ...photo, id: `photo_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  all.push(newPhoto);
  storage.set('album', all);
  return newPhoto;
}

/**
 * 获取照片统计
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<{total: number, topTags: Array<{tag: string, count: number}>>}
 */
async function getPhotoStats(petId) {
  await _delay(100);
  const photos = await getPhotos(petId);
  const tagCount = {};
  photos.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
  return { total: photos.length, topTags };
}

module.exports = { getPhotos, addPhoto, getPhotoStats };
