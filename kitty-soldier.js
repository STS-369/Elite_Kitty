// ============================================================
// kitty-soldier.js - Elite Kitty Main Game Logic
// ============================================================

// ---- Global Variables ----
var game, scene;
var player, platforms, movingPlatforms, bullets, enemies, coins, powerupItems, boss;
var cursors, fireKey, pauseKey;
var wKey, aKey, dKey, k1, k2, k3;
var texturesGenerated = false;
var gameRunning = false;
var gamePaused = false;
var levelCompletePending = false;
var tutorialIndex = 0;
var tutorialMessages = [];
var currentWave = 0;
var levelTimeElapsed = 0;
var lastFireTime = 0;
var lastJumpTime = 0;
var saveMode = 'save';
var previousScreen = 'start-screen';
var activeColliders = [];

// ---- Mobile Detection & Touch State ----
var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
var touchState = { left: false, right: false, up: false, fire: false, weapon: null, jumpQueued: false };

// ---- Texture Generation ----
function generateTextures(sc) {
    var g;

    // Player - Kitty Commando Ninja (Rambo Cat)
    // Cat head with pointed ears, green eyes, red headband, ninja mask, tactical outfit
    g = sc.make.graphics({ add: false });

    // --- Tail (behind body) ---
    g.fillStyle(0x888888);
    g.fillRoundedRect(22, 16, 4, 10, 2);
    g.fillStyle(0x777777);
    g.fillRoundedRect(24, 14, 4, 6, 2);

    // --- Cat head (gray fur) ---
    g.fillStyle(0x888888);
    g.fillRoundedRect(8, 1, 16, 12, 3);

    // --- Pointed cat ears ---
    g.fillStyle(0x888888);
    g.fillTriangle(9, 4, 13, -1, 13, 5);   // left ear outer
    g.fillTriangle(19, 4, 23, -1, 19, 5);   // right ear outer
    g.fillStyle(0xff99aa);
    g.fillTriangle(10, 4, 12, 1, 12, 4);    // left ear inner
    g.fillTriangle(20, 4, 22, 1, 20, 4);    // right ear inner

    // --- Red headband (Rambo style) ---
    g.fillStyle(0xcc0000);
    g.fillRect(7, 1, 18, 3);
    // Headband tails hanging down right side
    g.fillStyle(0xcc0000);
    g.fillRect(23, 2, 2, 6);
    g.fillRect(25, 3, 2, 5);

    // --- Cat eyes (bright green with slit pupils) ---
    g.fillStyle(0x00ff00);
    g.fillRect(11, 4, 3, 3);    // left eye
    g.fillRect(18, 4, 3, 3);    // right eye
    g.fillStyle(0x000000);
    g.fillRect(12, 5, 1, 1);    // left pupil
    g.fillRect(19, 5, 1, 1);    // right pupil

    // --- Cat nose ---
    g.fillStyle(0xff99aa);
    g.fillRect(15, 7, 2, 1);

    // --- Whiskers (white lines) ---
    g.fillStyle(0xcccccc);
    g.fillRect(10, 7, 4, 1);    // left whisker
    g.fillRect(18, 7, 4, 1);    // right whisker
    g.fillRect(11, 8, 3, 1);    // left whisker lower
    g.fillRect(18, 8, 3, 1);    // right whisker lower

    // --- Ninja mask (dark, covering lower face) ---
    g.fillStyle(0x333333);
    g.fillRect(9, 9, 14, 4);
    g.fillStyle(0x444444);
    g.fillRect(9, 9, 14, 1);    // mask highlight edge

    // --- Tactical vest / body armor (dark green) ---
    g.fillStyle(0x334433);
    g.fillRoundedRect(7, 13, 18, 9, 2);

    // Vest details - shoulder pads
    g.fillStyle(0x445544);
    g.fillRect(7, 13, 5, 3);    // left shoulder
    g.fillRect(20, 13, 5, 3);   // right shoulder

    // Vest center line
    g.fillStyle(0x223322);
    g.fillRect(15, 14, 2, 7);

    // Arm holes / sides
    g.fillStyle(0x888888);
    g.fillRect(7, 15, 2, 5);    // left arm
    g.fillRect(23, 15, 2, 5);   // right arm

    // --- Utility belt ---
    g.fillStyle(0x885533);
    g.fillRect(7, 22, 18, 2);
    g.fillStyle(0xcc9955);
    g.fillRect(14, 22, 4, 2);   // belt buckle
    // Pouches
    g.fillStyle(0x664422);
    g.fillRect(9, 22, 3, 2);    // left pouch
    g.fillRect(20, 22, 3, 2);   // right pouch

    // --- Dark tactical pants ---
    g.fillStyle(0x333333);
    g.fillRect(8, 24, 6, 4);    // left leg
    g.fillRect(18, 24, 6, 4);   // right leg

    // --- Combat boots ---
    g.fillStyle(0x222222);
    g.fillRect(7, 28, 7, 3);    // left boot
    g.fillRect(18, 28, 7, 3);   // right boot
    g.fillStyle(0x444444);
    g.fillRect(7, 28, 7, 1);    // left boot top
    g.fillRect(18, 28, 7, 1);   // right boot top

    g.generateTexture('player', 32, 32); g.destroy();

    // Enemy rat
    g = sc.make.graphics({ add: false });
    g.fillStyle(0x777777); g.fillRoundedRect(6, 8, 20, 14, 3);
    g.fillStyle(0x888888); g.fillRoundedRect(4, 2, 16, 12, 4);
    g.fillStyle(0x666666); g.fillCircle(6, 2, 3); g.fillCircle(18, 2, 3);
    g.fillStyle(0xff0000); g.fillRect(8, 5, 3, 3); g.fillRect(14, 5, 3, 3);
    g.fillStyle(0x000000); g.fillRect(9, 6, 1, 1); g.fillRect(15, 6, 1, 1);
    g.fillStyle(0xff6666); g.fillCircle(12, 9, 1);
    g.fillStyle(0xffffff); g.fillRect(9, 11, 2, 2); g.fillRect(13, 11, 2, 2);
    g.fillStyle(0x555555); g.fillRect(8, 22, 4, 6); g.fillRect(16, 22, 4, 6);
    g.lineStyle(2, 0x666666); g.lineBetween(26, 14, 32, 10);
    g.generateTexture('enemy', 32, 28); g.destroy();

    // Boss - Rat King
    g = sc.make.graphics({ add: false });
    g.fillStyle(0x440044); g.fillRoundedRect(8, 14, 32, 26, 6);
    g.fillStyle(0x550055); g.fillRoundedRect(10, 0, 28, 18, 6);
    g.fillStyle(0xffcc00);
    g.fillTriangle(14, 0, 18, -5, 22, 0);
    g.fillTriangle(22, 0, 26, -5, 30, 0);
    g.fillTriangle(30, 0, 34, -5, 38, 0);
    g.fillStyle(0xff0000); g.fillCircle(18, 6, 4); g.fillCircle(30, 6, 4);
    g.fillStyle(0xffff00); g.fillCircle(18, 6, 2); g.fillCircle(30, 6, 2);
    g.fillStyle(0x000000); g.fillRect(17, 5, 2, 2); g.fillRect(29, 5, 2, 2);
    g.fillStyle(0xffffff); g.fillRect(16, 12, 4, 4); g.fillRect(28, 12, 4, 4);
    g.fillStyle(0xff0000); g.fillRect(16, 14, 4, 2); g.fillRect(28, 14, 4, 2);
    g.fillStyle(0xffcc00); g.fillRect(8, 26, 32, 3);
    g.fillStyle(0xff0000); g.fillCircle(24, 27, 3);
    g.fillStyle(0x330033); g.fillRect(12, 40, 8, 8); g.fillRect(28, 40, 8, 8);
    g.fillStyle(0x550055); g.fillRect(0, 18, 10, 6); g.fillRect(38, 18, 10, 6);
    g.generateTexture('boss', 48, 48); g.destroy();

    // Ground platform
    g = sc.make.graphics({ add: false });
    g.fillStyle(0x5a7a8a); g.fillRect(0, 0, 128, 32);
    g.fillStyle(0x4a6a7a); g.fillRect(0, 0, 128, 3);
    g.fillStyle(0x6a8a9a); g.fillRect(0, 29, 128, 3);
    g.generateTexture('ground', 128, 32); g.destroy();

    // Bullet
    g = sc.make.graphics({ add: false });
    g.fillStyle(0xffff00); g.fillRect(0, 0, 8, 4);
    g.fillStyle(0xffffff); g.fillRect(5, 0, 3, 4);
    g.generateTexture('bullet', 8, 4); g.destroy();

    // Shotgun pellet
    g = sc.make.graphics({ add: false });
    g.fillStyle(0xff8800); g.fillCircle(4, 3, 3);
    g.generateTexture('bullet_shotgun', 8, 6); g.destroy();

    // Rifle bullet
    g = sc.make.graphics({ add: false });
    g.fillStyle(0x00ffff); g.fillRect(0, 0, 12, 3);
    g.fillStyle(0xffffff); g.fillRect(8, 0, 4, 3);
    g.generateTexture('bullet_rifle', 12, 3); g.destroy();

    // Moving platform
    g = sc.make.graphics({ add: false });
    g.fillStyle(0x886633); g.fillRect(0, 0, 96, 20);
    g.fillStyle(0xaa8844); g.fillRect(0, 0, 96, 3);
    g.fillStyle(0x775522); g.fillRect(0, 17, 96, 3);
    g.generateTexture('moving_platform', 96, 20); g.destroy();

    // Power-up textures
    var puKeys = Object.keys(PowerUpData);
    for (var i = 0; i < puKeys.length; i++) {
        var key = puKeys[i];
        var pu = PowerUpData[key];
        g = sc.make.graphics({ add: false });
        g.fillStyle(pu.color, 0.25); g.fillCircle(10, 10, 10);
        g.lineStyle(2, pu.color, 1); g.strokeCircle(10, 10, 10);
        g.fillStyle(pu.color, 0.6); g.fillCircle(10, 10, 5);
        g.generateTexture('powerup_' + key, 20, 20); g.destroy();
    }

    // Coin texture
    g = sc.make.graphics({ add: false });
    g.fillStyle(0xffcc00); g.fillCircle(10, 10, 10);
    g.fillStyle(0xffee44); g.fillCircle(10, 10, 7);
    g.fillStyle(0xffdd22); g.fillCircle(9, 9, 4);
    g.generateTexture('coin', 20, 20); g.destroy();
}

