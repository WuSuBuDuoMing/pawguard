const MOODS = { happy: '😊', excited: '🤩', scared: '😨', angry: '😠', tired: '😴', clingy: '🥰' };
Component({
  properties: { diary: { type: Object, value: {} } },
  data: { moodIcon: '' },
  observers: { 'diary.mood'(mood) { this.setData({ moodIcon: MOODS[mood] || '📝' }); } },
  methods: { onTap() { this.triggerEvent('tap', { diary: this.properties.diary }); } }
});
