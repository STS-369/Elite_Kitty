const LevelData = {
    1: { name: "Urban Alley", bg: "#2c3e50", platform: "#7f8c8d", enemyCount: 5 },
    2: { name: "Sewer System", bg: "#1b2631", platform: "#1e8449", enemyCount: 8 },
    3: { name: "Warehouse", bg: "#212f3c", platform: "#d35400", enemyCount: 12 }
};

function getDifficultyScale(loop) {
    return 1 + (loop * 0.3);
}
