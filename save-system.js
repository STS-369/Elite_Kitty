// ============================================================
// save-system.js - Save/Load & High Score Management
// ============================================================

var SaveManager = {
    SAVE_KEY: 'eliteKitty_saves',
    HIGHSCORE_KEY: 'eliteKitty_highscores',
    SETTINGS_KEY: 'eliteKitty_settings',
    MAX_SLOTS: 3,

    getSaves: function() {
        try {
            var data = localStorage.getItem(this.SAVE_KEY);
            return data ? JSON.parse(data) : [null, null, null, null];
        } catch (e) { return [null, null, null, null]; }
    },

    saveGame: function(slot, stateData) {
        var saves = this.getSaves();
        saves[slot] = Object.assign({}, stateData, {
            timestamp: Date.now(),
            version: '2.0'
        });
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
        return true;
    },

    loadGame: function(slot) {
        var saves = this.getSaves();
        return saves[slot];
    },

    deleteSave: function(slot) {
        var saves = this.getSaves();
        saves[slot] = null;
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
    },

    autoSave: function(stateData) {
        this.saveGame(0, Object.assign({}, stateData, { autoSave: true }));
    },

    getHighScores: function() {
        try {
            var data = localStorage.getItem(this.HIGHSCORE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    addHighScore: function(score, level, kills, stealthKills, maxCombo) {
        var scores = this.getHighScores();
        scores.push({
            score: score, level: level, kills: kills,
            stealthKills: stealthKills, maxCombo: maxCombo,
            date: new Date().toISOString().split('T')[0]
        });
        scores.sort(function(a, b) { return b.score - a.score; });
        var top10 = scores.slice(0, 10);
        localStorage.setItem(this.HIGHSCORE_KEY, JSON.stringify(top10));
        return top10;
    },

    isHighScore: function(score) {
        var scores = this.getHighScores();
        if (scores.length < 10) return score > 0;
        return score > scores[scores.length - 1].score;
    },

    getSettings: function() {
        try {
            var data = localStorage.getItem(this.SETTINGS_KEY);
            return data ? JSON.parse(data) : {
                unlockedSkins: ['default', 'blue'],
                currentSkin: 'default',
                totalStars: 0, coins: 0, credits: 0,
                levelStars: {}, highScore: 0
            };
        } catch (e) {
            return {
                unlockedSkins: ['default', 'blue'],
                currentSkin: 'default',
                totalStars: 0, coins: 0, credits: 0,
                levelStars: {}, highScore: 0
            };
        }
    },

    saveSettings: function(data) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data));
    },

    updateLevelStars: function(level, stars) {
        var settings = this.getSettings();
        var prev = settings.levelStars[level] || 0;
        if (stars > prev) {
            settings.levelStars[level] = stars;
            settings.totalStars = (settings.totalStars || 0) + (stars - prev);
        }
        this.saveSettings(settings);
        return settings;
    },

    addCoins: function(amount) {
        var settings = this.getSettings();
        settings.coins = (settings.coins || 0) + amount;
        this.saveSettings(settings);
        return settings;
    },

    unlockSkin: function(skinId) {
        var settings = this.getSettings();
        var skin = SkinData[skinId];
        if (!skin || settings.unlockedSkins.indexOf(skinId) >= 0) return false;
        if ((settings.coins || 0) < (skin.cost || 0)) return false;
        settings.coins -= skin.cost;
        settings.unlockedSkins.push(skinId);
        this.saveSettings(settings);
        return true;
    },

    calculateStars: function(level, score) {
        var t = LevelData[level].starThresholds;
        if (score >= t.score3) return 3;
        if (score >= t.score2) return 2;
        if (score >= t.score1) return 1;
        return 0;
    },

    formatSlotDisplay: function(slot) {
        var saves = this.getSaves();
        var save = saves[slot];
        if (!save) return { text: 'Empty', empty: true };
        var date = new Date(save.timestamp);
        return {
            text: 'Lv' + save.currentLevel + ' - ' + save.score + 'pts (' + date.toLocaleDateString() + ')',
            empty: false, data: save
        };
    }
};
