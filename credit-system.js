// ============================================================
// credit-system.js - Play-to-Win Credit Economy for Elite Kitty
// ============================================================

var CreditWallet = {
    STORAGE_KEY: 'eliteKitty_creditWallet',
    DAILY_KEY: 'eliteKitty_dailyLogin',
    UNLOCKED_SLOTS_KEY: 'eliteKitty_unlockedSlots',
    PURCHASED_UPGRADES_KEY: 'eliteKitty_purchasedUpgrades',

    // ---- Core Wallet ----
    getWallet: function() {
        try {
            var data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { credits: 0, totalEarned: 0, totalSpent: 0 };
        } catch (e) {
            return { credits: 0, totalEarned: 0, totalSpent: 0 };
        }
    },

    saveWallet: function(wallet) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallet));
    },

    getCredits: function() {
        return this.getWallet().credits;
    },

    addCredits: function(amount, reason) {
        var wallet = this.getWallet();
        wallet.credits += amount;
        wallet.totalEarned += amount;
        this.saveWallet(wallet);
        this.logTransaction('earn', amount, reason || 'Unknown');
        this.updateHUDCredits();
        return wallet.credits;
    },

    spendCredits: function(amount, reason) {
        var wallet = this.getWallet();
        if (wallet.credits < amount) return false;
        wallet.credits -= amount;
        wallet.totalSpent += amount;
        this.saveWallet(wallet);
        this.logTransaction('spend', amount, reason || 'Unknown');
        this.updateHUDCredits();
        return true;
    },

    canAfford: function(amount) {
        return this.getWallet().credits >= amount;
    },

    // ---- Transaction Log ----
    logTransaction: function(type, amount, reason) {
        try {
            var key = 'eliteKitty_transactions';
            var data = localStorage.getItem(key);
            var log = data ? JSON.parse(data) : [];
            log.push({
                type: type,
                amount: amount,
                reason: reason,
                timestamp: Date.now()
            });
            // Keep last 100 transactions
            if (log.length > 100) log = log.slice(-100);
            localStorage.setItem(key, JSON.stringify(log));
        } catch (e) { /* ignore */ }
    },

    // ---- Daily Login Bonus ----
    checkDailyLogin: function() {
        try {
            var data = localStorage.getItem(this.DAILY_KEY);
            var lastLogin = data ? JSON.parse(data) : { date: null };
            var today = new Date().toISOString().split('T')[0];
            if (lastLogin.date !== today) {
                lastLogin.date = today;
                localStorage.setItem(this.DAILY_KEY, JSON.stringify(lastLogin));
                return true; // First login today
            }
            return false; // Already logged in today
        } catch (e) {
            return true;
        }
    },

    grantDailyBonus: function() {
        if (this.checkDailyLogin()) {
            var amount = 50;
            this.addCredits(amount, 'Daily Login Bonus');
            showCreditPopup(amount, 'Daily Login Bonus!');
            return true;
        }
        return false;
    },

    // ---- Save Slot Unlocks ----
    getUnlockedSlots: function() {
        try {
            var data = localStorage.getItem(this.UNLOCKED_SLOTS_KEY);
            return data ? JSON.parse(data) : [true, true, true, true]; // Auto + 3 default
        } catch (e) {
            return [true, true, true, true];
        }
    },

    unlockSaveSlot: function(slotIndex) {
        var slots = this.getUnlockedSlots();
        if (slots[slotIndex]) return false; // Already unlocked
        var cost = 500;
        if (!this.spendCredits(cost, 'Unlock Save Slot ' + slotIndex)) return false;
        slots[slotIndex] = true;
        localStorage.setItem(this.UNLOCKED_SLOTS_KEY, JSON.stringify(slots));
        return true;
    },

    // ---- Weapon Upgrades ----
    getUpgrades: function() {
        try {
            var data = localStorage.getItem(this.PURCHASED_UPGRADES_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    purchaseUpgrade: function(upgradeId) {
        var upgrades = this.getUpgrades();
        if (upgrades[upgradeId]) return false; // Already purchased
        var item = StoreItems.upgrades[upgradeId];
        if (!item) return false;
        if (!this.spendCredits(item.cost, 'Upgrade: ' + item.name)) return false;
        upgrades[upgradeId] = true;
        localStorage.setItem(this.PURCHASED_UPGRADES_KEY, JSON.stringify(upgrades));
        return true;
    },

    hasUpgrade: function(upgradeId) {
        return !!this.getUpgrades()[upgradeId];
    },

    // ---- Credit Earning Events ----
    earnOnKill: function(isStealth) {
        var amount = 25;
        var reason = 'Enemy Kill';
        if (isStealth) {
            amount = 50;
            reason = 'Stealth Kill';
        }
        this.addCredits(amount, reason);
        showCreditPopup(amount, reason);
    },

    earnOnCombo: function(comboLevel) {
        var amount = comboLevel * 10;
        this.addCredits(amount, 'Combo x' + comboLevel);
        if (comboLevel >= 3) {
            showCreditPopup(amount, 'Combo x' + comboLevel + '!');
        }
    },

    earnOnLevelComplete: function(stars) {
        var amount = 500;
        this.addCredits(amount, 'Level Complete');
        showCreditPopup(amount, 'Level Complete!');

        if (stars >= 3) {
            var bonus = 300;
            this.addCredits(bonus, '3-Star Bonus');
            showCreditPopup(bonus, '⭐⭐⭐ 3-Star Bonus!');
        }
    },

    earnOnBossKill: function() {
        var amount = 200;
        this.addCredits(amount, 'Boss Defeated');
        showCreditPopup(amount, 'Boss Defeated!');
    },

    earnOnCoin: function() {
        var amount = 5;
        this.addCredits(amount, 'Coin Pickups');
    },

    // ---- HUD Update ----
    updateHUDCredits: function() {
        var el = document.getElementById('hud-credits');
        if (el) {
            el.textContent = '🪙 ' + this.getCredits();
        }
    }
};

// ---- Store Items Data ----
var StoreItems = {
    skins: {
        'skin_gold':   { name: 'Golden Warrior', cost: 1000, skinId: 'gold', type: 'skin' },
        'skin_ninja':  { name: 'Shadow Ninja',   cost: 2500, skinId: 'ninja', type: 'skin' },
        'skin_neon':   { name: 'Neon Cyber',     cost: 1500, skinId: 'neon', type: 'skin' },
        'skin_red':    { name: 'Blood Commander', cost: 3000, skinId: 'red', type: 'skin' },
        'skin_white':  { name: 'Arctic Ops',     cost: 4000, skinId: 'white', type: 'skin' },
        'skin_max':    { name: 'Shadow Lord',    cost: 5000, skinId: 'max', type: 'skin' }
    },
    upgrades: {
        'upgrade_damage':  { name: 'Damage Boost I',  cost: 500,  stat: 'damageBonus', value: 0.25, type: 'upgrade' },
        'upgrade_health':  { name: 'Health Boost I',  cost: 750,  stat: 'healthBonus', value: 25, type: 'upgrade' },
        'upgrade_speed':   { name: 'Speed Boost I',   cost: 600,  stat: 'speedBonus', value: 50, type: 'upgrade' },
        'upgrade_ammo':    { name: 'Ammo扩容 I',     cost: 1000, stat: 'ammoBonus', value: 1.5, type: 'upgrade' },
        'upgrade_crit':    { name: 'Critical Strike', cost: 2000, stat: 'critChance', value: 0.15, type: 'upgrade' },
        'upgrade_revive':  { name: 'Auto-Revive',     cost: 1500, stat: 'autoRevive', value: 1, type: 'upgrade' }
    },
    items: {
        'extra_life':    { name: 'Extra Life',      cost: 200, type: 'consumable', effect: 'life' },
        'ammo_pack':     { name: 'Ammo Pack',       cost: 150, type: 'consumable', effect: 'ammo' },
        'shield_pack':   { name: 'Shield Pack',     cost: 300, type: 'consumable', effect: 'shield' },
        'save_slot':     { name: 'Save Slot Unlock', cost: 500, type: 'unlock', effect: 'saveSlot' }
    }
};

// ---- Additional Skin Definitions (merged with SkinData in levels.js) ----
var ExtraSkinData = {
    red:   { name: 'Blood Commander', primaryColor: 0xcc0000, premium: true, cost: 3000 },
    white: { name: 'Arctic Ops',      primaryColor: 0xcccccc, premium: true, cost: 4000 },
    max:   { name: 'Shadow Lord',     primaryColor: 0x4400aa, premium: true, cost: 5000 }
};

// ---- Credit Popup UI ----
function showCreditPopup(amount, message) {
    var popup = document.getElementById('credit-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'credit-popup';
        popup.className = 'credit-popup';
        document.body.appendChild(popup);
    }
    popup.innerHTML = '<span class="credit-popup-amount">+' + amount + ' 🪙</span>' +
        '<span class="credit-popup-msg">' + (message || '') + '</span>';
    popup.classList.remove('credit-popup-hide');
    popup.classList.add('credit-popup-show');

    // Clear previous timer
    if (popup._hideTimer) clearTimeout(popup._hideTimer);
    popup._hideTimer = setTimeout(function() {
        popup.classList.remove('credit-popup-show');
        popup.classList.add('credit-popup-hide');
    }, 2000);
}

// ---- Store Menu ----
function openStore(section) {
    section = section || 'skins';
    var storeScreen = document.getElementById('store-screen');
    if (!storeScreen) return;

    // Build store content
    var content = document.getElementById('store-content');
    if (!content) return;

    var credits = CreditWallet.getCredits();
    var html = '<div class="store-credits">🪙 ' + credits + ' Credits</div>';

    // Tab buttons
    html += '<div class="store-tabs">';
    html += '<button class="store-tab' + (section === 'skins' ? ' active' : '') + '" onclick="openStore(\'skins\')">🎨 Skins</button>';
    html += '<button class="store-tab' + (section === 'upgrades' ? ' active' : '') + '" onclick="openStore(\'upgrades\')">⚔ Upgrades</button>';
    html += '<button class="store-tab' + (section === 'items' ? ' active' : '') + '" onclick="openStore(\'items\')">🎁 Items</button>';
    html += '</div>';

    html += '<div class="store-items">';

    if (section === 'skins') {
        var skinKeys = Object.keys(StoreItems.skins);
        for (var i = 0; i < skinKeys.length; i++) {
            var id = skinKeys[i];
            var item = StoreItems.skins[id];
            var settings = SaveManager.getSettings();
            var owned = settings.unlockedSkins && settings.unlockedSkins.indexOf(item.skinId) >= 0;
            var canBuy = !owned && CreditWallet.canAfford(item.cost);
            html += '<div class="store-item' + (owned ? ' owned' : '') + '">';
            html += '<div class="store-item-name">' + item.name + '</div>';
            html += '<div class="store-item-cost">🪙 ' + item.cost + '</div>';
            if (owned) {
                html += '<div class="store-item-status owned">OWNED</div>';
            } else {
                html += '<button class="store-buy-btn' + (!canBuy ? ' disabled' : '') + '" ' +
                    (canBuy ? 'onclick="buyStoreItem(\'' + id + '\', \'' + section + '\')"' : 'disabled') +
                    '>BUY</button>';
            }
            html += '</div>';
        }
    } else if (section === 'upgrades') {
        var upgradeKeys = Object.keys(StoreItems.upgrades);
        for (var j = 0; j < upgradeKeys.length; j++) {
            var uid = upgradeKeys[j];
            var uitem = StoreItems.upgrades[uid];
            var hasUpgrade = CreditWallet.hasUpgrade(uid);
            var canBuyU = !hasUpgrade && CreditWallet.canAfford(uitem.cost);
            html += '<div class="store-item' + (hasUpgrade ? ' owned' : '') + '">';
            html += '<div class="store-item-name">' + uitem.name + '</div>';
            html += '<div class="store-item-cost">🪙 ' + uitem.cost + '</div>';
            if (hasUpgrade) {
                html += '<div class="store-item-status owned">OWNED</div>';
            } else {
                html += '<button class="store-buy-btn' + (!canBuyU ? ' disabled' : '') + '" ' +
                    (canBuyU ? 'onclick="buyStoreItem(\'' + uid + '\', \'' + section + '\')"' : 'disabled') +
                    '>BUY</button>';
            }
            html += '</div>';
        }
    } else if (section === 'items') {
        var itemKeys = Object.keys(StoreItems.items);
        for (var k = 0; k < itemKeys.length; k++) {
            var iid = itemKeys[k];
            var citem = StoreItems.items[iid];
            var canBuyI = CreditWallet.canAfford(citem.cost);
            html += '<div class="store-item">';
            html += '<div class="store-item-name">' + citem.name + '</div>';
            html += '<div class="store-item-cost">🪙 ' + citem.cost + '</div>';
            html += '<button class="store-buy-btn' + (!canBuyI ? ' disabled' : '') + '" ' +
                (canBuyI ? 'onclick="buyStoreItem(\'' + iid + '\', \'' + section + '\')"' : 'disabled') +
                '>BUY</button>';
            html += '</div>';
        }
    }

    html += '</div>';
    content.innerHTML = html;
    showOverlay('store-screen');
}

function buyStoreItem(itemId, section) {
    // Find the item
    var item = StoreItems.skins[itemId] || StoreItems.upgrades[itemId] || StoreItems.items[itemId];
    if (!item) return;

    if (!CreditWallet.canAfford(item.cost)) {
        alert('Not enough credits! Need 🪙 ' + item.cost);
        return;
    }

    if (item.type === 'skin') {
        if (!confirm('Buy ' + item.name + ' for 🪙 ' + item.cost + '?')) return;
        CreditWallet.spendCredits(item.cost, 'Skin: ' + item.name);
        // Also add to unlocked skins via SaveManager
        var settings = SaveManager.getSettings();
        if (settings.unlockedSkins.indexOf(item.skinId) < 0) {
            settings.unlockedSkins.push(item.skinId);
            SaveManager.saveSettings(settings);
        }
        showCreditPopup(-item.cost, 'Purchased: ' + item.name);
    } else if (item.type === 'upgrade') {
        if (!confirm('Buy ' + item.name + ' for 🪙 ' + item.cost + '?')) return;
        CreditWallet.purchaseUpgrade(itemId);
        showCreditPopup(-item.cost, 'Upgrade: ' + item.name);
    } else if (item.type === 'consumable') {
        if (!confirm('Buy ' + item.name + ' for 🪙 ' + item.cost + '?')) return;
        CreditWallet.spendCredits(item.cost, 'Item: ' + item.name);
        // Apply effect immediately
        if (item.effect === 'life') {
            GameState.lives++;
        } else if (item.effect === 'ammo') {
            GameState.ammo.shotgun = Math.min(GameState.ammo.shotgun + 20, GameState.maxAmmo.shotgun);
            GameState.ammo.rifle = Math.min(GameState.ammo.rifle + 15, GameState.maxAmmo.rifle);
        } else if (item.effect === 'shield') {
            GameState.shieldHits = 5;
        }
        showCreditPopup(-item.cost, 'Used: ' + item.name);
    } else if (item.type === 'unlock') {
        if (!confirm('Unlock extra save slot for 🪙 ' + item.cost + '?')) return;
        // Find first locked slot
        var slots = CreditWallet.getUnlockedSlots();
        var foundSlot = -1;
        for (var s = 1; s < slots.length; s++) {
            if (!slots[s]) { foundSlot = s; break; }
        }
        if (foundSlot < 0) {
            alert('All save slots already unlocked!');
            return;
        }
        CreditWallet.spendCredits(item.cost, 'Save Slot Unlock');
        slots[foundSlot] = true;
        localStorage.setItem(CreditWallet.UNLOCKED_SLOTS_KEY, JSON.stringify(slots));
        showCreditPopup(-item.cost, 'Save Slot Unlocked!');
    }

    // Refresh store display
    openStore(section);
}

// ---- Apply Permanent Upgrades ----
function applyPermanentUpgrades() {
    var upgrades = CreditWallet.getUpgrades();
    if (upgrades['upgrade_damage']) {
        GameState.damageBonus = (GameState.damageBonus || 0) + 0.25;
    }
    if (upgrades['upgrade_health']) {
        GameState.maxHealth = (GameState.maxHealth || 100) + 25;
    }
    if (upgrades['upgrade_speed']) {
        GameState.speedUpgradeBonus = (GameState.speedUpgradeBonus || 0) + 50;
    }
    if (upgrades['upgrade_ammo']) {
        GameState.ammoMultiplier = (GameState.ammoMultiplier || 1) + 0.5;
    }
    if (upgrades['upgrade_crit']) {
        GameState.critChance = (GameState.critChance || 0) + 0.15;
    }
    if (upgrades['upgrade_revive']) {
        GameState.hasAutoRevive = true;
    }
}

// ---- Check for Auto-Revive on Death ----
function checkAutoRevive() {
    if (GameState.hasAutoRevive && !GameState.autoReviveUsed) {
        GameState.autoReviveUsed = true;
        GameState.health = GameState.maxHealth;
        GameState.lives++;
        showFloatingText(400, 300, 'AUTO-REVIVE!', '#00ff88', 28, 2000);
        return true;
    }
    return false;
}
