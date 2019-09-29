/**
 * Class that handles visual initialization
 * @param {*} param0
 */
function DisplayManager({
  containerSelector = "#visualContainer",
  templatesSelector = ".svgTemplates",
  levelSelector = "#levelSelector",
  onLevelSelected = null,
  levelIndex = 0
}) {
  let container;
  let templateContainer;
  let display;
  let rectTemplate;
  let boxSize;
  let botDimensions;
  let rediBot;
  let flameTemplate;
  let flameDimensions;
  let levelMenuContainer;
  let currentLevel = levelInfo[levelIndex];
  let rulesContainer;
  let initialDisplay;
  init();
  function setupBoxes(numOfBoxes) {
    const y = parseInt(rectTemplate.getAttribute("y"), 10);
    for (let i = 0; i < numOfBoxes; i++) {
      const newRect = rectTemplate.cloneNode(true);
      newRect.setAttribute("y", boxSize * i + y);
      newRect.setAttribute("data-index", i);
      display.appendChild(newRect);
    }
  }
  function showGameDisplay() {
    rulesContainer.style.display = "none";
    display.style.display = "block";
  }
  function showGameRules() {
    rulesContainer.style.display = "block";
    display.style.display = "none";
  }
  function setBot() {
    rediBot = templateContainer
      .querySelector('[data-context="rediBot"]')
      .cloneNode(true);
    rediBot.style.visibility = "hidden";
    display.appendChild(rediBot);
    botDimensions = rediBot.getBBox();
    positionBot();
    rediBot.style.visibility = "visible";
  }
  function initFlame(fires) {
    flameTemplate = templateContainer
      .querySelector('[data-context="flame"]')
      .cloneNode(true);
    flameTemplate.style.visibility = "hidden";
    display.appendChild(flameTemplate);
    flameDimensions = flameTemplate.getBBox();
    display.removeChild(flameTemplate);
    flameTemplate.style.visibility = "visible";
    fires.forEach(({ position }) => {
      addFlame(position - 1);
    });
  }
  function positionBot(zeroIndexedPosition = 0) {
    rediBot.setAttribute("x", (boxSize - botDimensions.width) / 2);
    rediBot.setAttribute(
      "y",
      zeroIndexedPosition * boxSize + (boxSize - botDimensions.height) / 2
    );
  }
  function addFlame(position) {
    const flame = flameTemplate.cloneNode(true);
    const x = boxSize - flameDimensions.width;
    const y = position * boxSize + boxSize - flameDimensions.height;
    flame.setAttribute("x", x);
    flame.setAttribute("y", y);
    display.appendChild(flame);
  }
  function setupLevel(runData) {
    setupBoxes(runData.numberOfTiles);
    setBot();
    initFlame(runData.fires || []);
  }
  function onLevelSelect(index) {
    const target = levelMenuContainer.querySelector(`[data-index="${index}"]`);
    levelMenuContainer.querySelectorAll(".current").forEach(el => {
      el.classList.remove("current");
    });
    target.classList.add("current");
    currentLevel = levelInfo[index];
    document.title = `Redibot Level ${index + 1} `;
    onLevelSelected(index);
    setupDescription();
    showGameRules();
  }
  function setupLevelMenu() {
    const numLevels = levelInfo.length;
    for (let i = 0; i < numLevels; i++) {
      const li = document.createElement("li");
      li.classList.add("levelItem");
      li.setAttribute("data-index", i);
      li.addEventListener("click", e => onLevelSelect(i));
      li.innerHTML = i + 1;
      levelMenuContainer.appendChild(li);
    }
    onLevelSelect(levelIndex);
  }
  function setupDescription() {
    document.querySelector("#levelDescription").innerHTML =
      currentLevel.description;
  }
  function init() {
    container = document.querySelector(containerSelector);
    rulesContainer = document.querySelector("#rulesContainer");
    templateContainer = document.querySelector(templatesSelector);
    display = container.querySelector(".botDisplay");
    levelMenuContainer = document.querySelector(levelSelector);
    initialDisplay = display.cloneNode(true);
    rectTemplate = templateContainer.querySelector("rect");
    boxSize = parseInt(rectTemplate.getAttribute("width"), 10);
    setupLevelMenu();
  }
  this.moveBot = newPosition => {
    positionBot(newPosition);
  };
  this.runLevel = currentRunData => {
    const oldDisplay = display;
    display = initialDisplay.cloneNode(true);
    oldDisplay.parentNode.replaceChild(display, oldDisplay);
    showGameDisplay();
    setupLevel(currentRunData);
  };
}
