export const GRID_SIZE = 20;
export const LEVEL_REQ = 5;

export const ITEMS = [
    { id: 'diet', name: 'NUTRIENT_RICH', desc: 'APPLES YIELD +2 LENGTH INSTEAD OF 1.', type: 'RELIC', rarity: 'C', symbol: '[+]', color: '#00FF00' },
    { id: 'greed', name: 'GREED_PROTOCOL', desc: 'COINS SPAWN TWICE AS OFTEN.', type: 'RELIC', rarity: 'C', symbol: '[$]', color: '#FFFF00' },
    { id: 'phase_bit', name: 'PHASE_BIT', desc: 'TAKING DAMAGE TRIGGERS 2 SECONDS OF INVULNERABILITY.', type: 'RELIC', rarity: 'R', symbol: '[#]', color: '#00CC00' },
    { id: 'stretchy', name: 'ELASTICITY', desc: 'HITTING THE BORDER WALL DEALS 0 DAMAGE.', type: 'RELIC', rarity: 'L', symbol: '[~]', color: '#00FF00' },
    { id: 'dash', name: 'OVERCLOCK', desc: 'ACTIVATE TO TRIGGER 3S OF 2X SPEED & GODMODE.', type: 'POWERUP', rarity: 'C', cd: 20, symbol: '>>', color: '#00FF00' },
    { id: 'shield', name: 'DEFLECTOR', desc: 'ACTIVATE TO NEGATE THE VERY NEXT INSTANCE OF DAMAGE.', type: 'POWERUP', rarity: 'R', cd: 30, symbol: '[]', color: '#00FF00' },
    { id: 'blast', name: 'EMP_BLAST', desc: 'ACTIVATE TO CLEAR ALL HAZARDS ON THE SCREEN.', type: 'POWERUP', rarity: 'L', cd: 60, symbol: '!!', color: '#FF0000' }
];

export const ANOMALIES = [
    { id: 'SOLID_WALLS', name: 'FIREWALL', desc: 'BORDERS BECOME SOLID WALLS. INSTA-DEATH IF TOUCHED.', type: 'NEG', duration: 60 },
    { id: 'SPEED_BOOST', name: 'OVERCLOCK EVENT', desc: 'SNAKE SPEED IS DOUBLED INVOLUNTARILY.', type: 'NEG', duration: 5 },
    { id: 'SNAIL_TRAIL', name: 'SNAIL TRAIL!', desc: 'SNAKE MOVEMENT SLOWED BY 30%.', type: 'POS', duration: 30 },
    { id: 'DOUBLE_SPAWN', name: 'DOUBLE EVERYTHING!', desc: 'HAZARDS, FOOD, AND COINS SPAWN AT 2X RATE.', type: 'NEU', duration: 15 },
    { id: 'TIME_DILATION', name: 'TIME DILATION', desc: 'SPEED FLUCTUATES RAPIDLY.', type: 'NEU', duration: 10 },
    { id: 'GLITCH_WALLS', name: 'GLITCH STORMS', desc: 'RAPIDLY SPAWNING MINES APPEAR.', type: 'NEG', duration: 10 },
    { id: 'GOLDEN_FRENZY', name: 'GOLDEN FRENZY', desc: 'MASSIVE COIN SPAWNS. BORDERS SHRINK!', type: 'POS', duration: 8 },
    { id: 'MAGNETIC_FIELD', name: 'MAGNETIC FIELD', desc: 'COINS AND APPLES ARE PULLED TO YOU.', type: 'POS', duration: 15 },
    { id: 'CACHE_CLEAR', name: 'CACHE CLEAR', desc: 'ALL HAZARDS ARE IMMEDIATELY WIPED FROM THE BOARD.', type: 'POS', duration: 0, run: (e) => { e.mines = []; e.orbs = []; e.poisons = []; e.triggerFlash('#00FF00'); } },
    { id: 'SYS_INJECT', name: 'SYSTEM INJECTION', desc: 'GAIN BONUS CREDITS INSTANTLY.', type: 'POS', duration: 0, run: (e) => { e.stats.coins += (10 * e.inflation); } },
    { id: 'MINING_MALWARE', name: 'MINING MALWARE', desc: 'MULTIPLE MINES SPAWN RANDOMLY AROUND YOU.', type: 'NEG', duration: 0, run: (e) => { for (let i = 0; i < 5; i++) e.spawnHazard(true); e.triggerFlash('#FF0000'); } }
];