// ---- Phaser Config ----
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 320, height: 240 },
        max: { width: 1600, height: 1200 }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: true,
    roundPixels: true,
    input: {
        activePointers: 3
    }
};

// ---- Phaser Lifecycle ----
function preload() {
    if (!texturesGenerated) {
        generateTextures(this);
        texturesGenerated = true;
    }
}

function create() {
    scene = this;

    // Input setup
    cursors = this.input.keyboard.createCursorKeys();
    fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    k1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    k2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    k3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // Disable browser keyboard shortcuts for game keys
    this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);

    pauseKey.on('down', function() {
        if (gameRunning && !gamePaused && !levelCompletePending) {
            togglePause();
        } else if (gamePaused) {
            togglePause();
        }
    });

    // Physics groups
    platforms = this.physics.add.staticGroup();
    movingPlatforms = this.physics.add.group();
    bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 30 });
    enemies = this.physics.add.group();
    coins = this.physics.add.group();
    powerupItems = this.physics.add.group();
    boss = null;

    // If game is running (after restart), setup level
    if (gameRunning) {
        doSetupLevel();
    }
}

function update(time, delta) {
    if (!gameRunning || gamePaused || !player || !player.body || levelCompletePending) return;
    levelTimeElapsed += delta;
    GameState.timePlayed += delta;
    handleMovement(time);
    handleShooting(time);
    handleWeaponSwitch();
    updateEnemyAI(time);
    updateBossAI(time);
    cleanupBullets();
    checkLevelComplete();
    updateGameUI();
}

// ---- Bullet Cleanup ----
function cleanupBullets() {
    bullets.children.iterate(function(bullet) {
        if (!bullet || !bullet.active) return;
        // Destroy bullets that go off-screen
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
            bullet.destroy();
        }
    });
}

// ---- Level Setup ----
function doSetupLevel() {
    var level = LevelData[GameState.currentLevel];
    GameState.resetForLevel();
    levelTimeElapsed = 0;
    tutorialIndex = 0;
    currentWave = 0;
    levelCompletePending = false;

    // Remove old physics colliders to prevent accumulation across level loads
    for (var c = 0; c < activeColliders.length; c++) {
        if (activeColliders[c]) {
            activeColliders[c].destroy();
        }
    }
    activeColliders = [];

    // Apply permanent credit upgrades
    if (typeof applyPermanentUpgrades === 'function') {
        applyPermanentUpgrades();
    }

    // Hide all overlays and show HUD
    hideAllOverlays();
    document.getElementById('hud').classList.remove('hidden');

    // Update credit display in HUD
    if (typeof CreditWallet !== 'undefined') {
        CreditWallet.updateHUDCredits();
    }

    // Background
    scene.cameras.main.setBackgroundColor(level.bg);

    // Clear groups
    platforms.clear(true, true);
    movingPlatforms.clear(true, true);
    bullets.clear(true, true);
    enemies.clear(true, true);
    coins.clear(true, true);
    powerupItems.clear(true, true);
    if (boss) { if (boss.attackEvent) boss.attackEvent.destroy(); boss.destroy(); boss = null; }

    // Ground
    var ground = platforms.create(400, 585, 'ground');
    ground.setScale(2).refreshBody();

    // Static platforms
    var platformCount = 5 + Math.floor(GameState.currentLevel * 0.5);
    for (var i = 0; i < platformCount; i++) {
        var px = Phaser.Math.Between(80, 720);
        var py = Phaser.Math.Between(180, 460);
        var p = platforms.create(px, py, 'ground');
        p.setScale(0.3).refreshBody();
    }

    // Moving platforms
    if (level.movingPlatforms) {
        var mCount = level.movingPlatformCount || 3;
        for (var j = 0; j < mCount; j++) {
            var mx = Phaser.Math.Between(100, 700);
            var my = Phaser.Math.Between(200, 450);
            var mp = movingPlatforms.create(mx, my, 'moving_platform');
            mp.setImmovable(true);
            mp.body.allowGravity = false;
            var isH = Math.random() > 0.4;
            var dist = Phaser.Math.Between(60, 180);
            var dur = Phaser.Math.Between(2000, 4000);
            scene.tweens.add({
                targets: mp,
                x: isH ? mp.x + dist : mp.x,
                y: isH ? mp.y : mp.y + dist * 0.5,
                yoyo: true, repeat: -1, duration: dur, ease: 'Sine.easeInOut'
            });
        }
    }

    // Destroy old player sprite to prevent leftover physics bodies
    if (player) {
        if (player.body) player.body.enable = false;
        player.destroy();
        player = null;
    }

    // Remove old physics constraints to prevent accumulation across level loads

    // Player
    player = scene.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.05);
    player.setCollideWorldBounds(true);
    player.body.setSize(20, 28);
    player.body.setOffset(6, 4);

    // Collisions
    activeColliders.push(scene.physics.add.collider(player, platforms));
    activeColliders.push(scene.physics.add.collider(player, movingPlatforms));
    activeColliders.push(scene.physics.add.collider(enemies, platforms));
    activeColliders.push(scene.physics.add.collider(enemies, movingPlatforms));
    activeColliders.push(scene.physics.add.overlap(player, enemies, handleEnemyCollision, null, scene));
    activeColliders.push(scene.physics.add.overlap(bullets, enemies, handleBulletHitEnemy, null, scene));
    if (boss) { activeColliders.push(scene.physics.add.overlap(bullets, boss, handleBulletHitBoss, null, scene)); }
    activeColliders.push(scene.physics.add.overlap(player, powerupItems, collectPowerup, null, scene));
    activeColliders.push(scene.physics.add.overlap(player, coins, collectCoin, null, scene));
    // Bullets collide with terrain (walls, platforms)
    activeColliders.push(scene.physics.add.collider(bullets, platforms, handleBulletHitTerrain, null, scene));
    activeColliders.push(scene.physics.add.collider(bullets, movingPlatforms, handleBulletHitTerrain, null, scene));

    // Spawn enemies
    if (level.hasBoss) {
        spawnMinionEnemies(level);
        scene.time.delayedCall(1500, function() { spawnBoss(); });
    } else if (level.hordeMode) {
        currentWave = 0;
        scene.time.delayedCall(1000, function() { startNextWave(); });
    } else {
        spawnEnemies(level);
    }

    // Initial power-ups
    spawnInitialPowerups(level);

    // Level intro text
    // Camera: zoom in and follow the player
    scene.cameras.main.startFollow(player, true, 0.1, 0.1);
    scene.cameras.main.setZoom(1.5);
    scene.cameras.main.setBounds(0, 0, 800, 600);
    scene.cameras.main.setDeadzone(100, 50);

    showFloatingText(400, 300, level.name, '#ff8800', 40, 2000);
    if (level.stealth) {
        scene.time.delayedCall(500, function() {
            showFloatingText(400, 350, 'STEALTH MODE', '#00ff88', 24, 2500);
        });
    }

    // Tutorial messages
    tutorialMessages = level.tutorial ? level.tutorialMessages.slice() : [];
    if (tutorialMessages.length > 0) {
        scene.time.delayedCall(1500, function() { showTutorialMessage(); });
    }
}

