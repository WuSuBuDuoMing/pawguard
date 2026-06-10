Component({
  properties: {
    percent: { type: Number, value: 0 },
    size: { type: Number, value: 120 },
    strokeWidth: { type: Number, value: 10 },
    color: { type: String, value: '#FF9F5A' },
    bgColor: { type: String, value: 'rgba(255,159,90,0.15)' },
    label: { type: String, value: '' },
  },
  observers: {
    'percent, size, strokeWidth, color, bgColor': function() { this.drawRing(); }
  },
  lifetimes: { ready() { this.drawRing(); } },
  methods: {
    drawRing() {
      const { percent, size, strokeWidth, color, bgColor } = this.data;
      const query = this.createSelectorQuery();
      query.select('#ringCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        const cx = size / 2, cy = size / 2, r = (size - strokeWidth) / 2;
        // 背景环
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
        // 进度环
        if (percent > 0) {
          const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, angle);
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      });
    }
  }
});
