
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Increased gravity for snappier platforming
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let platforms;
let cursors;
let bullets;
let enemies;
let score = 0;
let scoreText;
let health = 3;
let healthText;
let levelText;
let loopCount = 0;
let currentLevel = 1;
let gameActive = false;
let fireKey;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'player.png');
    this.load.image('enemy', 'enemy.png');
    this.load.image('ground', 'ground.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    const scene = this;
    this.cameras.main.setBackgroundColor(LevelData[currentLevel].bg);

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 585, 'ground').setScale(2).refreshBody();

    for (let i = 0; i < 5; i++) {
        let x = Phaser.Math.Between(100, 700);
        let y = Phaser.Math.Between(200, 450);
        platforms.create(x, y, 'ground').setScale(0.3).refreshBody();
    }

    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 15
    });

    enemies = this.physics.add.group();
    spawnEnemies(scene);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(player, enemies, hitPlayer, null, this);
    this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

    // FIX: Explicitly define keys to avoid conflicts
    cursors = this.input.keyboard.createCursorKeys();
    fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    healthText = this.add.text(16, 50, 'Health: 3', { fontSize: '24px', fill: '#ff0055' });
    levelText = this.add.text(500, 16, 'Level: ' + currentLevel, { fontSize: '24px', fill: '#fff' });
}

function update() {
    if (!gameActive) return;

    // Horizontal Movement (Arrows + WASD)
    const leftDown = cursors.left.isDown || this.input.keyboard.addKey('A').isDown;
    const rightDown = cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
    const upDown = cursors.up.isDown || this.input.keyboard.addKey('W').isDown;

    if (leftDown) {
        player.setVelocityX(-200);
        player.flipX = true;
    } else if (rightDown) {
        player.setVelocityX(200);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }

    // Jump Logic (Up Arrow + W)
    if (upDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }

    // Shooting Logic
    if (Phaser.Input.Keyboard.JustDown(cursors.space) || Phaser.Input.Keyboard.JustDown(fireKey)) {
        fireBullet.call(this);
    }

    enemies.children.iterate((enemy) => {
        if (enemy && enemy.body) {
            if (enemy.body.blocked.left || enemy.body.blocked.right) {
                enemy.direction *= -1;
                enemy.flipX = (enemy.direction === 1);
            }
            enemy.setVelocityX(100 * enemy.direction * getDifficultyScale(loopCount));
        }
    });

    if (enemies.countActive() === 0) {
        nextLevel(this);
    }
}

function spawnEnemies(scene) {
    let count = Math.floor(LevelData[currentLevel].enemyCount * getDifficultyScale(loopCount));
    for (let i = 0; i < count; i++) {
        let x = Phaser.Math.Between(300, 750);
        let y = 0;
        let enemy = enemies.create(x, y, 'enemy');
        enemy.setBounce(0.2);
        enemy.setCollideWorldBounds(true);
        enemy.direction = -1;
    }
}

function fireBullet() {
    let bullet = bullets.get(player.x, player.y);
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.allowGravity = false;
        bullet.setVelocityX(player.flipX ? -500 : 500);
        this.time.delayedCall(1500, () => { if(bullet.active) bullet.destroy(); });
    }
}

function hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}

function hitPlayer(player, enemy) {
    health -= 1;
    healthText.setText('Health: ' + health);
    enemy.destroy();
    if (health <= 0) gameOver();
}

function nextLevel(scene) {
    currentLevel++;
    if (currentLevel > 3) {
        currentLevel = 1;
        loopCount++;
    }
    scene.cameras.main.setBackgroundColor(LevelData[currentLevel].bg);
    levelText.setText('Level: ' + currentLevel + ' (Loop ' + loopCount + ')');
    spawnEnemies(scene);
}

function gameOver() {
    gameActive = false;
    player.setTint(0xff0000);
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = 'Score: ' + score;
}

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-screen').classList.add('hidden');
    gameActive = true;
};

document.getElementById('restart-btn').onclick = () => {
    location.reload();
};