// ---- Movement ----
// ---- Movement ----
function handleMovement(time) {
    var speed = GameState.speedBoost ? 300 : 200;
    var left = cursors.left.isDown || (aKey && aKey.isDown) || touchState.left;
    var right = cursors.right.isDown || (dKey && dKey.isDown) || touchState.right;
    var jump = cursors.up.isDown || (wKey && wKey.isDown) || touchState.jumpQueued;
    if (left) {
        player.setVelocityX(-speed);
        player.flipX = true;
    } else if (right) {
        player.setVelocityX(speed);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }
    if (jump && (player.body.touching.down || player.body.blocked.down || player.body.onFloor()) && time - lastJumpTime > 300) {
        player.setVelocityY(-700);
        touchState.jumpQueued = false;
        lastJumpTime = time;
    }
}

// ---- Shooting ----
function handleShooting(time) {
    if (fireKey.isDown || touchState.fire) {
        var weapon = WeaponData[GameState.currentWeapon];
        if (time - lastFireTime >= weapon.fireRate) {
            fireWeapon();
            lastFireTime = time;
        }
    }
}

function fireWeapon() {
    var weapon = WeaponData[GameState.currentWeapon];
    if (!weapon.infinite && GameState.ammo[GameState.currentWeapon] <= 0) return;
    if (!weapon.infinite) {
        GameState.ammo[GameState.currentWeapon] -= weapon.ammoPerShot;
    }

    var dir = player.flipX ? -1 : 1;
    var bKey = weapon.bulletKey;

    if (weapon.bulletCount === 1) {
        var bullet = bullets.get(player.x + (dir * 16), player.y - 2, bKey);
        if (bullet) {
            bullet.setActive(true).setVisible(true);
            bullet.body.allowGravity = false;
            bullet.setVelocityX(dir * weapon.bulletSpeed);
            bullet.damage = weapon.damage;
            bullet.weaponType = GameState.currentWeapon;
            scene.time.delayedCall(1500, function() { if (bullet.active) bullet.destroy(); });
        }
    } else {
        for (var i = 0; i < weapon.bulletCount; i++) {
            var angle = (i - (weapon.bulletCount - 1) / 2) * weapon.spread * (Math.PI / 180);
            var vx = Math.cos(angle) * weapon.bulletSpeed * dir;
            var vy = Math.sin(angle) * weapon.bulletSpeed;
            var b = bullets.get(player.x + (dir * 16), player.y - 2, bKey);
            if (b) {
                b.setActive(true).setVisible(true);
                b.body.allowGravity = false;
                b.setVelocity(vx, vy);
                b.damage = weapon.damage;
                b.weaponType = GameState.currentWeapon;
                scene.time.delayedCall(1200, (function(bullet) {
                    return function() { if (bullet.active) bullet.destroy(); };
                })(b));
            }
        }
    }

    // Muzzle flash
    var flash = scene.add.circle(player.x + (dir * 16), player.y - 2, 4, weapon.color, 0.8);
    scene.tweens.add({
        targets: flash, alpha: 0, scale: 2, duration: 100,
        onComplete: function() { flash.destroy(); }
    });
}

// ---- Weapon Switch ----
function handleWeaponSwitch() {
    if (Phaser.Input.Keyboard.JustDown(k1)) switchToWeapon('pistol');
    if (Phaser.Input.Keyboard.JustDown(k2) && GameState.weapons.indexOf('shotgun') >= 0) switchToWeapon('shotgun');
    if (Phaser.Input.Keyboard.JustDown(k3) && GameState.weapons.indexOf('rifle') >= 0) switchToWeapon('rifle');
}

function switchToWeapon(name) {
    if (GameState.weapons.indexOf(name) >= 0) {
        GameState.currentWeapon = name;
        showFloatingText(player.x, player.y - 30, WeaponData[name].name, '#88aaff', 16, 800);
    }
}

// ---- Enemy Spawning ----
function spawnEnemies(level) {
    var count = Math.floor(level.enemyCount * getDifficultyScale(0));
    for (var i = 0; i < count; i++) {
        createEnemy(level);
    }
}

function spawnMinionEnemies(level) {
    var count = Math.floor(level.enemyCount * 0.7);
    for (var i = 0; i < count; i++) {
        createEnemy(level);
    }
}

function createEnemy(level) {
    var x = Phaser.Math.Between(300, 750);
    var y = Phaser.Math.Between(0, 100);
    var enemy = enemies.create(x, y, 'enemy');
    enemy.setBounce(0.2);
    enemy.setCollideWorldBounds(true);
    enemy.body.setSize(20, 24);
    enemy.body.setOffset(6, 4);
    enemy.enemyData = {
        direction: Math.random() > 0.5 ? -1 : 1,
        health: level.enemyHealth || 1,
        speed: level.enemySpeed || 80,
        detected: false
    };
    return enemy;
}

// ---- Boss ----
function spawnBoss() {
    boss = scene.physics.add.sprite(650, 200, 'boss');
    boss.setBounce(0.3);
    boss.setCollideWorldBounds(true);
    boss.body.setSize(36, 44);
    boss.body.setOffset(6, 4);
    boss.health = LevelData[GameState.currentLevel].bossHealth;
    boss.maxHealth = LevelData[GameState.currentLevel].bossHealth;
    boss.attacking = false;
    scene.physics.add.collider(boss, platforms);
    scene.physics.add.collider(boss, movingPlatforms);

    boss.attackEvent = scene.time.addEvent({
        delay: 2200, callback: function() { bossAttack(); }, loop: true
    });

    showFloatingText(400, 200, '⚔ RAT KING APPEARS! ⚔', '#ff00ff', 28, 2000);
}

function bossAttack() {
    if (!boss || !boss.active || !gameRunning || gamePaused) return;
    var dx = player.x - boss.x;
    var dir = dx > 0 ? 1 : -1;
    boss.attacking = true;
    boss.setVelocityX(dir * 250);
    scene.time.delayedCall(700, function() {
        if (boss && boss.active) { boss.setVelocityX(0); boss.attacking = false; }
    });
}

