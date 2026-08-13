// ============================================================
// levels.js - Game Data & State Management for Elite Kitty
// ============================================================

const WeaponData = {
    pistol: {
        name: "Pistol", damage: 1, fireRate: 300, bulletSpeed: 500,
        bulletCount: 1, spread: 0, infinite: true, ammoPerShot: 0,
        color: 0xffff00, bulletKey: 'bullet'
    },
    shotgun: {
        name: "Shotgun", damage: 2, fireRate: 600, bulletSpeed: 400,
        bulletCount: 3, spread: 15, infinite: false, ammoPerShot: 1,
        color: 0xff6600, bulletKey: 'bullet_shotgun'
    },
    rifle: {
        name: "Rifle", damage: 1, fireRate: 150, bulletSpeed: 700,
        bulletCount: 1, spread: 0, infinite: false, ammoPerShot: 1,
        color: 0x00ffff, bulletKey: 'bullet_rifle'
    }
};

const PowerUpData = {
    health:  { name: "Health Pack",  color: 0x00ff00, symbol: "♥", duration: 0 },
    damage:  { name: "Damage Boost", color: 0xff0000, symbol: "⚔", duration: 10000 },
    speed:   { name: "Speed Boost",  color: 0xffff00, symbol: "⚡", duration: 10000 },
    shield:  { name: "Shield",       color: 0x0088ff, symbol: "◆", duration: 15000 },
    ammo:    { name: "Ammo Pack",    color: 0xff9900, symbol: "▪", duration: 0 },
    life:    { name: "Extra Life",   color: 0xff00ff, symbol: "★", duration: 0 }
};

const SkinData = {
    default: { name: "Classic Cat",   primaryColor: 0xff0055, premium: false },
    blue:    { name: "Navy SEAL",     primaryColor: 0x0066ff, premium: false },
    gold:    { name: "Golden Warrior", primaryColor: 0xffcc00, premium: true, cost: 500 },
    ninja:   { name: "Shadow Ninja",  primaryColor: 0x222222, premium: true, cost: 1000 },
    neon:    { name: "Neon Cyber",     primaryColor: 0x00ff88, premium: true, cost: 750 },
    red:     { name: "Blood Commander", primaryColor: 0xcc0000, premium: true, cost: 3000 },
    white:   { name: "Arctic Ops",     primaryColor: 0xcccccc, premium: true, cost: 4000 },
    max:     { name: "Shadow Lord",    primaryColor: 0x4400aa, premium: true, cost: 5000 }
};

const LevelData = {
    1: {
        name: "Training Ground", bg: "#1a2a3a", platform: "#5a7a8a",
        enemyCount: 5, enemySpeed: 60, enemyHealth: 1,
        description: "Learn the basics, soldier!",
        tutorial: true,
        tutorialMessages: [
            "Welcome, Agent Kitty! WASD or Arrows to move.",
            "Press SPACE or Z to fire!",
            "Press 1 / 2 / 3 to switch weapons.",
            "Eliminate all rats to complete the mission!",
            "Collect glowing power-ups for bonuses!"
        ],
        movingPlatforms: false, hasBoss: false,
        stealth: false, hordeMode: false,
        powerupChance: 0.4,
        starThresholds: { score1: 50, score2: 100, score3: 200 }
    },
    2: {
        name: "Urban Warfare", bg: "#2c1a0a", platform: "#8b6914",
        enemyCount: 12, enemySpeed: 80, enemyHealth: 1,
        description: "Navigate the warzone!",
        tutorial: false,
        movingPlatforms: true, movingPlatformCount: 4,
        hasBoss: false, stealth: false, hordeMode: false,
        powerupChance: 0.35,
        starThresholds: { score1: 200, score2: 400, score3: 700 }
    },
    3: {
        name: "Boss Fight", bg: "#1a0a2a", platform: "#7a2a8a",
        enemyCount: 6, enemySpeed: 90, enemyHealth: 1,
        description: "Face the Rat King!",
        tutorial: false, movingPlatforms: false,
        hasBoss: true, bossHealth: 25, bossSpeed: 120, bossName: "RAT KING",
        stealth: false, hordeMode: false,
        powerupChance: 0.5,
        starThresholds: { score1: 300, score2: 600, score3: 1000 }
    },
    4: {
        name: "Stealth Mission", bg: "#0a0a1a", platform: "#1a4a1a",
        enemyCount: 15, enemySpeed: 40, enemyHealth: 1,
        description: "Move silently. Strike once.",
        tutorial: false, movingPlatforms: false,
        hasBoss: false,
        stealth: true, ammoLimit: 20,
        stealthDamageMultiplier: 3, stealthDetectionRange: 130,
        stealthBonusScore: 50,
        hordeMode: false,
        powerupChance: 0.25,
        starThresholds: { score1: 300, score2: 600, score3: 1000 }
    },
    5: {
        name: "Final Stand", bg: "#3a0a0a", platform: "#8b3a0a",
        enemyCount: 0, enemySpeed: 100, enemyHealth: 1,
        description: "Survive the horde!",
        tutorial: false,
        movingPlatforms: true, movingPlatformCount: 3,
        hasBoss: false, stealth: false,
        hordeMode: true, waveCount: 5, enemiesPerWave: 6,
        waveDelay: 2500,
        powerupChance: 0.3,
        starThresholds: { score1: 500, score2: 900, score3: 1500 }
    }
};

