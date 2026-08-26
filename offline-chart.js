/* PAVENRO Focus offline chart renderer.
   Implements the small Chart.js-compatible surface used by Focus without a CDN. */
(() => {
  const asColor = (value, fallback) => Array.isArray(value) ? value[0] || fallback : value || fallback;
  const valuesOf = dataset => (dataset?.data || []).map(value => Number(value) || 0);
  const palette = ['#4c5fd5', '#20b8a6', '#f2a43a', '#d65778', '#7d63da', '#4b91e2'];

  class OfflineChart {
    static defaults = {color:'#65728a'};

    constructor(canvas, config = {}) {
      this.canvas = canvas;
      this.config = config;
      this.ctx = canvas?.getContext?.('2d') || null;
      this.resize = () => this.draw();
      window.addEventListener?.('resize', this.resize);
      requestAnimationFrame(() => this.draw());
    }

    destroy() {
      window.removeEventListener?.('resize', this.resize);
      if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    size() {
      const rect = this.canvas.getBoundingClientRect?.() || {};
      const width = Math.max(220, Math.round(rect.width || this.canvas.clientWidth || 520));
      const height = Math.max(150, Math.round(rect.height || this.canvas.clientHeight || 260));
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      if (this.canvas.width !== Math.round(width * ratio) || this.canvas.height !== Math.round(height * ratio)) {
        this.canvas.width = Math.round(width * ratio);
        this.canvas.height = Math.round(height * ratio);
      }
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      return {width, height};
    }

    draw() {
      if (!this.ctx || !this.canvas) return;
      const {width, height} = this.size();
      this.ctx.clearRect(0, 0, width, height);
      const type = this.config.type || 'bar';
      if (type === 'doughnut') return this.doughnut(width, height);
      if (type === 'radar' || type === 'polarArea') return this.radial(width, height, type);
      if (type === 'line') return this.line(width, height);
      return this.bar(width, height);
    }

    grid(width, height, left = 44, right = 14, top = 16, bottom = 30) {
      const ctx = this.ctx, color = getComputedStyle(document.body).getPropertyValue('--line').trim() || '#dce3ee';
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = .72;
      for (let index = 0; index <= 4; index += 1) {
        const y = top + (height - top - bottom) * index / 4;
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
      }
      ctx.restore();
      return {left, right, top, bottom, plotWidth:width-left-right, plotHeight:height-top-bottom};
    }

    label(text, x, y, align = 'center', size = 10) {
      const ctx = this.ctx;
      ctx.save(); ctx.fillStyle = OfflineChart.defaults.color || '#65728a'; ctx.font = `${size}px system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle';
      const safe = String(text ?? ''); ctx.fillText(safe.length > 18 ? `${safe.slice(0, 16)}…` : safe, x, y); ctx.restore();
    }

    bar(width, height) {
      const labels = this.config.data?.labels || [], dataset = this.config.data?.datasets?.[0] || {}, values = valuesOf(dataset);
      const horizontal = this.config.options?.indexAxis === 'y';
      const area = this.grid(width, height, horizontal ? 82 : 40, 14, 16, 32);
      const maximum = Math.max(1, Number(this.config.options?.scales?.[horizontal ? 'x' : 'y']?.max) || 100, ...values);
      const colors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : values.map(() => dataset.backgroundColor || palette[0]);
      const count = Math.max(1, values.length);
      this.ctx.save();
      if (horizontal) {
        const row = area.plotHeight / count, thickness = Math.min(18, row * .55);
        values.forEach((value, index) => {
          const y = area.top + row * index + row / 2;
          this.ctx.fillStyle = colors[index] || palette[index % palette.length];
          this.ctx.fillRect(area.left, y-thickness/2, area.plotWidth * value / maximum, thickness);
          this.label(labels[index] || `#${index+1}`, area.left-8, y, 'right', 9);
        });
      } else {
        const column = area.plotWidth / count, thickness = Math.min(34, column * .58);
        values.forEach((value, index) => {
          const barHeight = area.plotHeight * value / maximum, x = area.left + column * index + column / 2;
          this.ctx.fillStyle = colors[index] || palette[index % palette.length];
          this.ctx.fillRect(x-thickness/2, area.top+area.plotHeight-barHeight, thickness, barHeight);
          this.label(labels[index] || `#${index+1}`, x, height-15, 'center', 9);
        });
      }
      this.ctx.restore();
    }

    line(width, height) {
      const labels = this.config.data?.labels || [], datasets = this.config.data?.datasets || [], area = this.grid(width, height);
      const all = datasets.flatMap(valuesOf), maximum = Math.max(1, Number(this.config.options?.scales?.y?.max) || 0, ...all, 10);
      datasets.forEach((dataset, datasetIndex) => {
        const values = valuesOf(dataset), color = asColor(dataset.borderColor, palette[datasetIndex % palette.length]);
        const points = values.map((value, index) => ({
          x:area.left + (values.length <= 1 ? area.plotWidth / 2 : area.plotWidth * index / (values.length-1)),
          y:area.top + area.plotHeight * (1-value/maximum)
        }));
        if (dataset.fill && points.length) {
          this.ctx.save(); this.ctx.fillStyle = asColor(dataset.backgroundColor, `${color}22`); this.ctx.beginPath();
          this.ctx.moveTo(points[0].x, area.top+area.plotHeight); points.forEach(point => this.ctx.lineTo(point.x, point.y));
          this.ctx.lineTo(points.at(-1).x, area.top+area.plotHeight); this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();
        }
        this.ctx.save(); this.ctx.strokeStyle = color; this.ctx.lineWidth = 2.2; this.ctx.beginPath();
        points.forEach((point, index) => index ? this.ctx.lineTo(point.x, point.y) : this.ctx.moveTo(point.x, point.y)); this.ctx.stroke();
        points.forEach(point => {this.ctx.fillStyle=color;this.ctx.beginPath();this.ctx.arc(point.x,point.y,3,0,Math.PI*2);this.ctx.fill()}); this.ctx.restore();
      });
      labels.forEach((label, index) => this.label(label, area.left+(labels.length<=1?area.plotWidth/2:area.plotWidth*index/(labels.length-1)), height-14, 'center', 9));
    }

    doughnut(width, height) {
      const dataset = this.config.data?.datasets?.[0] || {}, values = valuesOf(dataset), total = Math.max(1, values.reduce((sum, value) => sum + value, 0));
      const cx = width/2, cy = height/2, radius = Math.min(width,height)*.37, cutout = radius * .68;
      let start = -Math.PI/2;
      values.forEach((value,index) => {
        const end = start + Math.PI*2*value/total;
        this.ctx.beginPath(); this.ctx.arc(cx,cy,radius,start,end); this.ctx.arc(cx,cy,cutout,end,start,true); this.ctx.closePath();
        const colors = dataset.backgroundColor; this.ctx.fillStyle = Array.isArray(colors) ? colors[index] || palette[index%palette.length] : colors || palette[index%palette.length]; this.ctx.fill(); start=end;
      });
    }

    radial(width, height, type) {
      const labels = this.config.data?.labels || [], dataset = this.config.data?.datasets?.[0] || {}, values = valuesOf(dataset), count = Math.max(3, values.length || labels.length || 3);
      const cx=width/2,cy=height/2,radius=Math.min(width,height)*.35,color=asColor(dataset.borderColor,palette[0]);
      this.ctx.save();
      for(let ring=1;ring<=4;ring+=1){this.ctx.beginPath();for(let index=0;index<count;index+=1){const angle=-Math.PI/2+Math.PI*2*index/count,r=radius*ring/4,x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r;index?this.ctx.lineTo(x,y):this.ctx.moveTo(x,y)}this.ctx.closePath();this.ctx.strokeStyle='#dce3ee';this.ctx.stroke()}
      if(type==='polarArea'){
        values.forEach((value,index)=>{const angle=-Math.PI/2+Math.PI*2*index/count,next=-Math.PI/2+Math.PI*2*(index+1)/count,r=radius*Math.min(100,value)/100;this.ctx.beginPath();this.ctx.moveTo(cx,cy);this.ctx.arc(cx,cy,r,angle,next);this.ctx.closePath();this.ctx.fillStyle=`${palette[index%palette.length]}99`;this.ctx.fill()});
      }else{
        this.ctx.beginPath();values.forEach((value,index)=>{const angle=-Math.PI/2+Math.PI*2*index/count,r=radius*Math.min(100,value)/100,x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r;index?this.ctx.lineTo(x,y):this.ctx.moveTo(x,y)});this.ctx.closePath();this.ctx.fillStyle=asColor(dataset.backgroundColor,`${color}25`);this.ctx.fill();this.ctx.strokeStyle=color;this.ctx.lineWidth=2;this.ctx.stroke();
      }
      labels.forEach((label,index)=>{const angle=-Math.PI/2+Math.PI*2*index/count,x=cx+Math.cos(angle)*(radius+18),y=cy+Math.sin(angle)*(radius+18);this.label(label,x,y,'center',8)});this.ctx.restore();
    }
  }

  window.Chart = OfflineChart;
})();
