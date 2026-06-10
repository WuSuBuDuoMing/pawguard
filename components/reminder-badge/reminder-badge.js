Component({
  properties: {
    icon: { type: String, value: '⏰' },
    text: { type: String, value: '' },
    count: { type: Number, value: 0 },
    type: { type: String, value: 'normal' }, // normal | warning | urgent
  }
});
