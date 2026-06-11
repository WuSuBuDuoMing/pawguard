/**
 * diary-service.js - 成长日记服务
 * 管理宠物成长日记的 CRUD 和统计
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const MOCK_DIARIES = [
  { id: 'diary_001', petId: 'pet_001', title: 'Mochi 学会了新技能', content: '今天 Mochi 居然学会了在我叫她名字的时候转头看我！之前不管怎么叫都只用尾巴表示"听到了但懒得理你"。今天用零食引诱了几次，居然开始有反应了。进步！', mood: 'happy', tags: ['进步', '互动'], images: ['/assets/images/diary/d1_1.png'], date: '2026-06-08', createdAt: '2026-06-08T20:30:00Z' },
  { id: 'diary_002', petId: 'pet_003', title: 'Lucky 在公园交到新朋友', content: '今天带 Lucky 去中央公园，遇到了一只同龄的金毛，两只狗在草坪上追了半个小时。Lucky 回家后直接瘫倒在窝里，秒睡。这种快乐的疲惫感让他整个晚上都很乖。', mood: 'happy', tags: ['社交', '散步'], images: ['/assets/images/diary/d2_1.png', '/assets/images/diary/d2_2.png'], date: '2026-06-07', createdAt: '2026-06-07T18:00:00Z' },
  { id: 'diary_003', petId: 'pet_004', title: '奶茶的皮肤病有好转', content: '连续吃了一周的抗过敏药，奶茶抓挠的频率明显降低了。之前耳朵附近的红肿也消退了不少。医生说再吃一周就可以停药了。终于放心了！', mood: 'happy', tags: ['健康', '恢复'], images: [], date: '2026-06-06', createdAt: '2026-06-06T21:00:00Z' },
  { id: 'diary_004', petId: 'pet_002', title: '土豆偷吃了我的蛋糕', content: '就转个身的功夫，土豆就跳上了桌子把我刚买的草莓蛋糕吃了三分之一。当时又气又好笑，看他满脸奶油的样子拍照留念了。还好巧克力蛋糕不是猫咪禁忌食物……吧？查了一下确认没问题才放心。', mood: 'excited', tags: ['搞笑', '调皮'], images: ['/assets/images/diary/d4_1.png'], date: '2026-06-05', createdAt: '2026-06-05T19:30:00Z' },
  { id: 'diary_005', petId: 'pet_005', title: '橘子食欲不太好', content: '这两天橘子吃得明显少了，猫粮碗里的粮还剩大半。精神状态还行，还是会去窗台晒太阳，但不像以前那样疯玩了。观察到今天有一次呕吐，吐的是毛球。如果后天还不改善就带去看医生。', mood: 'scared', tags: ['食欲', '观察中'], images: [], date: '2026-06-04', createdAt: '2026-06-04T22:00:00Z' },
  { id: 'diary_006', petId: 'pet_006', title: '豆柴的倔脾气', content: '今天散步豆豆又罢工了。走到半路遇到一条新路线，他偏要往左走，我偏要往右走。最后我们在路口对峙了五分钟，路人都在笑。最后我只好绕路从他想走的方向走了一段再折回来。柴犬真的有自己的想法。', mood: 'happy', tags: ['散步', '搞笑'], images: ['/assets/images/diary/d6_1.png'], date: '2026-06-03', createdAt: '2026-06-03T08:30:00Z' },
  { id: 'diary_007', petId: 'pet_007', title: '雪花终于让我摸肚皮了', content: '养雪花快两年了，今天第一次她在我面前翻肚皮！以前她只在没人的时候偷偷露出肚皮，今天居然主动翻给我看。虽然只持续了三秒就缩回去了，但这对我来说是巨大的突破！', mood: 'clingy', tags: ['亲密', '突破'], images: ['/assets/images/diary/d7_1.png'], date: '2026-06-02', createdAt: '2026-06-02T21:30:00Z' },
  { id: 'diary_008', petId: 'pet_008', title: '巧克力关节好多了', content: '吃了一个月的软骨素，巧克力的跛行症状明显减轻了。现在遛弯 20 分钟都没有问题，上周还主动跑了两步。老狗的恢复力虽然不如年轻时，但看到她状态好起来真的很开心。', mood: 'happy', tags: ['健康', '恢复'], images: [], date: '2026-06-01', createdAt: '2026-06-01T19:00:00Z' },
  { id: 'diary_009', petId: 'pet_003', title: 'Lucky 终于学会了随行', content: '经过三周的训练，Lucky 终于在大多数情况下能做到不拉绳子了！看到松鼠还是会冲一下，但马上能被口令拉回来。奖励他一块他最爱的鸡肉干，看他尾巴摇得都快飞起来了。', mood: 'excited', tags: ['训练', '突破'], images: ['/assets/images/diary/d9_1.png'], date: '2026-05-28', createdAt: '2026-05-28T19:30:00Z' },
  { id: 'diary_010', petId: 'pet_001', title: 'Mochi 的一天', content: '早上 7 点：叫醒服务（踩脸）\n早上 8 点：窗台巡逻\n上午 10 点：第一轮午睡\n中午 12 点：吃饭\n下午 2 点：第二轮午睡\n下午 5 点：追激光笔时间\n晚上 7 点：粘人时间\n晚上 10 点：和我一起上床睡觉\n\n猫咪的每一天都这么充实。', mood: 'happy', tags: ['日常', '搞笑'], images: ['/assets/images/diary/d10_1.png'], date: '2026-05-25', createdAt: '2026-05-25T22:00:00Z' },
  { id: 'diary_011', petId: 'pet_004', title: '奶茶的新造型', content: '今天带奶茶去美容院剪了个泰迪装，出来的时候简直是小熊本熊！一路上好多路人拍照。她自己也特别臭屁，走路都带风。', mood: 'happy', tags: ['美容', '可爱'], images: ['/assets/images/diary/d11_1.png', '/assets/images/diary/d11_2.png'], date: '2026-05-22', createdAt: '2026-05-22T16:00:00Z' },
  { id: 'diary_012', petId: 'pet_006', title: '豆柴的表情包合集', content: '今天拍到了豆柴一系列经典表情：困惑脸、装无辜脸、偷瞄脸、嫌弃脸。柴犬真的是天生的表情帝。已经把最搞笑的那张设成手机壁纸了。', mood: 'happy', tags: ['搞笑', '表情包'], images: ['/assets/images/diary/d12_1.png', '/assets/images/diary/d12_2.png', '/assets/images/diary/d12_3.png'], date: '2026-05-20', createdAt: '2026-05-20T15:00:00Z' },
  { id: 'diary_013', petId: 'pet_002', title: '土豆和橘子的蜜月期结束', content: '最近土豆和橘子又开始互相甩巴掌了。前两周还相安无事，今天为了一只苍蝇在客厅打起来了。橘子仗着体重优势占了上风，土豆气得躲在沙发底下半小时没出来。', mood: 'angry', tags: ['打架', '日常'], images: ['/assets/images/diary/d13_1.png'], date: '2026-05-18', createdAt: '2026-05-18T20:00:00Z' },
  { id: 'diary_014', petId: 'pet_008', title: '巧克力的 5 岁生日', content: '今天是巧克力 5 岁生日！给她做了自制的狗粮蛋糕（红薯+鸡胸肉+酸奶），她吃得很开心。还给她戴了生日帽拍照，虽然她一脸"我是谁我在哪"的表情。老伙计，祝你健康长寿！', mood: 'happy', tags: ['生日', '纪念日'], images: ['/assets/images/diary/d14_1.png', '/assets/images/diary/d14_2.png'], date: '2026-06-15', createdAt: '2026-06-15T12:00:00Z' },
  { id: 'diary_015', petId: 'pet_001', title: '带 Mochi 去打了年免疫苗', content: '今天带 Mochi 去瑞鹏打年度疫苗。在猫包里的时候一路嚎叫，到了医院看到白大褂就开始发抖。不过这次表现比去年好，只哼了两声就安静了。打完疫苗后在家昏睡了一整天，第二天就恢复正常了。', mood: 'tired', tags: ['疫苗', '健康'], images: [], date: '2025-07-20', createdAt: '2025-07-20T16:00:00Z' },
  { id: 'diary_016', petId: 'pet_005', title: '橘子趴在窗台看下雨', content: '今天下暴雨，橘子在窗台趴了一下午看雨滴打在玻璃上，尾巴偶尔摆一下。那画面真的太治愈了，拍了好多照片。猫和雨天真的是绝配。', mood: 'happy', tags: ['日常', '治愈'], images: ['/assets/images/diary/d16_1.png'], date: '2026-05-10', createdAt: '2026-05-10T15:00:00Z' },
  { id: 'diary_017', petId: 'pet_003', title: 'Lucky 把绳子咬断了', content: '遛弯的时候 Lucky 看到一只猫，突然发力冲出去，牵引绳的接口居然被他拽断了！追了他两条街才把他叫回来。以后得买更结实的绳子。大型犬的力量真的不可小觑。', mood: 'scared', tags: ['散步', '惊险'], images: [], date: '2026-05-15', createdAt: '2026-05-15T08:30:00Z' },
  { id: 'diary_018', petId: 'pet_007', title: '雪花的新猫窝到了', content: '给雪花买了一个毛绒猫窝，形状像个面包。一开始她不敢靠近，在旁边观察了半小时才小心翼翼地走进去。现在每天有大半时间都窝在里面。小公主终于满意了。', mood: 'happy', tags: ['购物', '新玩具'], images: ['/assets/images/diary/d18_1.png'], date: '2026-05-08', createdAt: '2026-05-08T14:00:00Z' },
];

function _initData() {
  const existing = storage.get('diaries');
  if (!existing || existing.length === 0) {
    storage.set('diaries', MOCK_DIARIES);
  }
}

/**
 * 获取日记列表
 * @param {string} [petId] - 可选宠物 ID 筛选
 * @returns {Promise<Array>} 按日期降序的日记列表
 */
