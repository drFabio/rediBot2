function StorageManager() {
  const LEVEL_KEY = "levelData";
  const PASSED_KEY = "passedData";
  const CURRENT_LEVEL_KEY = "currentLevel";

  this.saveLevelCode = (level, code) => {
    const savedLevelData = localStorage.getItem(LEVEL_KEY);
    let levelData = {};
    if (savedLevelData) {
      levelData = JSON.parse(savedLevelData);
    }
    levelData[level] = code;
    localStorage.setItem(LEVEL_KEY, JSON.stringify(levelData));
  };
  this.getLevelCode = level => {
    let levelData = {};
    const savedLevelData = localStorage.getItem(LEVEL_KEY);
    if (savedLevelData) {
      levelData = JSON.parse(savedLevelData);
    }
    return levelData[level] || null;
  };
  this.setCurrentLevel = level => {
    localStorage.setItem(CURRENT_LEVEL_KEY, level);
  };
  this.getCurrentLevel = () => {
    return localStorage.getItem(CURRENT_LEVEL_KEY) || 0;
  };
  this.setPassedLevel = level => {
    const savedPassedData = localStorage.getItem(PASSED_KEY);
    let passedData = {};
    if (savedPassedData) {
      passedData = JSON.parse(savedPassedData);
    }
    passedData[level] = true;
    localStorage.setItem(PASSED_KEY, JSON.stringify(passedData));
  };
  this.unsetPassedLevel = level => {
    const savedPassedData = localStorage.getItem(PASSED_KEY);
    let passedData = {};
    if (savedPassedData) {
      passedData = JSON.parse(savedPassedData);
    }
    delete passedData[level];
    localStorage.setItem(PASSED_KEY, JSON.stringify(passedData));
  };
  this.getPassedLevels = () => {
    const savedPassedData = localStorage.getItem(PASSED_KEY);
    if (!savedPassedData) {
      return {};
    }
    return JSON.parse(savedPassedData);
  };
}