function updateBossAI(time) {
    if (!boss || !boss.active) return;
    if (Phaser.Math.Distance.Between(player.x, player.y, boss.x, boss.y) < 44) {
        var now = scene.time.now;
        if (now - lastDamageTime >= INVINCIBILITY_DURATION) { // Only damage if not invincible
            handleDamage(15);
        }
    }
}

// ---- Enemy AI ----
function updateEnemyAI(time) {
    var level = LevelData[GameState.currentLevel];
    enemies.children.iterate(function(enemy) {
        if (!enemy || !enemy.active || !enemy.body) return;
        var ed = enemy.enemyData;

        // Bounce off walls
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
            ed.direction *= -1;
        }

        // Stealth detection
        if (level.stealth && !ed.detected) {
            var dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (dist < level.stealthDetectionRange) {
                ed.detected = true;
                enemy.setTint(0xff4444);
                // Alert nearby enemies
                enemies.children.iterate(function(other) {
                    if (other && other !== enemy && other.active && other.enemyData) {
                        var d = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
                        if (d < 200) {
                            other.enemyData.detected = true;
                            other.setTint(0xff4444);
                        }
                    }
                });
            }
        }

        var speed = ed.detected ? ed.speed * 2 : ed.speed;
        if (ed.detected) {
            var dx = player.x - enemy.x;
            enemy.setVelocityX(dx > 0 ? speed : -speed);
            enemy.flipX = dx < 0;
        } else {
            enemy.setVelocityX(speed * ed.direction);
            enemy.flipX = ed.direction === 1;
        }
    });
}

// ---- Damage System ----
var lastDamageTime = 0;
var INVINCIBILITY_DURATION = 1000; // 1 second i-frames

function handleEnemyCollision(playerObj, enemy) {
    if (!enemy.active) return;
    var now = scene.time.now;
    if (now - lastDamageTime < INVINCIBILITY_DURATION) return; // Invincibility frames active
    handleDamage(10);
}

function handleDamage(amount) {
    var now = scene.time.now;
    if (now - lastDamageTime < INVINCIBILITY_DURATION) return; // Invincibility frames active
    
    if (GameState.shieldHits > 0) {
        GameState.shieldHits--;
        showFloatingText(player.x, player.y - 20, 'SHIELD!', '#0088ff', 20, 600);
        player.setTint(0x0088ff);
        scene.time.delayedCall(200, function() { if (player.active) player.clearTint(); });
        lastDamageTime = now;
        return;
    }

    GameState.health -= amount;
    lastDamageTime = now;
    
    if (GameState.health <= 0) {
        GameState.health = 0;
        GameState.lives--;
        GameState.deaths++;
        if (GameState.lives <= 0) {
            triggerGameOver();
            return;
        }
        // Respawn
        GameState.health = GameState.maxHealth;
        showFloatingText(400, 300, 'RESPAWN! (' + GameState.lives + ' lives left)', '#ff00ff', 24, 1500);
        scene.tweens.add({ targets: player, alpha: 0.3, duration: 200, yoyo: true, repeat: 5 });
    }

    player.setTint(0xff0000);
    scene.time.delayedCall(200, function() { if (player.active) player.clearTint(); });
}

// ---- Bullet Hit Enemy ----
function handleBulletHitTerrain(bullet, terrain) {
    if (!bullet || !bullet.active) return;
    bullet.destroy();
}

function handleBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    var level = LevelData[GameState.currentLevel];
    var damage = bullet.damage || 1;
    var isSilent = false;

    if (GameState.damageBoost) damage *= 2;
    if (level.stealth && enemy.enemyData && !enemy.enemyData.detected) {
        damage *= (level.stealthDamageMultiplier || 3);
        isSilent = true;
    }

    enemy.enemyData.health -= damage;
    if (enemy.enemyData.health <= 0) {
        killEnemy(enemy, isSilent);
    } else {
        enemy.setTint(0xff0000);
        scene.time.delayedCall(100, function() { if (enemy.active) enemy.clearTint(); });
    }
    bullet.destroy();
}

function killEnemy(enemy, isSilent) {
    var level = LevelData[GameState.currentLevel];
    var baseScore = 10;
    var bonusScore = isSilent ? (level.stealthBonusScore || 50) : 0;

    GameState.kills++;
    if (isSilent) GameState.stealthKills++;

    // Combo
    var now = scene.time.now;
    if (now - GameState.lastKillTime < 3000 && GameState.lastKillTime > 0) {
        GameState.combo++;
    } else {
        GameState.combo = 1;
    }
    GameState.comboMultiplier = Math.min(1 + Math.floor(GameState.combo / 3), 10);
    GameState.lastKillTime = now;
    if (GameState.combo > GameState.maxCombo) GameState.maxCombo = GameState.combo;

    var totalScore = (baseScore + bonusScore) * GameState.comboMultiplier;
    GameState.score += totalScore;
    var text = isSilent ? 'SILENT +' + totalScore : '+' + totalScore;
    // Credit earnings
    if (typeof CreditWallet !== 'undefined') {
        CreditWallet.earnOnKill(isSilent);
        if (GameState.combo >= 3) {
            CreditWallet.earnOnCombo(GameState.combo);
        }
    }

    var color = isSilent ? '#00ff88' : (GameState.comboMultiplier > 1 ? '#ffff00' : '#ffffff');
    showFloatingText(enemy.x, enemy.y - 10, text, color, isSilent ? 20 : 16, 1000);

    spawnDeathParticles(enemy.x, enemy.y, 0x888888);

    // Drop coins at death location
    var coinCount = Phaser.Math.Between(1, 3);
    for (var ci = 0; ci < coinCount; ci++) {
        var coin = coins.create(
            enemy.x + Phaser.Math.Between(-20, 20),
            enemy.y,
            'coin'
        );
        coin.setBounce(0.4);
        coin.setCollideWorldBounds(true);
        coin.body.allowGravity = true;
        coin.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-200, -100));
        // Auto-destroy coins after 10 seconds
        window.setTimeout(function() {
            if (coin && coin.active) coin.destroy();
        }, 10000);
    }

    if (Math.random() < (level.powerupChance || 0.3)) {
        spawnPowerup(enemy.x, enemy.y);
    }

    enemy.destroy();
}

function handleBulletHitBoss(bullet, bossObj) {
    if (!bullet.active || !bossObj || !bossObj.active) return;
    var damage = bullet.damage || 1;
    if (GameState.damageBoost) damage *= 2;
    bossObj.health -= damage;
    bullet.destroy();

    if (bossObj.health <= 0) {
        killBoss();
    } else {
        bossObj.setTint(0xff0000);
        scene.time.delayedCall(100, function() { if (bossObj.active) bossObj.clearTint(); });
        showFloatingText(bossObj.x, bossObj.y - 20, '-' + damage, '#ff0000', 16, 800);
    }
}

function killBoss() {
    GameState.kills++;
    GameState.score += 200 * GameState.comboMultiplier;
    // Credit earnings for boss kill
    if (typeof CreditWallet !== 'undefined') {
        CreditWallet.earnOnBossKill();
    }
    spawnDeathParticles(boss.x, boss.y, 0xff00ff, 30);
    showFloatingText(boss.x, boss.y - 30, 'BOSS DEFEATED! +200', '#ff00ff', 28, 2000);
    if (boss.attackEvent) boss.attackEvent.destroy();
    boss.destroy();
    boss = null;
}

// ---- Power-ups ----
function spawnInitialPowerups(level) {
    var count = Phaser.Math.Between(2, 4);
    var types = Object.keys(PowerUpData);
    for (var i = 0; i < count; i++) {
        var x = Phaser.Math.Between(100, 700);
        var y = Phaser.Math.Between(200, 500);
        var type = types[Phaser.Math.Between(0, types.length - 1)];
        spawnPowerupAt(x, y, type);
    }
}

function spawnPowerup(x, y) {
    var types = Object.keys(PowerUpData);
    var type = types[Phaser.Math.Between(0, types.length - 1)];
    spawnPowerupAt(x, y, type);
}

