

    /* ================================================================
       STAR FIELD + BACKGROUND ROCKETS
       ================================================================ */
    (function () {

      const canvas = document.getElementById('starCanvas');
      const ctx    = canvas.getContext('2d');

      function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      /* — Stars — */
      const STAR_COUNT = 180;
      const stars = Array.from({ length: STAR_COUNT }, () => ({
        x:          Math.random() * window.innerWidth,
        y:          Math.random() * window.innerHeight,
        r:          Math.random() * 1.5 + 0.3,
        alpha:      Math.random(),
        speed:      Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        drift:      (Math.random() - 0.5) * 0.08,
      }));

      /* — Background rockets — */
      function spawnRocket() {
        const speed   = Math.random() * 2.0 + 1.5;
        const vy      = (Math.random() - 0.5) * 0.6;
        const goRight = Math.random() > 0.5;
        return {
          x:       goRight ? -60 : canvas.width + 60,
          y:       Math.random() * canvas.height * 0.85 + canvas.height * 0.05,
          vx:      goRight ? speed : -speed,
          vy,
          size:    Math.random() * 16 + 18,
          alpha:   0,
          goRight,
        };
      }

      const rockets       = [];
      let   lastSpawn     = 0;
      const SPAWN_INTERVAL = 1800;

      function drawRollingRocket(r) {
        /* golden trail */
        const trailLen = 28;
        for (let t = 0; t < trailLen; t++) {
          const prog = t / trailLen;
          const tx   = r.x - r.vx * (trailLen - t) * 0.9;
          const ty   = r.y - r.vy * (trailLen - t) * 0.9;
          ctx.save();
          ctx.globalAlpha = r.alpha * prog * 0.5;
          ctx.shadowBlur  = 14;
          ctx.shadowColor = 'rgba(200,168,78,0.9)';
          const pr   = r.size * 0.18 * prog;
          const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, pr + 2);
          grad.addColorStop(0,   'rgba(232,213,160,1)');
          grad.addColorStop(0.4, 'rgba(200,168,78,0.8)');
          grad.addColorStop(1,   'rgba(200,168,78,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(tx, ty, pr + 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        /* rocket body */
        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.translate(r.x, r.y);
        ctx.rotate(Math.atan2(r.vy, r.vx));

        const s = r.size;

        /* flame */
        const flame = ctx.createRadialGradient(-s * 0.6, 0, 0, -s * 0.6, 0, s * 0.55);
        flame.addColorStop(0,   'rgba(255,255,200,0.95)');
        flame.addColorStop(0.3, 'rgba(200,168,78,0.85)');
        flame.addColorStop(0.7, 'rgba(180,80,0,0.4)');
        flame.addColorStop(1,   'rgba(180,80,0,0)');
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.ellipse(-s * 0.6, 0, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        /* body */
        const body = ctx.createLinearGradient(0, -s * 0.22, 0, s * 0.22);
        body.addColorStop(0,   '#E8D5A0');
        body.addColorStop(0.4, '#C8A84E');
        body.addColorStop(1,   '#8B6B1A');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.45, s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        /* nose */
        ctx.fillStyle   = '#E8D5A0';
        ctx.shadowBlur  = 10;
        ctx.shadowColor = 'rgba(232,213,160,0.8)';
        ctx.beginPath();
        ctx.moveTo( s * 0.45,  0);
        ctx.lineTo( s * 0.18, -s * 0.13);
        ctx.lineTo( s * 0.18,  s * 0.13);
        ctx.closePath();
        ctx.fill();

        /* fin top */
        ctx.fillStyle  = '#C8A84E';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-s * 0.1,  -s * 0.18);
        ctx.lineTo(-s * 0.38, -s * 0.38);
        ctx.lineTo(-s * 0.38, -s * 0.18);
        ctx.closePath();
        ctx.fill();

        /* fin bottom */
        ctx.beginPath();
        ctx.moveTo(-s * 0.1,   s * 0.18);
        ctx.lineTo(-s * 0.38,  s * 0.38);
        ctx.lineTo(-s * 0.38,  s * 0.18);
        ctx.closePath();
        ctx.fill();

        /* porthole */
        ctx.fillStyle   = 'rgba(10,20,50,0.7)';
        ctx.beginPath();
        ctx.arc(s * 0.1, 0, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,213,160,0.6)';
        ctx.lineWidth   = 1;
        ctx.stroke();

        ctx.restore();
      }

      function drawRockets(now) {
        if (now - lastSpawn > SPAWN_INTERVAL) {
          rockets.push(spawnRocket());
          lastSpawn = now;
        }
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          if (r.goRight) {
            if (r.x < canvas.width * 0.1)    r.alpha = Math.min(r.alpha + 0.05, 0.92);
            else if (r.x > canvas.width * 0.85) r.alpha = Math.max(r.alpha - 0.03, 0);
          } else {
            if (r.x > canvas.width * 0.9)    r.alpha = Math.min(r.alpha + 0.05, 0.92);
            else if (r.x < canvas.width * 0.15) r.alpha = Math.max(r.alpha - 0.03, 0);
          }
          drawRollingRocket(r);
          r.x += r.vx;
          r.y += r.vy;
          if (r.x > canvas.width + 80 || r.x < -80 || r.alpha <= 0) rockets.splice(i, 1);
        }
      }

      function loop(ts) {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        /* draw stars */
        stars.forEach(s => {
          s.alpha += s.speed * s.twinkleDir;
          if (s.alpha >= 1)    { s.alpha = 1;    s.twinkleDir = -1; }
          if (s.alpha <= 0.05) { s.alpha = 0.05; s.twinkleDir =  1; }
          s.x += s.drift;
          if (s.x > W + 2) s.x = -2;
          if (s.x < -2)    s.x =  W + 2;

          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle   = s.r > 1.2 ? `rgba(232,213,160,${s.alpha})` : `rgba(200,210,240,${s.alpha})`;
          ctx.shadowBlur  = s.r > 1.2 ? 8 : 2;
          ctx.shadowColor = s.r > 1.2 ? 'rgba(200,168,78,0.6)' : 'rgba(180,200,255,0.4)';
          ctx.fill();
          ctx.restore();
        });

        drawRockets(ts);
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

    })();


    /* ================================================================
       LAUNCH ROCKET  (same style as background rockets, vertical, s=90)
       ================================================================ */
    function startRocketLaunch() {
      const canvas = document.getElementById('rocket-canvas');
      const ctx    = canvas.getContext('2d');

      canvas.width         = window.innerWidth;
      canvas.height        = window.innerHeight;
      canvas.style.opacity = '1';

      const s = 90;
      let y            = canvas.height + s * 2;
      let alpha        = 0;
      let speed        = 3;
      let flickerPhase = 0;
      const trail      = [];

      function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;

        /* fade in / fade out */
        if (y > canvas.height * 0.7)  alpha = Math.min(alpha + 0.08, 1);
        if (y < canvas.height * 0.12) alpha = Math.max(alpha - 0.05, 0);

        speed = Math.min(speed + 0.22, 22);
        y    -= speed;

        trail.push(y);
        if (trail.length > 35) trail.shift();

        /* golden trail */
        for (let t = 0; t < trail.length; t++) {
          const prog = t / trail.length;
          ctx.save();
          ctx.globalAlpha = alpha * prog * 0.45;
          ctx.shadowBlur  = 20;
          ctx.shadowColor = 'rgba(200,168,78,0.9)';
          const pr   = s * 0.15 * prog;
          const grad = ctx.createRadialGradient(cx, trail[t], 0, cx, trail[t], pr + 3);
          grad.addColorStop(0,   'rgba(232,213,160,1)');
          grad.addColorStop(0.4, 'rgba(200,168,78,0.8)');
          grad.addColorStop(1,   'rgba(200,168,78,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, trail[t], pr + 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        /* rocket — rotated -π/2 so it points upward */
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, y);
        ctx.rotate(-Math.PI / 2);

        flickerPhase += 0.18;
        const flickerScale = 1 + Math.sin(flickerPhase * 7) * 0.1;

        /* flame */
        ctx.save();
        ctx.scale(1, flickerScale);
        const flame = ctx.createRadialGradient(-s * 0.6, 0, 0, -s * 0.6, 0, s * 0.62);
        flame.addColorStop(0,   'rgba(255,255,200,0.95)');
        flame.addColorStop(0.3, 'rgba(200,168,78,0.85)');
        flame.addColorStop(0.7, 'rgba(180,80,0,0.4)');
        flame.addColorStop(1,   'rgba(180,80,0,0)');
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.ellipse(-s * 0.6, 0, s * 0.62, s * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* body */
        const body = ctx.createLinearGradient(0, -s * 0.22, 0, s * 0.22);
        body.addColorStop(0,   '#E8D5A0');
        body.addColorStop(0.4, '#C8A84E');
        body.addColorStop(1,   '#8B6B1A');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.45, s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        /* nose */
        ctx.fillStyle   = '#E8D5A0';
        ctx.shadowBlur  = 12;
        ctx.shadowColor = 'rgba(232,213,160,0.8)';
        ctx.beginPath();
        ctx.moveTo( s * 0.45,  0);
        ctx.lineTo( s * 0.18, -s * 0.13);
        ctx.lineTo( s * 0.18,  s * 0.13);
        ctx.closePath();
        ctx.fill();

        /* fin top */
        ctx.fillStyle  = '#C8A84E';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-s * 0.1,  -s * 0.18);
        ctx.lineTo(-s * 0.38, -s * 0.38);
        ctx.lineTo(-s * 0.38, -s * 0.18);
        ctx.closePath();
        ctx.fill();

        /* fin bottom */
        ctx.beginPath();
        ctx.moveTo(-s * 0.1,   s * 0.18);
        ctx.lineTo(-s * 0.38,  s * 0.38);
        ctx.lineTo(-s * 0.38,  s * 0.18);
        ctx.closePath();
        ctx.fill();

        /* porthole */
        ctx.fillStyle   = 'rgba(10,20,50,0.7)';
        ctx.beginPath();
        ctx.arc(s * 0.1, 0, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,213,160,0.6)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        ctx.restore();

        if (y > -s * 3) {
          requestAnimationFrame(drawFrame);
        } else {
          canvas.style.opacity = '0';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      requestAnimationFrame(drawFrame);
    }


    /* ================================================================
       RSVP
       ================================================================ */
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycby9a5C6Q0dsqm6bWHlXPzqo1EA4F8gsCVzgawxor_k1Esfo7SNG_bBQOSbDIIgUwHzV/exec';

    function confirmRSVP() {
      const inputs     = document.querySelectorAll('.rsvp-input');
      const n          = inputs[0].value.trim();
      const fn         = inputs[1].value.trim();
      const nc         = inputs[2].value.trim();
      const btn        = document.querySelector('.rsvp-btn');
      const phoneRegex = /^(?:(?:\+|00)213|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

      inputs.forEach(i => i.classList.remove('error'));

      let hasError = false;
      if (!n)                        { inputs[0].classList.add('error'); hasError = true; }
      if (!fn)                       { inputs[1].classList.add('error'); hasError = true; }
      if (!phoneRegex.test(nc))      { inputs[2].classList.add('error'); hasError = true; }

      if (hasError) {
        btn.textContent    = 'Please check your info';
        btn.style.background = '#b30000';
        setTimeout(() => {
          btn.textContent    = 'Confirm Attendance';
          btn.style.background = '#C8A84E';
        }, 2500);
        return;
      }

      btn.textContent      = 'Sending...';
      btn.style.pointerEvents = 'none';

      function launchSuccess() {
        btn.textContent      = 'Thank you!';
        btn.style.background = '#2D8B5E';
        inputs.forEach(i => {
          i.disabled       = true;
          i.style.opacity  = '0.5';
        });
        setTimeout(() => {
          document.body.classList.add('page-shake');
          document.getElementById('smoke').classList.add('show');
          startRocketLaunch();
          setTimeout(() => document.body.classList.remove('page-shake'), 500);
          setTimeout(() => document.getElementById('thankyou').classList.add('show'), 4200);
        }, 500);
      }

      fetch(GOOGLE_SHEET_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nom: n, prenom: fn, telephone: nc }),
      })
      .then(() => launchSuccess())
      .catch(() => {
        btn.textContent      = 'Error — please retry';
        btn.style.background = '#b30000';
        btn.style.pointerEvents = 'auto';
        setTimeout(() => {
          btn.textContent      = 'Confirm Attendance';
          btn.style.background = '#C8A84E';
        }, 3000);
      });
    }


    /* ================================================================
       CARD STARS  (same scheme as main starfield)
       ================================================================ */
    function initCardStars() {
      const canvas = document.getElementById('stars-canvas');
      if (!canvas) return;
      const ctx  = canvas.getContext('2d');
      const card = canvas.parentElement;

      function resize() {
        canvas.width  = card.offsetWidth;
        canvas.height = card.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      const stars = Array.from({ length: 60 }, () => ({
        x:          Math.random() * canvas.width,
        y:          Math.random() * canvas.height,
        r:          Math.random() * 1.5 + 0.3,
        alpha:      Math.random(),
        speed:      Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        drift:      (Math.random() - 0.5) * 0.06,
      }));

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
          s.alpha += s.speed * s.twinkleDir;
          if (s.alpha >= 1)    { s.alpha = 1;    s.twinkleDir = -1; }
          if (s.alpha <= 0.05) { s.alpha = 0.05; s.twinkleDir =  1; }
          s.x += s.drift;
          if (s.x > canvas.width + 2) s.x = -2;
          if (s.x < -2)               s.x =  canvas.width + 2;

          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle   = s.r > 1.2 ? `rgba(232,213,160,${s.alpha})` : `rgba(200,210,240,${s.alpha})`;
          ctx.shadowBlur  = s.r > 1.2 ? 8 : 2;
          ctx.shadowColor = s.r > 1.2 ? 'rgba(200,168,78,0.6)' : 'rgba(180,200,255,0.4)';
          ctx.fill();
          ctx.restore();
        });
        requestAnimationFrame(draw);
      }
      draw();
    }

    /* trigger card stars when the overlay becomes visible */
    const obs = new MutationObserver(function () {
      if (document.getElementById('thankyou').classList.contains('show')) {
        setTimeout(initCardStars, 300);
        obs.disconnect();
      }
    });
    obs.observe(document.getElementById('thankyou'), { attributes: true, attributeFilter: ['class'] });
