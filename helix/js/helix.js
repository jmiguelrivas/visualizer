class HelixAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.shadowRoot.appendChild(this.canvas);

    // Graph and drawing data with default values
    this.graph = {
      window: {},
      canvas: this.canvas,
      counter: { x: 0, y: 0 },
      direction: { x: 1, y: 1 },
      color: { first: '#f00', second: '#00f' }
    };

    this.dwg = {
      radToDegree: Math.PI / 180,
      radius: 10,
      counter: 90,
      counterInc: 20,
      x: 0,
      y: 0
    };

    this._animationFrameId = null;
  }

  connectedCallback() {
    this.updateSize();
    this.animate();
    window.addEventListener('resize', this.updateSize.bind(this));
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._animationFrameId);
    window.removeEventListener('resize', this.updateSize.bind(this));
  }

  updateSize() {
    this.graph.window = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio
    };
    this.canvas.width = this.graph.window.width * this.graph.window.ratio;
    this.canvas.height = this.graph.window.height * this.graph.window.ratio;
    this.canvas.getContext('2d').scale(this.graph.window.ratio, this.graph.window.ratio);
  }

  animate() {
    const ctx = this.canvas.getContext('2d');
    const g = this.graph;
    const d = this.dwg;

    // Update counters
    g.counter.x += g.direction.x;
    g.counter.y += g.direction.y;

    if (g.counter.x > g.window.width || g.counter.x < 0) {
      g.direction.x *= -1;
      ctx.clearRect(0, 0, g.window.width, g.window.height);
    }
    if (g.counter.y > g.window.height || g.counter.y < 0) {
      g.direction.y *= -1;
    }

    // Draw current frame
    this.draw(ctx);

    // Request next frame
    this._animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  draw(ctx) {
    const g = this.graph;
    const d = this.dwg;

    d.counter = d.counter >= 360 ? 0 : d.counter + d.counterInc;

    // Red helix
    d.x = g.counter.x + Math.cos(d.counter * d.radToDegree) * d.radius;
    d.y = g.counter.y + Math.sin(d.counter * -d.radToDegree) * d.radius;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(d.x - 1, d.y - 1);
    ctx.lineTo(d.x, d.y);
    ctx.strokeStyle = g.color.first;
    ctx.stroke();
    ctx.closePath();

    // Blue helix
    d.x = g.counter.x + Math.cos(-d.counter * d.radToDegree) * d.radius;
    d.y = g.counter.y + Math.sin(d.counter * d.radToDegree) * d.radius;
    ctx.beginPath();
    ctx.moveTo(d.x - 1, d.y - 1);
    ctx.lineTo(d.x, d.y);
    ctx.strokeStyle = g.color.second;
    ctx.stroke();
    ctx.closePath();

    // Origin
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(g.counter.x - 1, g.counter.y - 1);
    ctx.lineTo(g.counter.x, g.counter.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
    ctx.stroke();
    ctx.closePath();
  }
}

customElements.define('helix-visualizer', HelixAnimation);