function spawnPowerupAt(x, y, type) {
    var pu = powerupItems.create(x, y, 'powerup_' + type);
    pu.powerupType = type;
    pu.setBounce(0.3);
    pu.body.allowGravity = true;
    scene.tweens.add({
        targets: pu, y: pu.y - 10, duration: 1000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
}

function collectPowerup(playerObj, powerup) {
    if (!powerup.active) return;
    var type = powerup.powerupType;
    var data = PowerUpData[type];

    if (type === 'health') {
        GameState.health = Math.min(GameState.health + 25, GameState.maxHealth);
    } else if (type === 'damage') {
        GameState.damageBoost = true;
        if (GameState.powerupTimers.damage) GameState.powerupTimers.damage.destroy();
        GameState.powerupTimers.damage = scene.time.delayedCall(data.duration, function() {
            GameState.damageBoost = false;
            delete GameState.powerupTimers.damage;
        });
    } else if (type === 'speed') {
        GameState.speedBoost = true;
        if (GameState.powerupTimers.speed) GameState.powerupTimers.speed.destroy();
        GameState.powerupTimers.speed = scene.time.delayedCall(data.duration, function() {
            GameState.speedBoost = false;
            delete GameState.powerupTimers.speed;
        });
    } else if (type === 'shield') {
        GameState.shieldHits = 3;
        if (GameState.powerupTimers.shield) GameState.powerupTimers.shield.destroy();
        GameState.powerupTimers.shield = scene.time.delayedCall(data.duration, function() {
            GameState.shieldHits = 0;
            delete GameState.powerupTimers.shield;
        });
    } else if (type === 'ammo') {
        GameState.ammo.shotgun = Math.min(GameState.ammo.shotgun + 15, GameState.maxAmmo.shotgun);
        GameState.ammo.rifle = Math.min(GameState.ammo.rifle + 10, GameState.maxAmmo.rifle);
        if (GameState.weapons.indexOf('shotgun') < 0) GameState.weapons.push('shotgun');
        if (GameState.weapons.indexOf('rifle') < 0) GameState.weapons.push('rifle');
    } else if (type === 'life') {
        GameState.lives++;
    }

    showFloatingText(powerup.x, powerup.y - 15, data.name, '#' + data.color.toString(16).padStart(6, '0'), 14, 1000);
    var flash = scene.add.circle(powerup.x, powerup.y, 15, data.color, 0.5);
    scene.tweens.add({
        targets: flash, alpha: 0, scale: 3, duration: 300,
        onComplete: function() { flash.destroy(); }
    });
    powerup.destroy();
}

// ---- Coin Collection ----
function collectCoin(playerObj, coin) {
    if (!coin.active) return;
    GameState.score += 10;
    showFloatingText(coin.x, coin.y - 15, '+10', '#ffcc00', 14, 600);
    // Credit earnings for coin pickup
    if (typeof CreditWallet !== 'undefined') {
        CreditWallet.earnOnCoin();
    }
    var flash = scene.add.circle(coin.x, coin.y, 8, 0xffcc00, 0.6);
    scene.tweens.add({
        targets: flash, alpha: 0, scale: 2, duration: 200,
        onComplete: function() { flash.destroy(); }
    });
    coin.destroy();
}

// ---- Level Progression ----
function checkLevelComplete() {
    var level = LevelData[GameState.currentLevel];
    var allCleared = false;

    if (level.hordeMode) {
        allCleared = currentWave > level.waveCount && enemies.countActive() === 0;
    } else if (level.hasBoss) {
        allCleared = enemies.countActive() === 0 && (!boss || !boss.active);
    } else {
        allCleared = enemies.countActive() === 0;
    }

    if (allCleared && !levelCompletePending) {
        levelCompletePending = true;
        scene.time.delayedCall(800, function() { completeLevel(); });
    }
}

function startNextWave() {
    currentWave++;
    var level = LevelData[GameState.currentLevel];
    if (currentWave > level.waveCount) return;

    showFloatingText(400, 280, 'WAVE ' + currentWave + ' / ' + level.waveCount, '#ff4444', 28, 1500);
    var count = level.enemiesPerWave + Math.floor(currentWave * 1.5);
    for (var i = 0; i < count; i++) {
        (function(delay) {
            scene.time.delayedCall(delay, function() {
                if (gameRunning && !gamePaused && !levelCompletePending) createEnemy(level);
            });
        })(i * 300);
    }

    if (currentWave < level.waveCount) {
        scene.time.delayedCall(level.waveDelay, function checkWaveDone() {
            if (enemies.countActive() === 0 && gameRunning && !gamePaused && !levelCompletePending) {
                startNextWave();
            } else if (gameRunning && !gamePaused) {
                scene.time.delayedCall(500, checkWaveDone);
            }
        });
    }
}

function completeLevel() {
    var level = LevelData[GameState.currentLevel];
    var stars = SaveManager.calculateStars(GameState.currentLevel, GameState.score);
    var coins = stars * 50 + Math.floor(GameState.score / 100) * 10;

    SaveManager.addCoins(coins);
    SaveManager.updateLevelStars(GameState.currentLevel, stars);
    // Credit earnings for level completion
    if (typeof CreditWallet !== 'undefined') {
        CreditWallet.earnOnLevelComplete(stars);
    }

    // Unlock weapons by progression
    if (GameState.currentLevel >= 2 && GameState.weapons.indexOf('shotgun') < 0)
        GameState.weapons.push('shotgun');
    if (GameState.currentLevel >= 3 && GameState.weapons.indexOf('rifle') < 0)
        GameState.weapons.push('rifle');

    SaveManager.autoSave(GameState.getSerializable());
    var isNewHS = SaveManager.isHighScore(GameState.score);

    document.getElementById('hud').classList.add('hidden');

    if (GameState.currentLevel >= 5) {
        showFinalVictory(stars, coins, isNewHS);
    } else {
        showLevelComplete(stars, coins, isNewHS);
    }
}

// ---- Game Over ----
function triggerGameOver() {
    gameRunning = false;
    gamePaused = false;

    // Check auto-revive before game over
    if (typeof checkAutoRevive === 'function' && checkAutoRevive()) {
        gameRunning = true;
        return;
    }

    document.getElementById('hud').classList.add('hidden');
    if (player) { player.setTint(0xff0000); spawnDeathParticles(player.x, player.y, 0xff0055, 20); }
    SaveManager.addHighScore(GameState.score, GameState.currentLevel, GameState.kills, GameState.stealthKills, GameState.maxCombo);
    showGameOverScreen(SaveManager.isHighScore(GameState.score));
}

// ---- Pause ----
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        scene.physics.pause();
        showOverlay('pause-screen');
    } else {
        scene.physics.resume();
        hideAllOverlays();
        document.getElementById('hud').classList.remove('hidden');
    }
}

// ---- Visual Effects ----
function showFloatingText(x, y, text, color, size, duration) {
    if (!scene) return;
    var ft = scene.add.text(x, y, text, {
        fontSize: (size || 16) + 'px',
        fill: color || '#ffffff',
        fontFamily: 'Courier New',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);

    scene.tweens.add({
        targets: ft, y: y - 40, alpha: 0,
        duration: duration || 1000, ease: 'Power2',
        onComplete: function() { ft.destroy(); }
    });
}

function spawnDeathParticles(x, y, color, count) {
    if (!scene) return;
    for (var i = 0; i < (count || 10); i++) {
        var p = scene.add.circle(x, y, Phaser.Math.Between(2, 5), color);
        var angle = Math.random() * Math.PI * 2;
        var speed = Phaser.Math.Between(50, 150);
        scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0, scale: 0,
            duration: Phaser.Math.Between(300, 600),
            ease: 'Power2',
            onComplete: function() { p.destroy(); }
        });
    }
}

