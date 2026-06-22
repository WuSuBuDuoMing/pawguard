/**
 * constants.js - 全局常量定义
 * 集中管理项目中使用的所有常量，便于维护和修改
 * @module constants
 */

/** 宠物种类 */
const PET_SPECIES = {
  CAT: 'cat',
  DOG: 'dog',
  RABBIT: 'rabbit',
  HAMSTER: 'hamster',
  BIRD: 'bird',
  REPTILE: 'reptile',
  OTHER: 'other',
};

/** 宠物种类列表（含图标和中文名） */
const SPECIES_LIST = [
  { id: 'cat', name: '猫', icon: '🐱' },
  { id: 'dog', name: '狗', icon: '🐶' },
  { id: 'rabbit', name: '兔子', icon: '🐰' },
  { id: 'hamster', name: '仓鼠', icon: '🐹' },
  { id: 'bird', name: '鸟类', icon: '🐦' },
  { id: 'reptile', name: '爬宠', icon: '🦎' },
  { id: 'other', name: '其他', icon: '🐾' },
];

/**
 * 护理类型列表
 * 包含所有宠物日常护理项目及其属性
 */
const CARE_TYPES = [
  {
    id: 'feeding',
    name: '喂食',
    icon: '🍽️',
    frequency: 'daily',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'water',
    name: '饮水',
    icon: '💧',
    frequency: 'daily',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'walking',
    name: '遛狗',
    icon: '🐕',
    frequency: 'daily',
    applicableSpecies: ['dog'],
  },
  {
    id: 'playing',
    name: '玩耍',
    icon: '🎾',
    frequency: 'daily',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'bathing',
    name: '洗澡',
    icon: '🛁',
    frequency: 'weekly',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'grooming',
    name: '梳毛',
    icon: '✨',
    frequency: 'weekly',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'litter_box',
    name: '清理猫砂盆',
    icon: '🧱',
    frequency: 'daily',
    applicableSpecies: ['cat'],
  },
  {
    id: 'cage_clean',
    name: '清洁笼子',
    icon: '🏠',
    frequency: 'weekly',
    applicableSpecies: ['cat', 'dog'],
  },
  {
    id: 'nail_trimming',
    name: '剪指甲',
    icon: '✂️',
    frequency: 'monthly',
    applicableSpecies: ['cat', 'dog'],
  },
];

/**
 * 健康记录类型
 * vaccine-疫苗, deworming-驱虫, visit-就诊, medication-用药, abnormal-异常
 */
const HEALTH_TYPES = {
  VACCINE: 'vaccine',
  DEWORMING: 'deworming',
  VISIT: 'visit',
  MEDICATION: 'medication',
  ABNORMAL: 'abnormal',
};

/**
 * 训练科目列表
 * 涵盖常见的宠物基础服从训练项目
 */
const TRAINING_COMMANDS = ['坐下', '握手', '召回', '等待', '随行'];

/**
 * 开支分类
 * 宠物相关费用的所有类别
 */
const EXPENSE_CATEGORIES = ['食物', '医疗', '洗护', '玩具', '用品', '寄养', '保险', '其他'];

/**
 * 库存物品类型
 * 宠物用品库存管理中涉及的所有物品类别
 */
const INVENTORY_TYPES = ['猫粮', '狗粮', '猫砂', '零食', '玩具', '药品', '洗护用品', '清洁用品'];

/**
 * 心情标签及对应表情
 * 用于记录宠物的日常情绪状态
 */
const MOOD_TAGS = [
  { id: 'happy', name: '开心', icon: '😊' },
  { id: 'excited', name: '兴奋', icon: '🤩' },
  { id: 'scared', name: '害怕', icon: '😨' },
  { id: 'angry', name: '生气', icon: '😠' },
  { id: 'tired', name: '疲惫', icon: '😴' },
  { id: 'clingy', name: '粘人', icon: '🥰' },
];

/**
 * 徽章等级判定标准
 * 根据训练完成次数授予不同等级的徽章
 */
const BADGE_CRITERIA = [
  { level: 1, name: '初学者', minCount: 1, icon: '🥉' },
  { level: 2, name: '小能手', minCount: 10, icon: '🥈' },
  { level: 3, name: '训练师', minCount: 30, icon: '🥇' },
  { level: 4, name: '专家', minCount: 100, icon: '🏆' },
  { level: 5, name: '大师', minCount: 300, icon: '👑' },
];

/**
 * 主题配色方案
 * 包含浅色模式和深色模式的完整调色板
 */
const COLORS = {
  light: {
    cream: '#FFF8F0',
    warmOrange: '#FF9F5A',
    softBlue: '#7EC8E3',
    softPink: '#FFB5C2',
    cardBg: '#FFFFFF',
    textPrimary: '#333333',
    textSecondary: '#888888',
    border: '#EEEEEE',
    divider: '#F5F5F5',
    success: '#52C41A',
    warning: '#FAAD14',
    danger: '#FF4D4F',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    bg: '#1A1A2E',
    cardBg: '#16213E',
    textPrimary: '#EAEAEA',
    textSecondary: '#999999',
    warmOrange: '#FF9F5A',
    softBlue: '#7EC8E3',
    softPink: '#FFB5C2',
    border: '#2A2A4A',
    divider: '#252545',
    success: '#52C41A',
    warning: '#FAAD14',
    danger: '#FF4D4F',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

/**
 * 本地存储键名
 * 统一管理所有 localStorage 键名，避免拼写错误
 */
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  PET_LIST: 'petList',
  CARE_RECORDS: 'careRecords',
  HEALTH_RECORDS: 'healthRecords',
  TRAINING_RECORDS: 'trainingRecords',
  EXPENSE_RECORDS: 'expenseRecords',
  INVENTORY_LIST: 'inventoryList',
  MOOD_RECORDS: 'moodRecords',
  THEME_MODE: 'themeMode',
  SETTINGS: 'appSettings',
  FIRST_LAUNCH: 'firstLaunch',
  CACHE_PREFIX: 'cache_',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  SEARCH_HISTORY: 'searchHistory',
  FEEDING_RECORDS: 'feedingRecords',
  WATER_RECORDS: 'waterRecords',
};

/** 最大宠物数量限制
 *  @type {number}
 *  @default 10
 */
const MAX_PETS = 10;

/** 默认缓存过期时间：24小时（毫秒）
 *  @type {number}
 *  @default 86400000
 */
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

module.exports = {
  PET_SPECIES,
  SPECIES_LIST,
  CARE_TYPES,
  HEALTH_TYPES,
  TRAINING_COMMANDS,
  EXPENSE_CATEGORIES,
  INVENTORY_TYPES,
  MOOD_TAGS,
  BADGE_CRITERIA,
  COLORS,
  STORAGE_KEYS,
  MAX_PETS,
  CACHE_EXPIRY,
};
