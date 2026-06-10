Component({
  properties: { record: { type: Object, value: {} } },
  methods: { onTap() { this.triggerEvent('tap', { record: this.properties.record }); } }
});