function showTutorialMessage() {
    if (tutorialIndex < tutorialMessages.length) {
        showFloatingText(400, 80, tutorialMessages[tutorialIndex], '#00ff88', 16, 3000);
        tutorialIndex++;
        if (tutorialIndex < tutorialMessages.length) {
            scene.time.delayedCall(3500, function() { showTutorialMessage(); });
        }
    }
}

// ---- DOM UI Updates ----
function updateGameUI() {
    var hb = document.getElementById('hud-health-fill');
    var ht = document.getElementById('hud-health-text');
    if (hb) {
        var pct = (GameState.health / GameState.maxHealth) * 100;
        hb.style.width = pct + '%';
        hb.style.backgroundColor = pct > 60 ? '#00ff00' : pct > 30 ? '#ffff00' : '#ff0000';
    }
    if (ht) ht.textContent = GameState.health;
    var se = document.getElementById('hud-score');
    if (se) se.textContent = 'Score: ' + GameState.score;
    var ce = document.getElementById('hud-combo');
    if (ce) {
        if (GameState.comboMultiplier > 1) {
            ce.textContent = 'x' + GameState.comboMultiplier + ' COMBO';
            ce.style.display = 'block';
        } else { ce.style.display = 'none'; }
    }
    var le = document.getElementById('hud-lives');
    if (le) {
        var hearts = '';
        for (var i = 0; i < GameState.lives; i++) hearts += '♥ ';
        le.textContent = hearts;
    }
    var we = document.getElementById('hud-weapon');
    if (we) we.textContent = WeaponData[GameState.currentWeapon].name;
    var ae = document.getElementById('hud-ammo');
    if (ae) {
        var w = WeaponData[GameState.currentWeapon];
        ae.textContent = w.infinite ? '\u221E' : GameState.ammo[GameState.currentWeapon];
        ae.style.color = (!w.infinite && GameState.ammo[GameState.currentWeapon] <= 5) ? '#ff0000' : '#ffaa00';
    }
    var lv = document.getElementById('hud-level');
    if (lv) lv.textContent = 'Lv' + GameState.currentLevel;
    var puEl = document.getElementById('hud-powerups');
    if (puEl) {
        var html = '';
        if (GameState.damageBoost) html += '<span class="pu-active" style="color:#ff0000">\u2694 DMG</span>';
        if (GameState.speedBoost) html += '<span class="pu-active" style="color:#ffff00">\u26A1 SPD</span>';
        if (GameState.shieldHits > 0) html += '<span class="pu-active" style="color:#0088ff">\u25C6 SHD\u00D7' + GameState.shieldHits + '</span>';
        puEl.innerHTML = html;
    }
    // Boss health
    var bb = document.getElementById('hud-boss-bar');
    var bn = document.getElementById('hud-boss-name');
    if (boss && boss.active) {
        if (bb) { bb.style.display = 'block'; document.getElementById('hud-boss-fill').style.width = (boss.health / boss.maxHealth * 100) + '%'; }
        if (bn) bn.style.display = 'block';
    } else {
        if (bb) bb.style.display = 'none';
        if (bn) bn.style.display = 'none';
    }
    // Wave info
    var wv = document.getElementById('hud-wave');
    if (wv) {
        var level = LevelData[GameState.currentLevel];
        if (level.hordeMode && currentWave > 0) {
            wv.textContent = 'Wave ' + Math.min(currentWave, level.waveCount) + '/' + level.waveCount;
            wv.style.display = 'block';
        } else { wv.style.display = 'none'; }
    }
    // Stealth indicator
    var si = document.getElementById('hud-stealth');
    if (si) {
        var lv2 = LevelData[GameState.currentLevel];
        si.style.display = lv2.stealth ? 'block' : 'none';
    }
}

