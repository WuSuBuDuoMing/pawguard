/**
 * validators.js - 数据校验工具
 * 提供表单数据验证、业务规则校验等功能
 * @module validators
 */

/**
 * 校验宠物表单数据
 * @param {Object} data - 宠物表单数据
 * @returns {{valid: boolean, errors: string[]}}
 */
function validatePet(data) {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('请输入宠物名字');
  if (data.name && data.name.length > 20) errors.push('名字不能超过20个字符');
  if (!data.species || !['cat', 'dog', 'rabbit', 'hamster', 'bird', 'reptile', 'other'].includes(data.species)) errors.push('请选择宠物种类');
  if (!data.breed) errors.push('请选择品种');
  if (data.weight && (isNaN(data.weight) || data.weight < 0 || data.weight > 100)) {
    errors.push('请输入合理的体重 (0-100kg)');
  }
  if (data.birthday) {
    const bd = new Date(data.birthday);
    if (isNaN(bd.getTime())) errors.push('请输入有效的生日日期');
    else if (bd > new Date()) errors.push('生日不能是未来日期');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * 校验健康记录表单
 * @param {Object} data
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateHealthRecord(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push('请输入记录标题');
  if (!data.type) errors.push('请选择记录类型');
  if (!data.date) errors.push('请选择日期');
  if (data.nextDate && data.date && new Date(data.nextDate) < new Date(data.date)) {
    errors.push('下次日期不能早于当前日期');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * 校验开销记录
 * @param {Object} data
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateExpense(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push('请输入开销标题');
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) errors.push('请输入有效金额');
  if (data.amount > 99999) errors.push('金额不能超过 99999 元');
  if (!data.category) errors.push('请选择分类');
  if (!data.date) errors.push('请选择日期');
  return { valid: errors.length === 0, errors };
}

/**
 * 校验日记内容
 * @param {Object} data
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateDiary(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push('请输入日记标题');
  if (data.title && data.title.length > 50) errors.push('标题不能超过50个字符');
  if (!data.content || !data.content.trim()) errors.push('请输入日记内容');
  if (!data.date) errors.push('请选择日期');
  return { valid: errors.length === 0, errors };
}

/**
 * 校验库存物品
 * @param {Object} data
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateInventory(data) {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('请输入物品名称');
  if (!data.type) errors.push('请选择物品类型');
  if (data.currentStock === undefined || data.currentStock === null || isNaN(data.currentStock)) {
    errors.push('请输入库存数量');
  }
  if (data.currentStock < 0) errors.push('库存数量不能为负数');
  return { valid: errors.length === 0, errors };
}

/**
 * 通用非空校验
 * @param {*} value
 * @param {string} fieldName
 * @returns {string|null} 错误信息或 null
 */
function required(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return `${fieldName}不能为空`;
  }
  return null;
}

/**
 * 通用长度校验
 * @param {string} value
 * @param {number} max
 * @param {string} fieldName
 * @returns {string|null}
 */
function maxLength(value, max, fieldName) {
  if (value && value.length > max) {
    return `${fieldName}不能超过${max}个字符`;
  }
  return null;
}

/**
 * 显示校验错误 toast
 * @param {{valid: boolean, errors: string[]}} result
 * @returns {boolean} 是否通过
 */
function showErrors(result) {
  if (!result.valid) {
    wx.showToast({ title: result.errors[0], icon: 'none', duration: 2000 });
    return false;
  }
  return true;
}

module.exports = {
  validatePet, validateHealthRecord, validateExpense,
  validateDiary, validateInventory, required, maxLength, showErrors,
};