const GameState = {
    currentLevel: 1,
    score: 0,
    health: 100,
    maxHealth: 100,
    lives: 3,
    combo: 0,
    comboMultiplier: 1,
    maxCombo: 0,
    lastKillTime: 0,
    kills: 0,
    stealthKills: 0,
    deaths: 0,
    timePlayed: 0,
    currentWeapon: 'pistol',
    weapons: ['pistol'],
    ammo: { pistol: 999, shotgun: 30, rifle: 20 },
    maxAmmo: { pistol: 999, shotgun: 60, rifle: 40 },
    shieldHits: 0,
    damageBoost: false,
    speedBoost: false,
    powerupTimers: {},
    currentSkin: 'default',

    getSerializable() {
        return {
            currentLevel: this.currentLevel,
            score: this.score,
            health: this.health,
            maxHealth: this.maxHealth,
            lives: this.lives,
            kills: this.kills,
            stealthKills: this.stealthKills,
            deaths: this.deaths,
            timePlayed: this.timePlayed,
            currentWeapon: this.currentWeapon,
            weapons: [...this.weapons],
            ammo: { ...this.ammo },
            currentSkin: this.currentSkin
        };
    },

    loadFromData(data) {
        if (!data) return false;
        this.currentLevel = data.currentLevel || 1;
        this.score = data.score || 0;
        this.health = data.health || 100;
        this.maxHealth = data.maxHealth || 100;
        this.lives = data.lives || 3;
        this.kills = data.kills || 0;
        this.stealthKills = data.stealthKills || 0;
        this.deaths = data.deaths || 0;
        this.timePlayed = data.timePlayed || 0;
        this.currentWeapon = data.currentWeapon || 'pistol';
        this.weapons = data.weapons || ['pistol'];
        this.ammo = data.ammo || { pistol: 999, shotgun: 30, rifle: 20 };
        this.currentSkin = data.currentSkin || 'default';
        this.combo = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;
        this.lastKillTime = 0;
        this.shieldHits = 0;
        this.damageBoost = false;
        this.speedBoost = false;
        this.powerupTimers = {};
        return true;
    },

    resetForNewGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.lives = 3;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;
        this.lastKillTime = 0;
        this.kills = 0;
        this.stealthKills = 0;
        this.deaths = 0;
        this.timePlayed = 0;
        this.currentWeapon = 'pistol';
        this.weapons = ['pistol'];
        this.ammo = { pistol: 999, shotgun: 30, rifle: 20 };
        this.maxAmmo = { pistol: 999, shotgun: 60, rifle: 40 };
        this.shieldHits = 0;
        this.damageBoost = false;
        this.speedBoost = false;
        this.powerupTimers = {};
    },

    resetForLevel() {
        this.health = this.maxHealth;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;
        this.lastKillTime = 0;
        this.shieldHits = 0;
        this.damageBoost = false;
        this.speedBoost = false;
        this.powerupTimers = {};
        var level = LevelData[this.currentLevel];
        if (level.stealth) {
            this.ammo.shotgun = 0;
            this.ammo.rifle = 0;
        } else {
            this.ammo.shotgun = Math.min(this.ammo.shotgun + 15, this.maxAmmo.shotgun);
            this.ammo.rifle = Math.min(this.ammo.rifle + 10, this.maxAmmo.rifle);
        }
    }
};

function getDifficultyScale(loop) {
    return 1 + (loop * 0.3);
}
