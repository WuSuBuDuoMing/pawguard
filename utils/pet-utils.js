/**
 * pet-utils.js - 宠物相关工具函数
 * 提供宠物年龄计算、BMI评估、品种管理等功能
 * @module pet-utils
 */

const { PET_SPECIES } = require('./constants');
const { parseDate } = require('./date-utils');

/**
 * 计算宠物年龄的详细信息
 * @param {string|Date} birthday - 宠物生日
 * @returns {{years: number, months: number, days: number, display: string}}
 *   years-岁, months-月, days-天, display-展示字符串
 *
 * @example
 * calculateAge('2024-03-15')
 * // => { years: 2, months: 3, days: 24, display: '2岁3个月' }
 */
function calculateAge(birthday) {
  const bd = parseDate(birthday);
  if (!bd) {
    return { years: 0, months: 0, days: 0, display: '未知' };
  }

  const now = new Date();
  let years = now.getFullYear() - bd.getFullYear();
  let months = now.getMonth() - bd.getMonth();
  let days = now.getDate() - bd.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // 生成展示文本
  let display = '';
  if (years > 0) {
    display = `${years}岁`;
    if (months > 0) {
      display += `${months}个月`;
    }
  } else if (months > 0) {
    display = `${months}个月`;
  } else {
    display = `${days}天`;
  }

  return { years, months, days, display };
}

/**
 * 计算宠物 BMI 并给出分类
 * 采用简化的体重指数公式，根据物种和体重进行评估
 * @param {number} weight - 体重，单位 kg
 * @param {string} species - 物种: 'cat' 或 'dog'
 * @param {string} [breed=''] - 品种，用于更精确的评估（预留扩展）
 * @returns {{bmi: number, category: string, suggestion: string}}
 *   bmi-体重指数, category-状态分类, suggestion-建议
 */
function calculateBMI(weight, species, breed = '') {
  if (!weight || weight <= 0) {
    return { bmi: 0, category: '未知', suggestion: '请先输入准确体重' };
  }

  // 猫的平均体长约为 46cm，狗因品种差异较大，使用 50cm 作为基准
  // BMI = 体重(kg) / (体长(m))^2
  const baseLength = species === PET_SPECIES.CAT ? 0.46 : 0.50;
  const bmi = parseFloat((weight / (baseLength * baseLength)).toFixed(1));

  const category = getWeightStatus(bmi, species);
  const suggestion = getSuggestion(category);

  return { bmi, category, suggestion };
}

/**
 * 根据 BMI 值判断体重状态
 * 猫狗的正常 BMI 范围有所不同
 * @param {number} bmi - BMI 值
 * @param {string} [species='cat'] - 物种
 * @returns {string} '偏瘦' | '正常' | '偏胖' | '肥胖'
 */
function getWeightStatus(bmi, species = 'cat') {
  // 猫的正常 BMI 范围: 18-24, 狗的正常 BMI 范围: 16-24（因品种差异大）
  if (species === PET_SPECIES.CAT) {
    if (bmi < 16) return '偏瘦';
    if (bmi <= 24) return '正常';
    if (bmi <= 30) return '偏胖';
    return '肥胖';
  }
  // 狗的评估标准
  if (bmi < 14) return '偏瘦';
  if (bmi <= 24) return '正常';
  if (bmi <= 30) return '偏胖';
  return '肥胖';
}

/**
 * 根据体重状态给出喂养建议
 * @param {string} category - 体重分类
 * @returns {string} 具体建议文本
 */
function getSuggestion(category) {
  const suggestions = {
    '偏瘦': '建议增加喂食量，并咨询兽医排除健康问题。',
    '正常': '体重状态良好，请继续保持合理的饮食和运动习惯。',
    '偏胖': '建议适当减少喂食量，增加运动时间。',
    '肥胖': '建议制定减重计划，咨询兽医调整饮食方案。',
    '未知': '请先输入准确体重。',
  };
  return suggestions[category] || '暂无建议';
}

/**
 * 生成唯一宠物 ID
 * 格式: pet_ + 时间戳(36进制) + 4位随机数
 * @returns {string} 如 "pet_m2x5k9a71b3f"
 */
function generatePetId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `pet_${timestamp}${random}`;
}