// ---- Overlay Management ----
function showOverlay(id) {
    hideAllOverlays();
    var el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function hideAllOverlays() {
    var overlays = document.querySelectorAll('.overlay-screen');
    for (var i = 0; i < overlays.length; i++) {
        overlays[i].classList.add('hidden');
    }
}

function showGameOverScreen(isNewHS) {
    var stats = document.getElementById('gameover-stats');
    if (stats) {
        stats.innerHTML = '<p>Score: <span class="stat-value">' + GameState.score + '</span></p>' +
            '<p>Level Reached: <span class="stat-value">' + GameState.currentLevel + '</span></p>' +
            '<p>Total Kills: <span class="stat-value">' + GameState.kills + '</span></p>' +
            '<p>Stealth Kills: <span class="stat-value">' + GameState.stealthKills + '</span></p>' +
            '<p>Max Combo: <span class="stat-value">x' + GameState.maxCombo + '</span></p>' +
            '<p>Deaths: <span class="stat-value">' + GameState.deaths + '</span></p>';
    }
    var hsb = document.getElementById('gameover-highscore');
    if (hsb) hsb.classList.toggle('hidden', !isNewHS);
    showOverlay('gameover-screen');
}

function showLevelComplete(stars, coins, isNewHS) {
    var starsEl = document.getElementById('victory-stars');
    if (starsEl) {
        var html = '';
        for (var i = 0; i < 3; i++) {
            html += i < stars ? '<span class="star earned">\u2605</span>' : '<span class="star">\u2606</span>';
        }
        starsEl.innerHTML = html;
    }
    var stats = document.getElementById('victory-stats');
    if (stats) {
        stats.innerHTML = '<p>Score: <span class="stat-value">' + GameState.score + '</span></p>' +
            '<p>Kills: <span class="stat-value">' + GameState.kills + '</span></p>' +
            '<p>Stealth Kills: <span class="stat-value">' + GameState.stealthKills + '</span></p>' +
            '<p>Max Combo: <span class="stat-value">x' + GameState.maxCombo + '</span></p>' +
            '<p>Time: <span class="stat-value">' + Math.floor(levelTimeElapsed / 1000) + 's</span></p>' +
            '<p>Coins Earned: <span class="stat-value" style="color:#ffcc00">+' + coins + '</span></p>';
    }
    showOverlay('victory-screen');
}

function showFinalVictory(stars, coins, isNewHS) {
    var settings = SaveManager.getSettings();
    var starsEl = document.getElementById('final-stars');
    if (starsEl) {
        var html = '<span style="font-size:1.5rem">GAME COMPLETE!</span><br>';
        for (var i = 0; i < 3; i++) {
            html += i < stars ? '<span class="star earned">\u2605</span>' : '<span class="star">\u2606</span>';
        }
        html += '<br><span style="font-size:1rem;color:#aaa">Total Stars: ' + (settings.totalStars || 0) + '/15</span>';
        starsEl.innerHTML = html;
    }
    var stats = document.getElementById('final-stats');
    if (stats) {
        stats.innerHTML = '<p>Final Score: <span class="stat-value">' + GameState.score + '</span></p>' +
            '<p>Total Kills: <span class="stat-value">' + GameState.kills + '</span></p>' +
            '<p>Stealth Kills: <span class="stat-value">' + GameState.stealthKills + '</span></p>' +
            '<p>Best Combo: <span class="stat-value">x' + GameState.maxCombo + '</span></p>' +
            '<p>Coins Earned: <span class="stat-value" style="color:#ffcc00">+' + coins + '</span></p>';
    }
    SaveManager.addHighScore(GameState.score, 5, GameState.kills, GameState.stealthKills, GameState.maxCombo);
    showOverlay('final-victory-screen');
}

// ---- Level Select ----
function populateLevelSelect() {
    var grid = document.getElementById('level-grid');
    if (!grid) return;
    var settings = SaveManager.getSettings();
    grid.innerHTML = '';
    for (var i = 1; i <= 5; i++) {
        var level = LevelData[i];
        var stars = (settings.levelStars && settings.levelStars[i]) || 0;
        var unlocked = i === 1 || ((settings.levelStars && settings.levelStars[i - 1]) > 0);
        var card = document.createElement('div');
        card.className = 'level-card' + (unlocked ? '' : ' locked');
        var starsHtml = '';
        for (var j = 0; j < 3; j++) {
            starsHtml += '<span class="' + (j < stars ? 'earned' : '') + '">' + (j < stars ? '\u2605' : '\u2606') + '</span>';
        }
        card.innerHTML = '<div class="level-num">' + (unlocked ? i : '\uD83D\uDD12') + '</div>' +
            '<div class="level-name">' + level.name + '</div>' +
            '<div class="level-stars">' + starsHtml + '</div>';
        if (unlocked) {
            (function(lvl) {
                card.onclick = function() {
                    hideAllOverlays();
                    GameState.resetForNewGame();
                    GameState.currentLevel = lvl;
                    gameRunning = true;
                    gamePaused = false;
                    levelCompletePending = false;
                    doSetupLevel();
                };
            })(i);
        }
        grid.appendChild(card);
    }
}

// ---- Save/Load Screen ----
function populateSaveSlots() {
    var container = document.getElementById('save-slots');
    if (!container) return;
    container.innerHTML = '';

    // Auto-save slot
    var autoSlot = SaveManager.formatSlotDisplay(0);
    var autoDiv = document.createElement('div');
    autoDiv.className = 'save-slot';
    autoDiv.innerHTML = '<div class="slot-info"><div class="slot-title">\uD83D\uDCBE Auto Save</div>' +
        '<div class="slot-detail ' + (autoSlot.empty ? 'slot-empty' : '') + '">' +
        (autoSlot.empty ? 'Empty' : autoSlot.text) + '</div></div>' +
        '<div class="slot-actions">' +
        (!autoSlot.empty && saveMode === 'load' ? '<button onclick="doLoadSlot(0)">Load</button>' : '') +
        '</div>';
    container.appendChild(autoDiv);

    for (var i = 1; i <= 3; i++) {
        var slot = SaveManager.formatSlotDisplay(i);
        var div = document.createElement('div');
        div.className = 'save-slot';
        if (slot.empty) {
            div.innerHTML = '<div class="slot-info"><div class="slot-title">Slot ' + i + '</div>' +
                '<div class="slot-detail slot-empty">Empty</div></div>' +
                '<div class="slot-actions">' +
                (saveMode === 'save' ? '<button onclick="doSaveSlot(' + i + ')">Save</button>' : '') + '</div>';
        } else {
            div.innerHTML = '<div class="slot-info"><div class="slot-title">Slot ' + i + '</div>' +
                '<div class="slot-detail">' + slot.text + '</div></div>' +
                '<div class="slot-actions">' +
                (saveMode === 'load' ? '<button onclick="doLoadSlot(' + i + ')">Load</button>' : '') +
                (saveMode === 'save' ? '<button onclick="doSaveSlot(' + i + ')">Overwrite</button>' : '') +
                '<button class="delete-btn" onclick="doDeleteSlot(' + i + ')">Del</button></div>';
        }
        container.appendChild(div);
    }
    var title = document.getElementById('save-load-title');
    if (title) title.textContent = saveMode === 'save' ? '\uD83D\uDCBE SAVE GAME' : '\uD83D\uDCC2 LOAD GAME';
}

function doSaveSlot(slot) {
    SaveManager.saveGame(slot, GameState.getSerializable());
    populateSaveSlots();
}

function doLoadSlot(slot) {
    var data = SaveManager.loadGame(slot);
    if (data && GameState.loadFromData(data)) {
        gameRunning = true;
        gamePaused = false;
        levelCompletePending = false;
        hideAllOverlays();
        doSetupLevel();
    }
}

function doDeleteSlot(slot) {
    SaveManager.deleteSave(slot);
    populateSaveSlots();
}

// ---- High Scores Screen ----
function populateHighScores() {
    var list = document.getElementById('high-score-list');
    if (!list) return;
    var scores = SaveManager.getHighScores();
    list.innerHTML = '';
    if (scores.length === 0) {
        list.innerHTML = '<p style="color:#666;text-align:center;padding:20px">No scores yet!</p>';
        return;
    }
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var entry = document.createElement('div');
        entry.className = 'high-score-entry';
        entry.innerHTML = '<span class="rank">#' + (i + 1) + '</span>' +
            '<span style="flex:1;text-align:left">' + s.score + ' pts | Lv' + s.level + ' | Kills: ' + s.kills + '</span>' +
            '<span class="hs-date">' + (s.date || 'N/A') + '</span>';
        list.appendChild(entry);
    }
}

// ---- Skins Screen ----
function populateSkins() {
    var grid = document.getElementById('skin-grid');
    if (!grid) return;
    var settings = SaveManager.getSettings();
    grid.innerHTML = '';
    var coinsEl = document.getElementById('coins-display');
    if (coinsEl) coinsEl.textContent = '\uD83E\uDE99 ' + (settings.coins || 0) + ' coins';

    var skinKeys = Object.keys(SkinData);
    for (var i = 0; i < skinKeys.length; i++) {
        var id = skinKeys[i];
        var skin = SkinData[id];
        var unlocked = settings.unlockedSkins && settings.unlockedSkins.indexOf(id) >= 0;
        var equipped = settings.currentSkin === id;
        var card = document.createElement('div');
        card.className = 'skin-card' + (equipped ? ' equipped' : '') + (!unlocked ? ' locked' : '');
        var colorHex = '#' + skin.primaryColor.toString(16).padStart(6, '0');
        card.innerHTML = '<div class="skin-preview" style="background:' + colorHex + '"></div>' +
            '<div class="skin-name">' + skin.name + '</div>' +
            (!unlocked ? '<div class="skin-price">' + (skin.premium ? '\uD83D\uDD12 ' + skin.cost + ' coins' : 'Locked') + '</div>' : '') +
            (equipped ? '<div class="skin-price" style="color:#00ff88">EQUIPPED</div>' : '');
        (function(skinId, isUnlocked, isEquipped) {
            card.onclick = function() {
                if (isUnlocked) {
                    settings.currentSkin = skinId;
                    GameState.currentSkin = skinId;
                    SaveManager.saveSettings(settings);
                    populateSkins();
                } else if (SkinData[skinId].premium && (settings.coins || 0) >= SkinData[skinId].cost) {
                    if (confirm('Unlock ' + SkinData[skinId].name + ' for ' + SkinData[skinId].cost + ' coins?')) {
                        SaveManager.unlockSkin(skinId);
                        populateSkins();
                    }
                }
            };
        })(id, unlocked, equipped);
        grid.appendChild(card);
    }
}

// ---- Ad Screen ----
var _adCallback = null;
function showAd(callback) {
    _adCallback = callback;
    var adScreen = document.getElementById('ad-screen');
    var timerEl = document.getElementById('ad-timer');
    var closeBtn = document.getElementById('ad-close-btn');
    adScreen.classList.remove('hidden');
    closeBtn.classList.add('hidden');
    if (timerEl) timerEl.classList.remove('hidden');

    var countdown = 3;
    if (timerEl) timerEl.textContent = 'Skip in ' + countdown + '...';
    var interval = setInterval(function() {
        countdown--;
        if (countdown <= 0) {
            clearInterval(interval);
            if (timerEl) timerEl.classList.add('hidden');
            closeBtn.classList.remove('hidden');
        } else {
            if (timerEl) timerEl.textContent = 'Skip in ' + countdown + '...';
        }
    }, 1000);
}

