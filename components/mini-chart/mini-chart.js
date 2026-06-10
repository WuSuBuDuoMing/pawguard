Component({
  properties: {
    data: { type: Array, value: [] },   // [{label, value}]
    title: { type: String, value: '' },
    latest: { type: String, value: '' },
    color: { type: String, value: '#FF9F5A' },
    width: { type: Number, value: 300 },
    height: { type: Number, value: 150 },
    showLabels: { type: Boolean, value: true },
  },
  data: { labels: [] },
  observers: {
    'data': function(data) {
      if (!data || data.length === 0) return;
      this.setData({ labels: data.map(d => d.label || '') });
      this.drawChart(data);
    }
  },
  lifetimes: { ready() { if (this.data.data.length) this.drawChart(this.data.data); } },
  methods: {
    drawChart(data) {
      if (!data || data.length < 2) return;
      const { width, height, color } = this.data;
      const query = this.createSelectorQuery();
      query.select('#miniChart').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const values = data.map(d => d.value);
        const min = Math.min(...values) - 0.5;
        const max = Math.max(...values) + 0.5;
        const range = max - min || 1;
        const padX = 10, padY = 20;
        const chartW = width - padX * 2;
        const chartH = height - padY * 2;

        // 画网格线
        ctx.strokeStyle = 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
          const y = padY + (chartH / 3) * i;
          ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(width - padX, y); ctx.stroke();
        }

        // 画折线
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const points = values.map((v, i) => ({
          x: padX + (i / (values.length - 1)) * chartW,
          y: padY + (1 - (v - min) / range) * chartH,
        }));
        points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();

        // 渐变填充
        const gradient = ctx.createLinearGradient(0, padY, 0, height);
        gradient.addColorStop(0, color + '30');
        gradient.addColorStop(1, color + '05');
        ctx.lineTo(points[points.length - 1].x, height - padY);
        ctx.lineTo(points[0].x, height - padY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 画圆点
        points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });
    }
  }
});
