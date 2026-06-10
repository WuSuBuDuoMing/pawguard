const { getDaysUntil } = require('../../utils/date-utils');
const { HEALTH_TYPES } = require('../../utils/constants');

const TYPE_LABELS = {
  vaccine: '疫苗', deworming: '驱虫', visit: '就诊',
  medication: '用药', abnormal: '异常观察'
};

Component({
  properties: { record: { type: Object, value: {} } },
  data: { typeLabel: '', isOverdue: false, isUpcoming: false },
  observers: {
    'record': function(r) {
      if (!r || !r.type) return;
      this.setData({
        typeLabel: TYPE_LABELS[r.type] || r.type,
        isOverdue: r.nextDate ? getDaysUntil(r.nextDate) < 0 : false,
        isUpcoming: r.nextDate ? { d: getDaysUntil(r.nextDate), ok: getDaysUntil(r.nextDate) >= 0 && getDaysUntil(r.nextDate) <= 30 }.ok : false,
      });
    }
  },
  methods: { onTap() { this.triggerEvent('tap', { record: this.properties.record }); } }
});
