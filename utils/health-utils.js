/**
 * health-utils.js - 健康管理工具函数
 * 提供疫苗/驱虫提醒、健康状态评估、记录汇总等功能
 * @module health-utils
 */

const { HEALTH_TYPES } = require('./constants');
const { getDaysUntil, parseDate, formatDate } = require('./date-utils');

/**
 * 判断疫苗是否即将到期
 * @param {string|Date} nextDate - 下次疫苗日期
 * @returns {boolean} 距离到期 30 天内返回 true
 */
function isVaccineDue(nextDate) {
  if (!nextDate) return false;
  const days = getDaysUntil(nextDate);
  return days >= 0 && days <= 30;
}

/**
 * 判断驱虫是否即将到期
 * @param {string|Date} nextDate - 下次驱虫日期
 * @returns {boolean} 距离到期 7 天内返回 true
 */
function isDewormingDue(nextDate) {
  if (!nextDate) return false;
  const days = getDaysUntil(nextDate);
  return days >= 0 && days <= 7;
}

/**
 * 综合评估宠物的健康状态
 * 根据各类健康记录判断整体健康等级
 * @param {Array} records - 健康记录数组，每条记录需包含 type、nextDate、date 等字段
 * @returns {'normal'|'attention'|'urgent'} 健康状态等级
 *   - normal: 一切正常
 *   - attention: 需要关注（有即将到期的疫苗/驱虫）
 *   - urgent: 需要紧急处理（有异常记录或已过期）
 */
function getHealthStatus(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return 'normal';
  }

  let hasUrgent = false;
  let hasAttention = false;

  for (const record of records) {
    // 检查是否有异常记录（近期30天内的异常标记为紧急）
    if (record.type === HEALTH_TYPES.ABNORMAL) {
      const recordDate = parseDate(record.date);
      if (recordDate) {
        const daysAgo = getDaysUntil(record.date);
        // daysAgo 为负数表示过去，绝对值在30天内视为紧急
        if (daysAgo >= -30) {
          hasUrgent = true;
        }
      }
    }

    // 检查疫苗是否过期
    if (record.type === HEALTH_TYPES.VACCINE && record.nextDate) {
      const days = getDaysUntil(record.nextDate);
      if (days < 0) {
        hasUrgent = true;
      } else if (days <= 30) {
        hasAttention = true;
      }
    }

    // 检查驱虫是否过期
    if (record.type === HEALTH_TYPES.DEWORMING && record.nextDate) {
      const days = getDaysUntil(record.nextDate);
      if (days < 0) {
        hasUrgent = true;
      } else if (days <= 7) {
        hasAttention = true;
      }
    }
  }

  if (hasUrgent) return 'urgent';
  if (hasAttention) return 'attention';
  return 'normal';
}

/**
 * 获取最近一次需要关注的健康提醒
 * 遍历所有记录，找到最近一个即将到来的疫苗或驱虫提醒
 * @param {Array} records - 健康记录数组
 * @returns {{type: string, date: string, daysLeft: number, name: string}|null}
 *   返回最近提醒对象，无则返回 null
 */
function getNextHealthReminder(records) {
  if (!Array.isArray(records) || records.length === 0) return null;

  let nearest = null;
  let minDays = Infinity;

  for (const record of records) {
    if (!record.nextDate) continue;

    // 只关注疫苗和驱虫类的下次提醒
    const validTypes = [HEALTH_TYPES.VACCINE, HEALTH_TYPES.DEWORMING];
    if (!validTypes.includes(record.type)) continue;

    const days = getDaysUntil(record.nextDate);
    // 只关注未来（或今天）的提醒
    if (days >= 0 && days < minDays) {
      minDays = days;
      nearest = {
        type: record.type,
        date: record.nextDate,
        daysLeft: days,
        name: record.name || formatHealthType(record.type),
      };
    }
  }

  return nearest;
}

/**
 * 获取健康记录汇总统计
 * @param {Array} records - 健康记录数组
 * @returns {{total: number, vaccines: number, dewormings: number, visits: number, medications: number}}
 */
function getHealthSummary(records) {
  const summary = {
    total: 0,
    vaccines: 0,
    dewormings: 0,
    visits: 0,
    medications: 0,
  };

  if (!Array.isArray(records) || records.length === 0) return summary;

  summary.total = records.length;

  for (const record of records) {
    switch (record.type) {
      case HEALTH_TYPES.VACCINE:
        summary.vaccines++;
        break;
      case HEALTH_TYPES.DEWORMING:
        summary.dewormings++;
        break;
      case HEALTH_TYPES.VISIT:
        summary.visits++;
        break;
      case HEALTH_TYPES.MEDICATION:
        summary.medications++;
        break;
      default:
        break;
    }
  }

  return summary;
}

/**
 * 计算距下次疫苗的天数，并返回对应的状态颜色
 * 根据紧迫程度返回不同颜色：紧急(红)、警告(黄)、正常(绿)
 * @param {string|Date} nextDate - 下次疫苗日期
 * @returns {{days: number, color: string, status: string}}
 *   days-剩余天数, color-颜色十六进制码, status-状态描述
 */
function daysUntilVaccine(nextDate) {
  const days = getDaysUntil(nextDate);

  if (days < 0) {
    return {
      days,
      color: '#FF4D4F',
      status: '已过期',
    };
  } else if (days === 0) {
    return {
      days: 0,
      color: '#FF4D4F',
      status: '今天',
    };
  } else if (days <= 7) {
    return {
      days,
      color: '#FF4D4F',
      status: '即将到期',
    };
  } else if (days <= 30) {
    return {
      days,
      color: '#FAAD14',
      status: '即将到期',
    };
  } else {
    return {
      days,
      color: '#52C41A',
      status: '正常',
    };
  }
}

/**
 * 将健康记录类型标识转为中文名称
 * @param {string} type - 类型标识，如 'vaccine'
 * @returns {string} 中文名称，如 '疫苗'
 */
function formatHealthType(type) {
  const typeMap = {
    [HEALTH_TYPES.VACCINE]: '疫苗',
    [HEALTH_TYPES.DEWORMING]: '驱虫',
    [HEALTH_TYPES.VISIT]: '就诊',
    [HEALTH_TYPES.MEDICATION]: '用药',
    [HEALTH_TYPES.ABNORMAL]: '异常',
  };
  return typeMap[type] || '其他';
}

module.exports = {
  isVaccineDue,
  isDewormingDue,
  getHealthStatus,
  getNextHealthReminder,
  getHealthSummary,
  daysUntilVaccine,
  formatHealthType,
};
