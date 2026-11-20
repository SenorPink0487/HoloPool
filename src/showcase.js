// HoloPool - Cyberpunk Billiards Kinetic Physics & Trajectory Engine
(function initHoloPoolPhysicsEngine() {
    const container = document.getElementById('poolSandbox');
    if (!container) return;
    const canvas = document.getElementById('poolCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const launchBtn = container.closest('.card-inner')?.querySelector('.launch-btn');

    let width = canvas.width = container.clientWidth || 400;
    let height = canvas.height = container.clientHeight || 400;

    const resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth && container.clientHeight) {
            width = canvas.width = container.clientWidth;
            height = canvas.height = container.clientHeight;
            resetTableGeometry();
        }
    });
    resizeObserver.observe(container);

    let table = { x: 30, y: 30, w: width - 60, h: height - 60, r: 14 };
    let pockets = [];
    let ballRadius = 11;

    function resetTableGeometry() {
        const marginX = Math.max(20, width * 0.07);
        const marginY = Math.max(20, height * 0.07);
        table = {
            x: marginX,
            y: marginY,
            w: width - marginX * 2,
            h: height - marginY * 2,
            r: 14
        };
        ballRadius = Math.min(width, height) * 0.028;

        const pR = ballRadius * 1.55;
        pockets = [
            { x: table.x + 8, y: table.y + 8, r: pR },
            { x: table.x + table.w / 2, y: table.y + 2, r: pR },
            { x: table.x + table.w - 8, y: table.y + 8, r: pR },
            { x: table.x + 8, y: table.y + table.h - 8, r: pR },
            { x: table.x + table.w / 2, y: table.y + table.h - 2, r: pR },
            { x: table.x + table.w - 8, y: table.y + table.h - 8, r: pR }
        ];
    }
    resetTableGeometry();

    let balls = [];
    let particles = [];
    let mathBadges = [];
    let shockwaves = [];

    const BALL_TYPES = [
        { num: 0, color: '#ffffff', textColor: '#0f172a', isCue: true },
        { num: 1, color: '#fbbf24', textColor: '#0f172a' },
        { num: 2, color: '#3b82f6', textColor: '#ffffff' },
        { num: 3, color: '#ef4444', textColor: '#ffffff' },
        { num: 4, color: '#8b5cf6', textColor: '#ffffff' },
        { num: 5, color: '#f97316', textColor: '#ffffff' },
        { num: 8, color: '#1e293b', textColor: '#ffffff' },
        { num: 9, color: '#10b981', textColor: '#ffffff' },
        { num: 10, color: '#ec4899', textColor: '#ffffff' }
    ];

    function initBalls() {
        balls = [];
        const cy = table.y + table.h * 0.5;

        // Cue Ball
        balls.push({
            id: 0,
            x: table.x + table.w * 0.72,
            y: cy,
            vx: 0,
            vy: 0,
            r: ballRadius,
            ...BALL_TYPES[0],
            potted: false
        });

        // Triangle Rack
        const rackX = table.x + table.w * 0.28;
        const spacing = ballRadius * 2.08;
        let bIdx = 1;

        const rackLayout = [
            [0],
            [-0.5, 0.5],
            [-1, 0, 1],
            [-1.5, -0.5, 0.5, 1.5]
        ];

        rackLayout.forEach((col, cIdx) => {
            const x = rackX - cIdx * spacing * 0.88;
            col.forEach((offsetY) => {
                if (bIdx < BALL_TYPES.length) {
                    balls.push({
                        id: bIdx,
                        x: x,
                        y: cy + offsetY * spacing,
                        vx: 0,
                        vy: 0,
                        r: ballRadius,
                        ...BALL_TYPES[bIdx],
                        potted: false
                    });
                    bIdx++;
                }
            });
        });
    }
    initBalls();

    let mouse = { x: width / 2, y: height / 2, active: false };
    let aimAngle = Math.PI;
    let cueOffset = 0;
    let autoTimer = 0;
    let idleTime = 0;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
        idleTime = 0;
    });

    container.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        idleTime = 0;
        shootCueBall(aimAngle, 9.5 + Math.random() * 3);
    });

    if (launchBtn) {
        launchBtn.addEventListener('mouseenter', () => {
            shootCueBall(aimAngle, 11);
        });
    }

    function shootCueBall(angle, speed) {
        const cue = balls.find(b => b.isCue && !b.potted);
        if (!cue) return;
        if (Math.hypot(cue.vx, cue.vy) > 0.6) return;

        cue.vx = Math.cos(angle) * speed;
        cue.vy = Math.sin(angle) * speed;
        cueOffset = -28;

        shockwaves.push({ x: cue.x, y: cue.y, r: 6, maxR: 65, alpha: 0.85, color: '#38bdf8' });
        spawnMathBadge(cue.x, cue.y, `F = ${speed.toFixed(1)}N · Δp`);
    }

    function spawnMathBadge(x, y, text) {
        mathBadges.push({ x, y: y - 10, text, alpha: 1, vy: -0.5 });
    }

    function spawnSparks(x, y, color, count = 6) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 3;
            particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                r: 1.2 + Math.random() * 1.8,
                color: color || '#ff2a5f',
                alpha: 1,
                decay: 0.035 + Math.random() * 0.02
            });
        }
    }

    function updateAutoDemo() {
        idleTime++;
        const cue = balls.find(b => b.isCue && !b.potted);

        if (cue && mouse.active) {
            aimAngle = Math.atan2(mouse.y - cue.y, mouse.x - cue.x);
        } else if (cue && idleTime > 80) {
            let target = null;
            let minDist = Infinity;
            balls.forEach(b => {
                if (!b.isCue && !b.potted) {
                    const d = Math.hypot(b.x - cue.x, b.y - cue.y);
                    if (d < minDist) {
                        minDist = d;
                        target = b;
                    }
                }
            });

            if (target) {
                const targetAngle = Math.atan2(target.y - cue.y, target.x - cue.x);
                let diff = targetAngle - aimAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                aimAngle += diff * 0.07;
            }

            autoTimer++;
            const totalMotion = balls.reduce((acc, b) => acc + Math.hypot(b.vx, b.vy), 0);
            if (totalMotion < 0.2 && autoTimer > 160) {
                autoTimer = 0;
                shootCueBall(aimAngle, 8.5 + Math.random() * 3.5);
            }
        }

        if (balls.filter(b => !b.isCue && !b.potted).length === 0) {
            initBalls();
        }
    }

    function updatePhysics() {
        const substeps = 4;
        const damp = 0.988;

        for (let step = 0; step < substeps; step++) {
            balls.forEach(b => {
                if (b.potted) return;
                b.x += (b.vx / substeps);
                b.y += (b.vy / substeps);
                b.vx *= Math.pow(damp, 1 / substeps);
                b.vy *= Math.pow(damp, 1 / substeps);

                if (Math.hypot(b.vx, b.vy) < 0.01) {
                    b.vx = 0; b.vy = 0;
                }
            });

            // Wall Cushions
            balls.forEach(b => {
                if (b.potted) return;
                const minX = table.x + b.r + 4;
                const maxX = table.x + table.w - b.r - 4;
                const minY = table.y + b.r + 4;
                const maxY = table.y + table.h - b.r - 4;

                if (b.x < minX) { b.x = minX; b.vx = -b.vx * 0.92; spawnSparks(b.x, b.y, '#38bdf8', 3); }
                else if (b.x > maxX) { b.x = maxX; b.vx = -b.vx * 0.92; spawnSparks(b.x, b.y, '#38bdf8', 3); }
                if (b.y < minY) { b.y = minY; b.vy = -b.vy * 0.92; spawnSparks(b.x, b.y, '#38bdf8', 3); }
                else if (b.y > maxY) { b.y = maxY; b.vy = -b.vy * 0.92; spawnSparks(b.x, b.y, '#38bdf8', 3); }

                // Pockets
                pockets.forEach(p => {
                    if (Math.hypot(b.x - p.x, b.y - p.y) < p.r * 1.05) {
                        b.potted = true;
                        b.vx = 0; b.vy = 0;
                        shockwaves.push({ x: p.x, y: p.y, r: 6, maxR: 45, alpha: 0.9, color: '#f59e0b' });
                        spawnMathBadge(p.x, p.y, `POT #${b.num}`);
                        spawnSparks(p.x, p.y, b.color, 10);

                        if (b.isCue) {
                            setTimeout(() => {
                                b.potted = false;
                                b.x = table.x + table.w * 0.72;
                                b.y = table.y + table.h * 0.5;
                            }, 1200);
                        }
                    }
                });
            });

            // Elastic Collisions
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const b1 = balls[i], b2 = balls[j];
                    if (b1.potted || b2.potted) continue;

                    const dx = b2.x - b1.x, dy = b2.y - b1.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = b1.r + b2.r;

                    if (dist < minDist && dist > 0) {
                        const nx = dx / dist, ny = dy / dist;
                        const overlap = 0.5 * (minDist - dist);
                        b1.x -= nx * overlap; b1.y -= ny * overlap;
                        b2.x += nx * overlap; b2.y += ny * overlap;

                        const kx = b1.vx - b2.vx, ky = b1.vy - b2.vy;
                        const p = nx * kx + ny * ky;

                        if (p > 0) {
                            b1.vx -= p * nx; b1.vy -= p * ny;
                            b2.vx += p * nx; b2.vy += p * ny;

                            const cx = b1.x + nx * b1.r, cy = b1.y + ny * b1.r;
                            spawnSparks(cx, cy, b1.isCue ? b2.color : b1.color, Math.min(8, Math.floor(p * 2)));
                            if (p > 3.5 && Math.random() < 0.3) {
                                spawnMathBadge(cx, cy, `v' = v - 2(v·n)n`);
                            }
                        }
                    }
                }
            }
        }
    }

    function loop() {
        updateAutoDemo();
        updatePhysics();

        ctx.clearRect(0, 0, width, height);

        // 1. Felt Background & Grid
        const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, width * 0.6);
        bgGrad.addColorStop(0, '#0a1714');
        bgGrad.addColorStop(0.7, '#050b09');
        bgGrad.addColorStop(1, '#020504');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Table Frame & Felt
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 2;
        ctx.strokeRect(table.x - 8, table.y - 8, table.w + 16, table.h + 16);

        ctx.fillStyle = '#0b201a';
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(table.x, table.y, table.w, table.h, table.r);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(45, 212, 191, 0.04)';
        ctx.lineWidth = 1;
        const gridStep = 30;
        for (let gx = table.x + gridStep; gx < table.x + table.w; gx += gridStep) {
            ctx.beginPath(); ctx.moveTo(gx, table.y); ctx.lineTo(gx, table.y + table.h); ctx.stroke();
        }
        for (let gy = table.y + gridStep; gy < table.y + table.h; gy += gridStep) {
            ctx.beginPath(); ctx.moveTo(table.x, gy); ctx.lineTo(table.x + table.w, gy); ctx.stroke();
        }

        // Head String Line
        const headX = table.x + table.w * 0.72;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(headX, table.y + 6); ctx.lineTo(headX, table.y + table.h - 6); ctx.stroke();
        ctx.setLineDash([]);

        // 3. Pockets
        pockets.forEach(p => {
            const pGrad = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r);
            pGrad.addColorStop(0, '#000000');
            pGrad.addColorStop(0.7, '#070f0c');
            pGrad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');
            ctx.fillStyle = pGrad;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'; ctx.lineWidth = 1; ctx.stroke();
        });
        ctx.restore();

        // 4. Trajectory Aiming Line & Cue Stick
        const cue = balls.find(b => b.isCue && !b.potted);
        if (cue && Math.hypot(cue.vx, cue.vy) < 0.5) {
            const dirX = Math.cos(aimAngle);
            const dirY = Math.sin(aimAngle);
            let rayLength = 260;
            let targetGhost = null;

            balls.forEach(b => {
                if (b.isCue || b.potted) return;
                const dx = b.x - cue.x, dy = b.y - cue.y;
                const proj = dx * dirX + dy * dirY;
                if (proj > 0 && proj < rayLength) {
                    const perp = Math.abs(dx * (-dirY) + dy * dirX);
                    if (perp < b.r + cue.r) {
                        rayLength = proj - Math.sqrt((b.r + cue.r) ** 2 - perp ** 2);
                        targetGhost = { x: cue.x + dirX * rayLength, y: cue.y + dirY * rayLength, b };
                    }
                }
            });

            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + dirX * rayLength, cue.y + dirY * rayLength); ctx.stroke();
            ctx.restore();

            if (targetGhost) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2]);
                ctx.beginPath(); ctx.arc(targetGhost.x, targetGhost.y, cue.r, 0, Math.PI * 2); ctx.stroke();

                const nx = targetGhost.b.x - targetGhost.x, ny = targetGhost.b.y - targetGhost.y;
                const nLen = Math.hypot(nx, ny) || 1;
                ctx.strokeStyle = '#ff2a5f';
                ctx.beginPath(); ctx.moveTo(targetGhost.b.x, targetGhost.b.y);
                ctx.lineTo(targetGhost.b.x + (nx / nLen) * 28, targetGhost.b.y + (ny / nLen) * 28); ctx.stroke();
                ctx.restore();
            }

            // Cue Stick
            if (cueOffset < 0) cueOffset += 1.8;
            ctx.save();
            const cueLen = 130;
            const cueBackOffset = 18 - cueOffset;
            const stickStartX = cue.x - dirX * (cueBackOffset + cueLen);
            const stickStartY = cue.y - dirY * (cueBackOffset + cueLen);
            const stickEndX = cue.x - dirX * cueBackOffset;
            const stickEndY = cue.y - dirY * cueBackOffset;

            const cueGrad = ctx.createLinearGradient(stickStartX, stickStartY, stickEndX, stickEndY);
            cueGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
            cueGrad.addColorStop(0.7, '#cbd5e1');
            cueGrad.addColorStop(1, '#ff2a5f');

            ctx.strokeStyle = cueGrad; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(stickStartX, stickStartY); ctx.lineTo(stickEndX, stickEndY);
            ctx.shadowColor = '#ff2a5f'; ctx.shadowBlur = 8; ctx.stroke();
            ctx.restore();
        }

        // 5. Shockwaves & Sparks
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color; ctx.globalAlpha = sw.alpha; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.globalAlpha = 1;
            sw.r += 2.5; sw.alpha -= 0.03;
            if (sw.alpha <= 0 || sw.r >= sw.maxR) shockwaves.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
            ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            if (p.alpha <= 0) particles.splice(i, 1);
        }

        // 6. Billiard Balls
        balls.forEach(b => {
            if (b.potted) return;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(b.x + 2, b.y + b.r * 0.7, b.r * 0.95, b.r * 0.45, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fill();

            const bGrad = ctx.createRadialGradient(
                b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.08,
                b.x, b.y, b.r
            );
            bGrad.addColorStop(0, '#ffffff');
            bGrad.addColorStop(0.3, b.color);
            bGrad.addColorStop(1, '#050b14');

            ctx.fillStyle = bGrad;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.shadowColor = b.isCue ? 'rgba(255,255,255,0.6)' : b.color;
            ctx.shadowBlur = b.isCue ? 10 : 4;
            ctx.fill();

            if (!b.isCue) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = b.textColor;
                ctx.font = `900 ${Math.floor(b.r * 0.55)}px Outfit, sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(b.num.toString(), b.x, b.y + 0.5);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });

        // 7. Math Badges
        for (let i = mathBadges.length - 1; i >= 0; i--) {
            const mb = mathBadges[i];
            mb.y += mb.vy; mb.alpha -= 0.016;
            ctx.save();
            ctx.globalAlpha = Math.max(0, mb.alpha);
            ctx.font = '600 11px Outfit, monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.fillText(mb.text, mb.x, mb.y);
            ctx.restore();
            if (mb.alpha <= 0) mathBadges.splice(i, 1);
        }

        requestAnimationFrame(loop);
    }

    loop();
})();
