const { getAgeDisplay } = require('../../utils/date-utils');
const petService = require('../../services/pet-service');
const themeBehavior = require('../../utils/theme-behavior');

Component({
  behaviors: [themeBehavior],
  properties: {
    pet: { type: Object, value: {} },
    showArrow: { type: Boolean, value: true },
    showNotes: { type: Boolean, value: false },
    selected: { type: Boolean, value: false },
  },
  data: { age: '', trendDir: '' },
  observers: {
    'pet.birthday': function(birthday) {
      if (birthday) this.setData({ age: getAgeDisplay(birthday) });
    },
    'pet.id': function(id) {
      if (id) this.loadWeightTrend(id);
    }
  },
  methods: {
    onTap() { this.triggerEvent('tap', { pet: this.properties.pet }); },
    async loadWeightTrend(petId) {
      try {
        const history = await petService.getWeightHistory(petId);
        if (history.length >= 2) {
          const last = history[history.length - 1].weight;
          const prev = history[history.length - 2].weight;
          const diff = last - prev;
          this.setData({
            trendDir: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'flat'
          });
        }
      } catch(e) {}
    }
  }
});