// ---- DOM Event Handlers ----
document.addEventListener('DOMContentLoaded', function() {
    // Start screen
    document.getElementById('new-game-btn').onclick = function() {
        hideAllOverlays();
        gameRunning = true;
        gamePaused = false;
        levelCompletePending = false;
        GameState.resetForNewGame();
        // Check daily login bonus
        if (typeof CreditWallet !== 'undefined') {
            CreditWallet.grantDailyBonus();
        }
        doSetupLevel();
    };
    document.getElementById('continue-btn').onclick = function() {
        saveMode = 'load'; previousScreen = 'start-screen';
        populateSaveSlots(); showOverlay('save-load-screen');
    };
    document.getElementById('level-select-btn').onclick = function() {
        previousScreen = 'start-screen';
        populateLevelSelect(); showOverlay('level-select-screen');
    };
    document.getElementById('high-scores-btn').onclick = function() {
        previousScreen = 'start-screen';
        populateHighScores(); showOverlay('high-scores-screen');
    };

    // Pause screen
    document.getElementById('resume-btn').onclick = function() { togglePause(); };
    document.getElementById('save-btn').onclick = function() {
        saveMode = 'save'; previousScreen = 'pause-screen';
        populateSaveSlots(); showOverlay('save-load-screen');
    };
    document.getElementById('load-btn').onclick = function() {
        saveMode = 'load'; previousScreen = 'pause-screen';
        populateSaveSlots(); showOverlay('save-load-screen');
    };
    document.getElementById('pause-level-select-btn').onclick = function() {
        previousScreen = 'pause-screen';
        populateLevelSelect(); showOverlay('level-select-screen');
    };
    document.getElementById('quit-btn').onclick = function() {
        gameRunning = false; gamePaused = false;
        document.getElementById('hud').classList.add('hidden');
        if (boss && boss.attackEvent) boss.attackEvent.destroy();
        showOverlay('start-screen');
    };

    // Game Over
    document.getElementById('retry-btn').onclick = function() {
        gameRunning = true; gamePaused = false; levelCompletePending = false;
        GameState.health = GameState.maxHealth;
        doSetupLevel();
    };
    document.getElementById('gameover-quit-btn').onclick = function() {
        document.getElementById('hud').classList.add('hidden');
        showOverlay('start-screen');
    };

    // Victory
    document.getElementById('next-level-btn').onclick = function() {
        gameRunning = true; gamePaused = false; levelCompletePending = false;
        GameState.currentLevel++;
        GameState.health = GameState.maxHealth;
        showAd(function() { doSetupLevel(); });
    };
    document.getElementById('victory-level-select-btn').onclick = function() {
        previousScreen = 'victory-screen';
        populateLevelSelect(); showOverlay('level-select-screen');
    };
    document.getElementById('victory-quit-btn').onclick = function() {
        document.getElementById('hud').classList.add('hidden');
        showOverlay('start-screen');
    };

    // Final Victory
    document.getElementById('final-menu-btn').onclick = function() {
        document.getElementById('hud').classList.add('hidden');
        showOverlay('start-screen');
    };
    document.getElementById('final-replay-btn').onclick = function() {
        gameRunning = true; gamePaused = false; levelCompletePending = false;
        GameState.resetForNewGame();
        doSetupLevel();
    };

    // Back buttons
    document.getElementById('level-select-back-btn').onclick = function() {
        if (gameRunning && gamePaused) showOverlay('pause-screen');
        else showOverlay('start-screen');
    };
    document.getElementById('save-load-back-btn').onclick = function() {
        if (gameRunning && gamePaused) showOverlay('pause-screen');
        else if (gameRunning) { hideAllOverlays(); document.getElementById('hud').classList.remove('hidden'); }
        else showOverlay(previousScreen || 'start-screen');
    };
    document.getElementById('high-scores-back-btn').onclick = function() { showOverlay('start-screen'); };

    // Skins
    document.getElementById('skins-btn').onclick = function() {
        populateSkins(); showOverlay('skins-screen');
    };
    document.getElementById('skins-back-btn').onclick = function() { showOverlay('start-screen'); };

    // Store
    document.getElementById('store-btn').onclick = function() {
        if (typeof openStore === 'function') openStore('skins');
    };
    document.getElementById('store-back-btn').onclick = function() {
        if (gameRunning && gamePaused) showOverlay('pause-screen');
        else showOverlay('start-screen');
    };
    // Donate
    document.getElementById('donate-btn').onclick = function() {
        alert('Thank you for your support!\n\n(Donation link placeholder)');
    };

    // Ad close
    document.getElementById('ad-close-btn').onclick = function() {
        document.getElementById('ad-screen').classList.add('hidden');
        if (_adCallback) { _adCallback(); _adCallback = null; }
    };

    // ---- Touch Controls Setup ----
    if (isMobileDevice) {
        initTouchControls();
    }

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            if (game && game.scale) {
                game.scale.refresh();
            }
        }, 200);
    });

    // Handle resize
    window.addEventListener('resize', function() {
        if (game && game.scale) {
            game.scale.refresh();
        }
    });
});

// ---- Touch Controls ----
function initTouchControls() {
    var touchControls = document.getElementById('touch-controls');
    var joystickBase = document.getElementById('joystick-base');
    var joystickKnob = document.getElementById('joystick-knob');
    var joystickZone = document.getElementById('joystick-zone');
    var touchFire = document.getElementById('touch-fire');
    var touchJump = document.getElementById('touch-jump');
    var touchW1 = document.getElementById('touch-weapon1');
    var touchW2 = document.getElementById('touch-weapon2');
    var touchW3 = document.getElementById('touch-weapon3');

    if (!touchControls || !joystickBase) return;

    // Show touch controls when game is running
    var observer = new MutationObserver(function() {
        var hud = document.getElementById('hud');
        if (hud && !hud.classList.contains('hidden') && gameRunning) {
            touchControls.classList.remove('hidden');
        } else {
            touchControls.classList.add('hidden');
        }
    });
    observer.observe(document.getElementById('hud'), { attributes: true, attributeFilter: ['class'] });

    // Joystick logic
    var joystickActive = false;
    var joystickTouchId = null;
    var joystickCenter = { x: 0, y: 0 };
    var maxDist = 40;

    function handleJoystickMove(clientX, clientY) {
        var dx = clientX - joystickCenter.x;
        var dy = clientY - joystickCenter.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        joystickKnob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';

        // Determine direction
        var threshold = maxDist * 0.3;
        touchState.left = dx < -threshold;
        touchState.right = dx > threshold;
        touchState.up = dy < -threshold;
    }

    function resetJoystick() {
        joystickKnob.style.transform = 'translate(0, 0)';
        touchState.left = false;
        touchState.right = false;
        touchState.up = false;
    }

    joystickZone.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.changedTouches[0];
        joystickActive = true;
        joystickTouchId = touch.identifier;
        var rect = joystickBase.getBoundingClientRect();
        joystickCenter.x = rect.left + rect.width / 2;
        joystickCenter.y = rect.top + rect.height / 2;
        handleJoystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    joystickZone.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!joystickActive) return;
        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joystickTouchId) {
                handleJoystickMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
    }, { passive: false });

    function endJoystick(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joystickTouchId) {
                joystickActive = false;
                joystickTouchId = null;
                resetJoystick();
                break;
            }
        }
    }
    joystickZone.addEventListener('touchend', endJoystick, { passive: true });
    joystickZone.addEventListener('touchcancel', endJoystick, { passive: true });

    // Fire button (hold to fire)
    if (touchFire) {
        touchFire.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchState.fire = true;
        }, { passive: false });
        touchFire.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchState.fire = false;
        }, { passive: false });
        touchFire.addEventListener('touchcancel', function(e) {
            touchState.fire = false;
        }, { passive: true });
    }

    // Jump button - uses queued flag to survive short taps
    if (touchJump) {
        touchJump.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchState.jumpQueued = true;
        }, { passive: false });
        touchJump.addEventListener('touchend', function(e) {
            e.preventDefault();
        }, { passive: false });
        touchJump.addEventListener('touchcancel', function(e) {
        }, { passive: true });
    }

    // Weapon switch buttons
    function setupWeaponBtn(btn, weaponName) {
        if (!btn) return;
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            switchToWeapon(weaponName);
        }, { passive: false });
    }
    setupWeaponBtn(touchW1, 'pistol');
    setupWeaponBtn(touchW2, 'shotgun');
    setupWeaponBtn(touchW3, 'rifle');
}

// ---- Initialize Game ----
game = new Phaser.Game(config);
