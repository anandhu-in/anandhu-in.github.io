/**
 * spider-web.js
 * ---------------------------------------------------------------------------
 * A physically-simulated silk web background.
 *
 * Approach: position-based dynamics (Verlet integration + iterative distance
 * constraints), NOT a particle-network / rotating-icon effect.
 *
 * - Structure is generated once as an irregular set of connected points
 *   (jittered radial strands + broken, non-concentric connecting rings).
 * - Those points ARE the geometry that gets rendered as thin lines. There is
 *   no separate "icon" being transformed.
 * - The cursor only displaces points inside a small radius. Because those
 *   points are constrained to their neighbors, the disturbance has to
 *   propagate through the graph to reach nearby strands -> that propagation
 *   IS the "wave", it isn't drawn or faked.
 * - Verlet integration gives us implicit velocity (x - prevX), so damping is
 *   just shrinking that implicit velocity each frame. With no continuous
 *   driving force, a settled web is a stable fixed point -> it stays still
 *   until touched, with no idle animation loop required to fake stillness.
 * - Only line segments between constraint pairs are drawn. The physics
 *   points themselves are never rendered (no dots / nodes / glow).
 *
 * Public API:
 *   SpiderWeb.init(selectorOrElement, overrides)  -> instance
 *   instance.destroy()
 * If no explicit init() call is made, the module auto-initializes against
 * the first element matching #hero once the DOM is ready.
 * ---------------------------------------------------------------------------
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // CONFIG — tune freely. Values below are the desktop baseline; a reduced
  // profile is applied automatically on small / touch screens (see
  // getResponsiveConfig).
  // ---------------------------------------------------------------------
  const CONFIG = {
    // --- structure ---
    strandCount: 16,          // number of radial silk lines (kept non-round on purpose)
    segmentsPerRadial: 6,     // points along each radial strand (excluding hub)
    ringCount: 5,             // number of rough "connecting ring" passes
    ringKeepProbability: 0.82,// chance a given ring connection is actually drawn (creates broken sections)
    angleJitter: 0.16,        // radians of random offset per radial angle
    radiusJitter: 0.16,       // +/- fractional jitter on how far each anchor sits
    curveJitter: 0.10,        // perpendicular bow jitter along a radial strand (fraction of segment length)
    anchorReach: 0.78,        // anchors sit at this fraction of the diagonal half-length (>viewport edge for some)
    hubOffset: 0.10,          // how far the hub may sit from true center (fraction of min dimension)

    // --- physics ---
    stiffness: 0.10,          // constraint correction strength per iteration (0-1)
    constraintIterations: 3,  // relaxation passes per frame
    damping: 0.98,           // implicit-velocity retention per frame (lower = settles faster)
    maxVelocity: 6,           // px/frame clamp on implicit velocity, prevents instability

    // --- cursor interaction ---
    interactionRadius: 500,   // px, scaled responsively in getResponsiveConfig
    interactionStrength: 25,  // max px displacement applied at the very center of the radius
    touchInteractionStrength: 20,

    // --- rendering ---
    baseLineWidth: 0.9,
    lineWidthVariance: 0.5,
    baseOpacity: 0.20,
    opacityVariance: 0.16,
    colorNear: [150, 175, 205],  // cold blue highlight (foreground-ish strands)
    colorFar: [40, 48, 60],      // near-black / charcoal-blue (background-ish strands)
    backgroundTint: null,        // set e.g. 'rgba(4,6,10,1)' to paint a backdrop; null = transparent canvas

    // --- performance / responsive ---
    mobileBreakpoint: 720,
    mobile: {
      strandCount: 9,
      segmentsPerRadial: 4,
      ringCount: 3,
      constraintIterations: 10,
      interactionRadius: 400,
      interactionStrength: 20,
    },

    zIndex: 0, // must stay behind title content
  };

  function getResponsiveConfig(width) {
    const cfg = Object.assign({}, CONFIG);
    if (width <= CONFIG.mobileBreakpoint) {
      Object.assign(cfg, CONFIG.mobile);
    }
    return cfg;
  }

  // ---------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---------------------------------------------------------------------
  // Point + Constraint primitives
  // ---------------------------------------------------------------------
  function makePoint(x, y, pinned, depth) {
    return {
      x, y, px: x, py: y,   // current + previous position (Verlet)
      pinned: !!pinned,
      depth: depth,          // 0 = far/background, 1 = near/foreground (visual only)
    };
  }

  function makeConstraint(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    return {
      a, b,
      restLength: Math.sqrt(dx * dx + dy * dy),
      widthFactor: rand(0.6, 1.4),
      opacityFactor: rand(0.7, 1.3),
    };
  }

  // ---------------------------------------------------------------------
  // SpiderWeb instance
  // ---------------------------------------------------------------------
  class SpiderWeb {
    constructor(container, overrides) {
      this.container = container;
      this.overrides = overrides || {};
      this.points = [];
      this.constraints = [];
      this.pointer = { x: -9999, y: -9999, active: false };
      this.width = 0;
      this.height = 0;
      this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      this._raf = null;
      this._destroyed = false;

      this._bindMethods();
      this._setupCanvas();
      this._applyContainerPositioning();
      this._observeResize();
      this._bindPointerEvents();
      this._bindVisibility();

      this._rebuild();
      this._loop();
    }

    _bindMethods() {
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._loop = this._loop.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onVisibilityChange = this._onVisibilityChange.bind(this);
    }

    _setupCanvas() {
      const canvas = document.createElement('canvas');
      canvas.className = 'spider-web-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.container.insertBefore(canvas, this.container.firstChild);
      this._resizeCanvas();
    }

    _applyContainerPositioning() {
      // Only touch positioning if the container isn't already positioned,
      // so the absolutely-positioned canvas has a valid offset parent.
      // This does not alter any existing layout/visual rules.
      const computed = window.getComputedStyle(this.container);
      if (computed.position === 'static') {
        this.container.style.position = 'relative';
      }
    }

    _resizeCanvas() {
      const rect = this.container.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    _observeResize() {
      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('orientationchange', this._onResize, { passive: true });
    }

    _onResize() {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        if (this._destroyed) return;
        this._resizeCanvas();
        this._rebuild();
      }, 150);
    }

    _bindVisibility() {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    _onVisibilityChange() {
      if (document.hidden) {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
      } else if (!this._raf && !this._destroyed) {
        this._loop();
      }
    }

    _bindPointerEvents() {
      // Listen on the container (not the canvas, which is pointer-events:none)
      this.container.addEventListener('mousemove', this._onPointerMove, { passive: true });
      this.container.addEventListener('mouseleave', this._onPointerLeave, { passive: true });
      this.container.addEventListener('touchmove', this._onTouchMove, { passive: true });
      this.container.addEventListener('touchend', this._onTouchEnd, { passive: true });
      this.container.addEventListener('touchcancel', this._onTouchEnd, { passive: true });
    }

    _onPointerMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
      this.pointer.active = true;
    }

    _onPointerLeave() {
      this.pointer.active = false;
      this.pointer.x = -9999;
      this.pointer.y = -9999;
    }

    _onTouchMove(e) {
      if (!e.touches || !e.touches.length) return;
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches[0];
      this.pointer.x = t.clientX - rect.left;
      this.pointer.y = t.clientY - rect.top;
      this.pointer.active = true;
      this.pointer.isTouch = true;
    }

    _onTouchEnd() {
      this.pointer.active = false;
      this.pointer.x = -9999;
      this.pointer.y = -9999;
    }

    // -------------------------------------------------------------
    // Web generation — irregular, non-concentric, non-perfectly-radial
    // -------------------------------------------------------------
    _rebuild() {
      const cfg = Object.assign({}, getResponsiveConfig(this.width), this.overrides);
      this.cfg = cfg;
      this.points = [];
      this.constraints = [];

      const minDim = Math.min(this.width, this.height);
      const diag = Math.sqrt(this.width * this.width + this.height * this.height);

      const hubX = this.width / 2 + rand(-1, 1) * cfg.hubOffset * minDim;
      const hubY = this.height / 2 + rand(-1, 1) * cfg.hubOffset * minDim;
      const hub = makePoint(hubX, hubY, true, 1);
      this.points.push(hub);

      // Build radial strands
      const radials = []; // each: array of points from hub(excl) to anchor(incl)
      const baseAnchorDist = diag * cfg.anchorReach;

      for (let i = 0; i < cfg.strandCount; i++) {
        const baseAngle = (i / cfg.strandCount) * Math.PI * 2;
        const angle = baseAngle + rand(-1, 1) * cfg.angleJitter;
        const anchorDist = baseAnchorDist * (1 + rand(-1, 1) * cfg.radiusJitter);
        const anchorX = hubX + Math.cos(angle) * anchorDist;
        const anchorY = hubY + Math.sin(angle) * anchorDist;

        // perpendicular direction for bow/curve jitter
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        const bowAmount = anchorDist * cfg.curveJitter * rand(-1, 1);

        const strandPoints = [];
        const segs = cfg.segmentsPerRadial;
        for (let k = 1; k <= segs; k++) {
          const t = k / segs;
          // slight bow: peaks around the middle of the strand, tapers to 0 at both ends
          const bowT = Math.sin(t * Math.PI) * bowAmount;
          let px = lerp(hubX, anchorX, t) + perpX * bowT;
          let py = lerp(hubY, anchorY, t) + perpY * bowT;
          // small per-point irregularity so points don't sit on a perfect curve
          px += rand(-1, 1) * (minDim * 0.004);
          py += rand(-1, 1) * (minDim * 0.004);

          const pinned = k === segs; // anchor point is fixed (attached to invisible frame)
          const depth = 0.55 + 0.45 * (1 - Math.abs(0.5 - t) * 2) * rand(0.85, 1.15);
          const p = makePoint(px, py, pinned, clamp(depth, 0.25, 1));
          strandPoints.push(p);
          this.points.push(p);
        }
        radials.push(strandPoints);

        // constraint: hub -> first segment point, then chain along the strand
        this.constraints.push(makeConstraint(hub, strandPoints[0]));
        for (let k = 0; k < strandPoints.length - 1; k++) {
          this.constraints.push(makeConstraint(strandPoints[k], strandPoints[k + 1]));
        }
      }

      // Build irregular connecting rings across radials (not concentric circles):
      // pick ring "levels" with jitter, and randomly skip individual connections
      // and occasionally connect to a level +/-1 on the neighbor strand so the
      // rings don't align into a clean polygon.
      const segs = cfg.segmentsPerRadial;
      for (let r = 0; r < cfg.ringCount; r++) {
        const baseLevel = Math.round(((r + 1) / (cfg.ringCount + 1)) * segs);
        for (let i = 0; i < cfg.strandCount; i++) {
          if (Math.random() > cfg.ringKeepProbability) continue; // broken section

          const levelA = clamp(baseLevel + (Math.random() < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : 0), 1, segs) - 1;
          const nextIdx = (i + 1) % cfg.strandCount;
          const levelB = clamp(baseLevel + (Math.random() < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : 0), 1, segs) - 1;

          const pa = radials[i][levelA];
          const pb = radials[nextIdx][levelB];
          if (pa && pb) {
            this.constraints.push(makeConstraint(pa, pb));
          }
        }
      }
    }

    // -------------------------------------------------------------
    // Physics step
    // -------------------------------------------------------------
    _applyCursorForce(cfg) {
      if (!this.pointer.active) return;
      const strength = this.pointer.isTouch ? cfg.touchInteractionStrength : cfg.interactionStrength;
      const radius = cfg.interactionRadius;
      const radiusSq = radius * radius;

      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.pinned) continue;
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq || distSq < 0.0001) continue;

        const dist = Math.sqrt(distSq);
        const falloff = 1 - dist / radius;
        const eased = falloff * falloff; // smoother falloff near the edge of the radius
        const force = eased * strength;
        const nx = dx / dist, ny = dy / dist;
        p.x += nx * force * 0.06;
        p.y += ny * force * 0.06;
      }
    }

    _integrate(cfg) {
      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.pinned) continue;

        let vx = (p.x - p.px) * cfg.damping;
        let vy = (p.y - p.py) * cfg.damping;

        const vLen = Math.sqrt(vx * vx + vy * vy);
        if (vLen > cfg.maxVelocity) {
          const scale = cfg.maxVelocity / vLen;
          vx *= scale; vy *= scale;
        }

        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;
      }
    }

    _satisfyConstraints(cfg) {
      for (let iter = 0; iter < cfg.constraintIterations; iter++) {
        for (let i = 0; i < this.constraints.length; i++) {
          const c = this.constraints[i];
          const a = c.a, b = c.b;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const diff = ((dist - c.restLength) / dist) * cfg.stiffness;
          const offX = dx * 0.5 * diff;
          const offY = dy * 0.5 * diff;

          if (!a.pinned) { a.x += offX; a.y += offY; }
          if (!b.pinned) { b.x -= offX; b.y -= offY; }
        }
      }
    }

    _step() {
      const cfg = this.cfg;
      this._applyCursorForce(cfg);
      this._integrate(cfg);
      this._satisfyConstraints(cfg);
    }

    // -------------------------------------------------------------
    // Render
    // -------------------------------------------------------------
    _render() {
      const ctx = this.ctx;
      const cfg = this.cfg;
      ctx.clearRect(0, 0, this.width, this.height);

      if (cfg.backgroundTint) {
        ctx.fillStyle = cfg.backgroundTint;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      for (let i = 0; i < this.constraints.length; i++) {
        const c = this.constraints[i];
        const depth = (c.a.depth + c.b.depth) * 0.5;

        const col = [
          lerp(cfg.colorFar[0], cfg.colorNear[0], depth),
          lerp(cfg.colorFar[1], cfg.colorNear[1], depth),
          lerp(cfg.colorFar[2], cfg.colorNear[2], depth),
        ];

        const opacity = clamp(
          (cfg.baseOpacity + rand(-1, 1) * 0 + (cfg.opacityVariance * (c.opacityFactor - 1))) * (0.5 + depth * 0.6),
          0.02,
          0.9
        );

        ctx.strokeStyle = `rgba(${col[0] | 0}, ${col[1] | 0}, ${col[2] | 0}, ${opacity.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.35, cfg.baseLineWidth * c.widthFactor * (0.6 + depth * 0.6));
        ctx.beginPath();
        ctx.moveTo(c.a.x, c.a.y);
        ctx.lineTo(c.b.x, c.b.y);
        ctx.stroke();
      }
    }

    _loop() {
      if (this._destroyed) return;
      this._step();
      this._render();
      this._raf = requestAnimationFrame(this._loop);
    }

    destroy() {
      this._destroyed = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('orientationchange', this._onResize);
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
      this.container.removeEventListener('mousemove', this._onPointerMove);
      this.container.removeEventListener('mouseleave', this._onPointerLeave);
      this.container.removeEventListener('touchmove', this._onTouchMove);
      this.container.removeEventListener('touchend', this._onTouchEnd);
      this.container.removeEventListener('touchcancel', this._onTouchEnd);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // ---------------------------------------------------------------------
  // Public API + auto-init
  // ---------------------------------------------------------------------
  const api = {
    init(selectorOrElement, overrides) {
      const el = typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;
      if (!el) {
        console.warn('[spider-web] target element not found:', selectorOrElement);
        return null;
      }
      return new SpiderWeb(el, overrides);
    },
  };

  window.SpiderWeb = api;

  function autoInit() {
    const hero = document.querySelector('#hero');
    if (hero && !hero.__spiderWebInstance) {
      hero.__spiderWebInstance = api.init(hero);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();