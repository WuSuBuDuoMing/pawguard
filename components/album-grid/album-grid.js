Component({
  properties: {
    photos: { type: Array, value: [] },
    showTitle: { type: Boolean, value: true },
  },
  methods: {
    onPhotoTap(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('photoTap', { photos: this.properties.photos, index });
    }
  }
});