/**
 * 获取物种对应的表情图标
 * @param {string} species - 物种标识
 * @returns {string} 对应的 emoji 图标
 */
function getSpeciesIcon(species) {
  const icons = { cat: '🐱', dog: '🐶', rabbit: '🐰', hamster: '🐹', bird: '🐦', reptile: '🦎', other: '🐾' };
  return icons[species] || '🐾';
}

/**
 * 获取物种的中文名称
 * @param {string} species - 物种标识
 * @returns {string} 中文名称
 */
function getSpeciesName(species) {
  const names = { cat: '猫', dog: '狗', rabbit: '兔子', hamster: '仓鼠', bird: '鸟类', reptile: '爬宠', other: '其他' };
  return names[species] || '宠物';
}

/**
 * 获取指定物种的常用品种列表
 * 覆盖国内最常见的宠物品种
 * @param {string} species - 物种标识
 * @returns {string[]} 品种名称数组
 */
function getBreedOptions(species) {
  const breeds = {
    cat: [
      '中华田园猫', '英国短毛猫', '美国短毛猫', '布偶猫', '暹罗猫',
      '波斯猫', '苏格兰折耳猫', '缅因猫', '孟加拉豹猫', '俄罗斯蓝猫',
      '伯曼猫', '挪威森林猫', '斯芬克斯无毛猫', '德文卷毛猫', '橘猫', '其他',
    ],
    dog: [
      '中华田园犬', '金毛寻回犬', '拉布拉多犬', '柯基犬', '泰迪/贵宾犬',
      '哈士奇', '边境牧羊犬', '萨摩耶', '德国牧羊犬', '法国斗牛犬',
      '比熊犬', '柴犬', '博美犬', '雪纳瑞', '阿拉斯加雪橇犬', '其他',
    ],
    rabbit: [
      '荷兰垂耳兔', '荷兰侏儒兔', '狮子头兔', '安哥拉兔', '道奇兔',
      '海棠兔', '比利时野兔', '英国垂耳兔', '法国垂耳兔', '其他',
    ],
    hamster: [
      '金丝熊', '三线仓鼠', '一线仓鼠', '银狐仓鼠', '布丁仓鼠',
      '奶茶仓鼠', '紫仓仓鼠', '花仓仓鼠', '老公公仓鼠', '其他',
    ],
    bird: [
      '虎皮鹦鹉', '玄凤鹦鹉', '牡丹鹦鹉', '金丝雀', '珍珠鸟',
      '文鸟', '画眉', '八哥', '鹩哥', '其他',
    ],
    reptile: [
      '豹纹守宫', '鬃狮蜥', '绿鬣蜥', '球蟒', '玉米蛇',
      '角蛙', '巴西龟', '中华草龟', '其他',
    ],
    other: ['其他'],
  };
  return breeds[species] || breeds.other;
}

/**
 * 格式化性格标签为展示字符串
 * @param {string[]} tags - 性格标签数组，如 ['活泼', '粘人']
 * @returns {string} 以 '·' 连接的字符串，如 "活泼·粘人"
 */
function formatPersonality(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return tags.filter(Boolean).join('·');
}

/**
 * 生成随机的宠物问候语
 * 用于首页或详情页的展示
 * @param {string} name - 宠物名字
 * @returns {string} 随机问候语
 */
function getPetGreeting(name) {
  const greetings = [
    `${name}在等你摸摸呢~`,
    `快来看看${name}今天的状态吧！`,
    `${name}今天很开心，摇着尾巴迎接你~`,
    `${name}正懒洋洋地晒太阳呢`,
    `${name}的饭碗已经空了哦~`,
    `今天记得带${name}出去散步呀！`,
    `${name}在想你了，快去看看吧`,
    `${name}今天表现特别棒！`,
    `来看看${name}今天的可爱瞬间~`,
    `${name}又长大了，时间过得真快~`,
  ];

  const index = Math.floor(Math.random() * greetings.length);
  return greetings[index];
}

module.exports = {
  calculateAge,
  calculateBMI,
  getWeightStatus,
  generatePetId,
  getSpeciesIcon,
  getSpeciesName,
  getBreedOptions,
  formatPersonality,
  getPetGreeting,
};
