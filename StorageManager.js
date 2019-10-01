function StorageManager() {
  this.saveLevelCode = (level, code) => {
    const savedLevelData = localStorage.getItem("levelData");
    let levelData = {};
    if (savedLevelData) {
      levelData = JSON.parse(savedLevelData);
    }
    levelData[level] = code;
    localStorage.setItem("levelData", JSON.stringify(levelData));
  };
  this.getLevelCode = level => {
    let levelData = {};
    const savedLevelData = localStorage.getItem("levelData");
    if (savedLevelData) {
      levelData = JSON.parse(savedLevelData);
    }
    return levelData[level] || null;
  };
}
