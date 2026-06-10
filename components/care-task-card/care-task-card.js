Component({
  properties: {
    task: { type: Object, value: {} },
    icon: { type: String, value: '🍽️' },
  },
  methods: {
    onTap() { this.triggerEvent('tap', { task: this.properties.task }); },
    onComplete() {
      if (!this.properties.task.completed) {
        this.triggerEvent('complete', { task: this.properties.task });
      }
    }
  }
});
