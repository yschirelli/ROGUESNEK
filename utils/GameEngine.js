import { GRID_SIZE, LEVEL_REQ, ITEMS, ANOMALIES } from '../constants';
import { getRandomEmptyPos } from './rng';
import { enlargeBorder, canEnlargeBorder } from './logic';

export class GameEngine {
    constructor(canvas, callbacks, cols, rows) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks;
        this.cols = cols;
        this.rows = rows;
        this.width = cols * GRID_SIZE;
        this.height = rows * GRID_SIZE;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.isRunning = false;
        this.godmode = false;
        this.speedCheatMultiplier = 1.0;
        this.gameMode = 'NORMAL';
        this.inflation = 1;

        this.init();
    }

    init(mode = 'NORMAL', multiplier = 1.0, shrinkingBorders = false) {
        this.gameMode = mode;
        this.customMultiplier = mode === 'CUSTOM' ? multiplier : 1.0;
        this.customShrinkingBorders = mode === 'CUSTOM' ? shrinkingBorders : false;
        const midX = Math.floor(this.cols / 2);
        const midY = Math.floor(this.rows / 2);
        this.snake = [{ x: midX, y: midY }, { x: midX, y: midY + 1 }, { x: midX, y: midY + 2 }];
        this.dir = { x: 0, y: -1 };
        this.turnQueue = [];

        this.bounds = { top: 0, bottom: this.rows - 1, left: 0, right: this.cols - 1 };
        this.nextBorderShrinkTime = 30;

        this.apples = [];
        this.coins = [];
        this.mines = [];
        this.orbs = [];
        this.poisons = [];
        this.explosions = [];
        this.shopNodes = [];

        this.stats = { score: 0, coins: 0, length: 3, applesEaten: 0, level: 1, levelProgress: 0 };
        this.inflation = 1;
        this.relics = [];
        this.activePowerup = null;
        this.powerupCdTimer = 0;
        this.activePowerupEffectTimer = 0;
        this.hasShield = false;

        this.timeElapsed = 0;
        this.tickAccumulator = 0;
        this.baseTickRate = 140;
        this.lastHazardSpawn = 0;
        this.lastCoinSpawn = 0;
        this.lastPoisonSpawn = 0;
        this.pendingGrowth = 0;

        this.lastEventTime = 0;
        this.nextEventInterval = 20 + Math.random() * 15;
        this.activeAnomaly = null;
        this.anomalyWarningTimer = 0;
        this.queuedAnomaly = null;

        this.spawnApple();
    }

    start() { this.isRunning = true; }
    pause() { this.isRunning = false; }
    resume() { this.isRunning = true; }

    setDirection(x, y) {
        const lastDir = this.turnQueue.length > 0 ? this.turnQueue[this.turnQueue.length - 1] : this.dir;
        if (lastDir.x === -x && lastDir.y === -y) return;
        if (lastDir.x === x && lastDir.y === y) return;
        if (this.turnQueue.length < 3) {
            this.turnQueue.push({ x, y });
        }
    }

    activatePowerup() {
        if (!this.activePowerup || this.powerupCdTimer > 0) return;
        if (this.activePowerup.id === 'dash') {
            this.activePowerupEffectTimer = 3.0;
        } else if (this.activePowerup.id === 'shield') {
            this.hasShield = true;
        } else if (this.activePowerup.id === 'blast') {
            this.mines = [];
            this.orbs = [];
            this.triggerFlash('#FFFFFF');
        }
        this.powerupCdTimer = this.activePowerup.cd;
    }

    triggerFlash(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    triggerRandomEvent(forceEvent = null) {
        if (this.gameMode === 'ZEN') return;
        let ev = forceEvent !== null ? ANOMALIES[forceEvent] : ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];

        if (ev.duration > 0) {
            this.activeAnomaly = { ...ev, timer: ev.duration };
        } else if (ev.run) {
            ev.run(this);
        }

        let color = ev.type === 'NEG' ? '#FF0000' : (ev.type === 'POS' ? '#00FF00' : '#FFFF00');
        this.callbacks.onEvent(`ANOMALY: ${ev.name}`, color);
    }

    clearOutOfBounds() {
        const isOOB = (p) => p.x < this.bounds.left || p.x > this.bounds.right || p.y < this.bounds.top || p.y > this.bounds.bottom;
        this.apples = this.apples.filter(p => !isOOB(p));
        this.coins = this.coins.filter(p => !isOOB(p));
        this.mines = this.mines.filter(p => !isOOB(p));
        this.poisons = this.poisons.filter(p => !isOOB(p));
        this.orbs = this.orbs.filter(p => !isOOB(p));
        this.shopNodes = this.shopNodes.filter(p => !isOOB(p));
        if (this.apples.length === 0) this.spawnApple();
    }

    enlargeBorder() {
        const result = enlargeBorder(this.bounds, this.rows, this.cols);
        this.bounds = result.bounds;
        return result.enlarged;
    }

    canEnlargeBorder() {
        return canEnlargeBorder(this.bounds, this.rows, this.cols);
    }

    update(delta) {
        if (!this.isRunning) return;
        const dt = delta / 1000;
        this.timeElapsed += dt;

        this.inflation = Math.max(1, Math.floor(this.stats.level / 2) + 1);

        if (this.powerupCdTimer > 0) {
            this.powerupCdTimer = Math.max(0, this.powerupCdTimer - dt);
            if (this.callbacks.onCdUpdate) this.callbacks.onCdUpdate(1 - (this.powerupCdTimer / this.activePowerup.cd));
        }

        if (this.activePowerupEffectTimer > 0) this.activePowerupEffectTimer -= dt;

        if (this.activeAnomaly) {
            this.activeAnomaly.timer -= dt;
            if (this.callbacks.onAnomalyUpdate) {
                this.callbacks.onAnomalyUpdate({ name: this.activeAnomaly.name, pct: Math.max(0, this.activeAnomaly.timer / this.activeAnomaly.duration), type: this.activeAnomaly.type });
            }
            if (this.activeAnomaly.timer <= 0) {
                this.activeAnomaly = null;
                if (this.callbacks.onAnomalyUpdate) this.callbacks.onAnomalyUpdate(null);
            }
        }

        if (this.gameMode !== 'ZEN') {
            if (this.anomalyWarningTimer > 0) {
                this.anomalyWarningTimer -= dt;
                if (this.callbacks.onAnomalyWarning) this.callbacks.onAnomalyWarning(Math.ceil(this.anomalyWarningTimer));
                if (this.anomalyWarningTimer <= 0) {
                    this.triggerRandomEvent(this.queuedAnomaly ? ANOMALIES.indexOf(this.queuedAnomaly) : null);
                    this.queuedAnomaly = null;
                    if (this.callbacks.onAnomalyWarning) this.callbacks.onAnomalyWarning(0);
                }
            } else if (this.timeElapsed - this.lastEventTime > this.nextEventInterval) {
                this.queuedAnomaly = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
                this.anomalyWarningTimer = 3.0;
                this.lastEventTime = this.timeElapsed;
                this.nextEventInterval = (25 + Math.random() * 20) / (this.gameMode === 'CUSTOM' ? this.customMultiplier : 1.0);
            }
        }

        let currentTickRate = this.baseTickRate;
        if (this.gameMode === 'PSYCHO') {
            currentTickRate = Math.max(50, this.baseTickRate - (this.timeElapsed * 1.5));
        } else if (this.gameMode === 'CUSTOM') {
            currentTickRate = Math.max(20, this.baseTickRate / this.customMultiplier);
        }

        currentTickRate *= this.speedCheatMultiplier;

        if (this.speedCheatMultiplier === 1.0) {
            if (this.activeAnomaly && this.activeAnomaly.id === 'SPEED_BOOST') currentTickRate *= 0.5;
            if (this.activeAnomaly && this.activeAnomaly.id === 'SNAIL_TRAIL') currentTickRate *= 1.4;
            if (this.activeAnomaly && this.activeAnomaly.id === 'TIME_DILATION') currentTickRate *= (0.4 + Math.random() * 1.6);
        }

        if (this.activePowerupEffectTimer > 0) currentTickRate *= 0.4;

        this.tickAccumulator += delta;
        if (this.tickAccumulator > currentTickRate) {
            this.tickAccumulator -= currentTickRate;
            this.moveSnake();
        }

        if (this.gameMode !== 'ZEN') {
            let hazardRate = Math.max(1000, 3500 - (this.timeElapsed * 25));
            let coinRate = this.relics.includes('greed') ? 3000 : 6000;
            let poisonRate = 8000;

            if (this.gameMode === 'CUSTOM') {
                hazardRate = Math.max(500, hazardRate / this.customMultiplier);
            }

            if (this.activeAnomaly && this.activeAnomaly.id === 'DOUBLE_SPAWN') {
                hazardRate *= 0.5;
                coinRate *= 0.5;
                if (this.apples.length < 2) this.spawnApple();
            }

            if (this.activeAnomaly && this.activeAnomaly.id === 'GLITCH_WALLS' && Math.random() < 0.1) {
                this.spawnHazard(true);
            }

            if (this.activeAnomaly && this.activeAnomaly.id === 'GOLDEN_FRENZY') {
                if (Math.random() < 0.2) this.spawnCoin();
                if (Math.random() < 0.05 && this.bounds.right - this.bounds.left > 10 && this.bounds.bottom - this.bounds.top > 10) {
                    this.bounds.top++; this.bounds.bottom--; this.bounds.left++; this.bounds.right--;
                    this.clearOutOfBounds(); this.callbacks.onShake();
                }
            }

            if (this.timeElapsed * 1000 - this.lastHazardSpawn > hazardRate) {
                this.spawnHazard();
                this.lastHazardSpawn = this.timeElapsed * 1000;
            }

            if (this.timeElapsed * 1000 - this.lastCoinSpawn > coinRate) {
                if (Math.random() < 0.6) this.spawnCoin();
                this.lastCoinSpawn = this.timeElapsed * 1000;
            }

            if (this.timeElapsed * 1000 - this.lastPoisonSpawn > poisonRate) {
                if (this.poisons.length < 3) this.spawnPoison();
                this.lastPoisonSpawn = this.timeElapsed * 1000;
            }

            if ((this.gameMode === 'PSYCHO' || (this.gameMode === 'CUSTOM' && this.customShrinkingBorders)) && this.timeElapsed > this.nextBorderShrinkTime && this.bounds.right - this.bounds.left > 10 && this.bounds.bottom - this.bounds.top > 10) {
                this.bounds.top++;
                this.bounds.bottom--;
                this.bounds.left++;
                this.bounds.right--;
                this.nextBorderShrinkTime += 30;
                this.clearOutOfBounds();
                this.callbacks.onShake();
            }
        }

        this.orbs.forEach((orb, i) => {
            orb.timer -= dt;
            if (orb.timer <= 0) {
                this.triggerExplosion(orb.x, orb.y, orb.isGiant);
                this.orbs.splice(i, 1);
            }
        });

        this.explosions.forEach((exp, i) => {
            exp.timer -= dt;
            if (exp.timer <= 0) this.explosions.splice(i, 1);
        });

        this.broadcastEffects();
    }

    broadcastEffects() {
        let effects = [];
        if (this.activePowerupEffectTimer > 0 && this.activePowerup) effects.push(`[${this.activePowerup.name}]`);
        if (this.hasShield) effects.push(`[DEFLECTOR]`);
        if (this.activeAnomaly) effects.push(`[${this.activeAnomaly.name}]`);
        this.callbacks.onEffectsUpdate(effects);
    }

    moveSnake() {
        if (this.turnQueue.length > 0) {
            this.dir = this.turnQueue.shift();
        }

        const head = this.snake[0];
        let newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };
        let wrapped = false;

        let isOverclockGod = (this.activePowerup && this.activePowerup.id === 'dash' && this.activePowerupEffectTimer > 0);
        let actualGodmode = this.godmode || isOverclockGod;

        if (newHead.x < this.bounds.left) { newHead.x = this.bounds.right; wrapped = true; }
        else if (newHead.x > this.bounds.right) { newHead.x = this.bounds.left; wrapped = true; }

        if (newHead.y < this.bounds.top) { newHead.y = this.bounds.bottom; wrapped = true; }
        else if (newHead.y > this.bounds.bottom) { newHead.y = this.bounds.top; wrapped = true; }

        if (wrapped && this.activeAnomaly && this.activeAnomaly.id === 'SOLID_WALLS') {
            if (!actualGodmode) { 
                this.triggerDeath(); return; 
            } else if (isOverclockGod && !this.godmode) {
                this.dir = { x: 0, y: 0 };
                return;
            }
        }

        if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            if (!actualGodmode) { this.triggerDeath(); return; }
        }

        this.snake.unshift(newHead);

        if (this.activeAnomaly && this.activeAnomaly.id === 'MAGNETIC_FIELD') {
            const pull = (items) => {
                items.forEach(item => {
                    const dx = Math.abs(item.x - newHead.x);
                    const dy = Math.abs(item.y - newHead.y);
                    if (dx < 6 && dy < 6) {
                        if (item.x < newHead.x) item.x++; else if (item.x > newHead.x) item.x--;
                        if (item.y < newHead.y) item.y++; else if (item.y > newHead.y) item.y--;
                    }
                });
            };
            pull(this.apples);
            pull(this.coins);
        }
        this.checkCollisions(newHead);

        if (this.pendingGrowth > 0) {
            this.pendingGrowth--;
        } else {
            this.snake.pop();
        }

        this.stats.length = this.snake.length;
        this.callbacks.onStatsUpdate({ ...this.stats, timeElapsed: this.timeElapsed });
    }

    checkCollisions(head) {
        const appleIdx = this.apples.findIndex(a => a.x === head.x && a.y === head.y);
        if (appleIdx >= 0) {
            this.apples.splice(appleIdx, 1);
            let scoreReward = Math.floor(50 * (this.gameMode === 'CUSTOM' ? this.customMultiplier : 1.0));
            this.stats.score += scoreReward;
            this.stats.applesEaten++;
            this.stats.levelProgress++;
            this.pendingGrowth += this.relics.includes('diet') ? 3 : 1;
            this.spawnApple();

            if (this.stats.levelProgress >= LEVEL_REQ) {
                this.stats.level++;
                this.stats.levelProgress = 0;
                if (this.gameMode !== 'ZEN') {
                    this.callbacks.onDraft();
                    if (Math.random() < 0.6) this.spawnShopNode();
                }
            }
        }

        const coinIdx = this.coins.findIndex(c => c.x === head.x && c.y === head.y);
        if (coinIdx >= 0) {
            this.coins.splice(coinIdx, 1);
            let coinReward = Math.floor((2 * this.inflation) * (this.gameMode === 'CUSTOM' ? this.customMultiplier : 1.0));
            this.stats.coins += coinReward;
            this.stats.score += Math.floor(10 * (this.gameMode === 'CUSTOM' ? this.customMultiplier : 1.0));
        }

        const mineIdx = this.mines.findIndex(m => m.x === head.x && m.y === head.y);
        if (mineIdx >= 0) {
            this.mines.splice(mineIdx, 1);
            this.takeDamage(3);
        }

        const poisonIdx = this.poisons.findIndex(p => p.x === head.x && p.y === head.y);
        if (poisonIdx >= 0) {
            this.poisons.splice(poisonIdx, 1);
            let removeCount = 2;
            while (removeCount > 0 && this.snake.length > 1) {
                this.snake.pop();
                removeCount--;
            }
            this.stats.length = this.snake.length;
            this.callbacks.onShake();
            this.triggerFlash('#FF0000');
        }

        const shopIdx = this.shopNodes.findIndex(s => s.x === head.x && s.y === head.y);
        if (shopIdx >= 0) {
            this.shopNodes.splice(shopIdx, 1);
            this.callbacks.onShop();
        }
    }

    triggerExplosion(x, y, isGiant) {
        this.explosions.push({ x, y, timer: 0.3, isGiant });
        this.callbacks.onShake();

        const radius = isGiant ? 2 : 1;
        let headInRadius = (Math.abs(this.snake[0].x - x) <= radius && Math.abs(this.snake[0].y - y) <= radius);

        let isOverclockGod = (this.activePowerup && this.activePowerup.id === 'dash' && this.activePowerupEffectTimer > 0);
        if (headInRadius && !(this.godmode || isOverclockGod)) {
            this.triggerDeath();
            return;
        }

        let segmentsCaught = 0;
        for (let i = 1; i < this.snake.length; i++) {
            let seg = this.snake[i];
            if (Math.abs(seg.x - x) <= radius && Math.abs(seg.y - y) <= radius) segmentsCaught++;
        }

        if (segmentsCaught > 0 && !(this.godmode || isOverclockGod)) {
            for (let i = 0; i < segmentsCaught; i++) {
                if (this.snake.length > 1) this.snake.pop();
            }
        }
    }

    takeDamage(amount) {
        let isOverclockGod = (this.activePowerup && this.activePowerup.id === 'dash' && this.activePowerupEffectTimer > 0);
        if (this.godmode || isOverclockGod) return;
        if (this.hasShield) {
            this.hasShield = false;
            this.triggerFlash('#00FFFF');
            return;
        }
        this.callbacks.onShake();
        if (this.relics.includes('phase_bit')) {
            this.activePowerupEffectTimer = 2.0;
        }
        for (let i = 0; i < amount; i++) {
            if (this.snake.length > 2) this.snake.pop();
            else { this.triggerDeath(); break; }
        }
    }

    triggerDeath() {
        if (this.godmode) return;
        this.isRunning = false;
        this.callbacks.onDeath();
    }

    getAllObstacles() {
        return [...this.snake, ...this.mines, ...this.poisons, ...this.apples, ...this.coins, ...this.shopNodes, ...this.orbs];
    }

    getRandomEmptyPos() {
        return getRandomEmptyPos(this.bounds, this.getAllObstacles());
    }

    spawnApple() { this.apples.push(this.getRandomEmptyPos()); }
    spawnCoin() { this.coins.push(this.getRandomEmptyPos()); }
    spawnPoison() { this.poisons.push(this.getRandomEmptyPos()); }
    spawnShopNode() { if (this.shopNodes.length < 1) this.shopNodes.push(this.getRandomEmptyPos()); }

    spawnHazard(forceMine = false) {
        if (!forceMine && Math.random() > 0.6) {
            let isGiant = Math.random() < 0.1;
            this.orbs.push({ ...this.getRandomEmptyPos(), timer: 3.0, isGiant });
        } else {
            if (this.mines.length < Math.floor(this.cols * this.rows * 0.05)) {
                this.mines.push(this.getRandomEmptyPos());
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.strokeStyle = '#002200';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath(); this.ctx.moveTo(x * GRID_SIZE, 0); this.ctx.lineTo(x * GRID_SIZE, this.height); this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y * GRID_SIZE); this.ctx.lineTo(this.width, y * GRID_SIZE); this.ctx.stroke();
        }

        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 1;
        if (this.activeAnomaly && this.activeAnomaly.id === 'SOLID_WALLS') {
            this.ctx.setLineDash([]);
        } else {
            this.ctx.setLineDash([4, 4]);
        }
        this.ctx.strokeRect(
            this.bounds.left * GRID_SIZE,
            this.bounds.top * GRID_SIZE,
            (this.bounds.right - this.bounds.left + 1) * GRID_SIZE,
            (this.bounds.bottom - this.bounds.top + 1) * GRID_SIZE
        );
        this.ctx.setLineDash([]);

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `bold ${GRID_SIZE - 2}px monospace`;

        this.ctx.fillStyle = '#00FF00';
        this.apples.forEach(a => this.ctx.fillText('@', a.x * GRID_SIZE + GRID_SIZE / 2, a.y * GRID_SIZE + GRID_SIZE / 2));

        this.ctx.fillStyle = '#FFFF00';
        this.coins.forEach(c => this.ctx.fillText('$', c.x * GRID_SIZE + GRID_SIZE / 2, c.y * GRID_SIZE + GRID_SIZE / 2));

        this.ctx.fillStyle = '#00FFFF'; // Cyan for Shop Node
        this.shopNodes.forEach(s => this.ctx.fillText('[S]', s.x * GRID_SIZE + GRID_SIZE / 2, s.y * GRID_SIZE + GRID_SIZE / 2));

        this.ctx.fillStyle = '#FF0000';
        this.mines.forEach(m => this.ctx.fillText('X', m.x * GRID_SIZE + GRID_SIZE / 2, m.y * GRID_SIZE + GRID_SIZE / 2));
        this.poisons.forEach(p => this.ctx.fillText('!', p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2));

        this.orbs.forEach(o => {
            const radius = o.isGiant ? 2 : 1;
            const drawSize = o.isGiant ? 5 : 3;

            if (o.timer <= 1.5) {
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([2, 2]);
                this.ctx.strokeRect((o.x - radius) * GRID_SIZE, (o.y - radius) * GRID_SIZE, GRID_SIZE * drawSize, GRID_SIZE * drawSize);
                this.ctx.setLineDash([]);
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                this.ctx.fillRect((o.x - radius) * GRID_SIZE, (o.y - radius) * GRID_SIZE, GRID_SIZE * drawSize, GRID_SIZE * drawSize);
            }

            if (o.timer > 1 || Math.floor(Date.now() / 150) % 2 === 0) {
                this.ctx.fillStyle = '#FF0000';
                if (o.isGiant) {
                    this.ctx.font = `bold ${GRID_SIZE + 4}px monospace`;
                    this.ctx.fillText('O', o.x * GRID_SIZE + GRID_SIZE / 2, o.y * GRID_SIZE + GRID_SIZE / 2);
                    this.ctx.font = `bold ${GRID_SIZE - 2}px monospace`;
                } else {
                    this.ctx.fillText('O', o.x * GRID_SIZE + GRID_SIZE / 2, o.y * GRID_SIZE + GRID_SIZE / 2);
                }
            }
        });

        this.ctx.fillStyle = '#FF0000';
        this.explosions.forEach(exp => {
            const radius = exp.isGiant ? 2 : 1;
            const drawSize = exp.isGiant ? 5 : 3;
            this.ctx.fillRect((exp.x - radius) * GRID_SIZE, (exp.y - radius) * GRID_SIZE, GRID_SIZE * drawSize, GRID_SIZE * drawSize);
        });

        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = '#00FF00';
            if (this.hasShield) this.ctx.fillStyle = '#00FFFF';
            if (this.godmode && i === 0) this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        });
    }
}