async function getDiaries(petId) {
  await _delay(150);
  _initData();
  const all = storage.get('diaries') || [];
  if (!petId) return all.sort((a, b) => b.date.localeCompare(a.date));
  return all.filter(d => d.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 添加日记
 * @param {Object} diary - 日记数据
 * @returns {Promise<Object>}
 */
async function addDiary(diary) {
  await _delay(200);
  const all = storage.get('diaries') || [];
  const newDiary = { ...diary, id: `diary_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  all.push(newDiary);
  storage.set('diaries', all);
  return newDiary;
}

/**
 * 根据 ID 获取日记
 * @param {string} id - 日记 ID
 * @returns {Promise<Object|null>}
 */
async function getDiaryById(id) {
  await _delay(100);
  const all = storage.get('diaries') || [];
  return all.find(d => d.id === id) || null;
}

/**
 * 获取月度日记总结
 * @param {string} petId - 宠物 ID
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @returns {Promise<{count: number, moodBreakdown: Object, moods: string[], tags: string[], summary: string}>}
 */
async function getMonthlySummary(petId, year, month) {
  await _delay(200);
  const diaries = await getDiaries(petId);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthDiaries = diaries.filter(d => d.date.startsWith(monthStr));
  const moodCount = {};
  monthDiaries.forEach(d => {
    moodCount[d.mood] = (moodCount[d.mood] || 0) + 1;
  });
  return {
    count: monthDiaries.length,
    moodBreakdown: moodCount,
    moods: monthDiaries.map(d => d.mood),
    tags: [...new Set(monthDiaries.flatMap(d => d.tags || []))],
    summary: `本月共记录了 ${monthDiaries.length} 条成长日记，涵盖了 ${[...new Set(monthDiaries.flatMap(d => d.tags || []))].length} 个不同话题。`,
  };
}

/**
 * AI 生成日记文案
 * @param {string} petId - 宠物 ID
 * @returns {Promise<{title: string, content: string, mood: string}>}
 */
async function generateAIDiary(petId) {
  await _delay(500);
  const templates = [
    { title: '今天的小确幸', content: '今天和{name}度过了平静而美好的一天。午后的阳光洒在地板上，{name}蜷成一团打盹，偶尔伸出爪子拍拍我的手，像是在说"我在这里"。有时候觉得，养宠物最大的幸福就是这种无声的陪伴。', mood: 'happy' },
    { title: '{name}的搞笑瞬间', content: '今天{name}又做了一件让人哭笑不得的事——看到镜子里的自己居然炸毛了，对着镜子哈了半天气。后来我走过去假装和"那只猫"打招呼，{name}一脸不可思议地看着我，仿佛在说"你认识他？！"', mood: 'excited' },
    { title: '成长的痕迹', content: '翻看{name}小时候的照片，发现不知不觉已经长这么大了。从刚来家里时怯生生地躲在角落，到现在大大方方地在家里巡视领地。{name}变了很多，不变的是每次我回家时那迫不及待迎接我的样子。', mood: 'clingy' },
  ];
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  return { ...tpl, title: tpl.title, content: tpl.content };
}

module.exports = { getDiaries, addDiary, getDiaryById, getMonthlySummary, generateAIDiary };
