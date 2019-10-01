const XML_NS = "http://www.w3.org/2000/svg";
/**
 * Class that handles visual initialization
 * @param {*} param0
 */
function DisplayManager({
  containerSelector = "#visualContainer",
  templatesSelector = ".svgTemplates",
  levelSelector = "#levelSelector",
  stopButtonSelector = "#stopButton",
  onLevelSelected = null,
  onStop,
  levelIndex = 0
}) {
  const COLOR_RED = "#f15922";
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
  let tilesGroup;
  let stopButton;
  let yStartPoint;
  let waterSupplyValueContainer;
  let tileAheadValueContainer;
  let tileOnFireValueContainer;
  let hudContainer;
  init();
  function setupBoxes(numOfBoxes) {
    tilesGroup = document.createElementNS(XML_NS, "g");
    tilesGroup.setAttribute("data-context", "tilesGroup");
    display.appendChild(tilesGroup);
    yStartPoint = parseInt(rectTemplate.getAttribute("y"), 10);
    for (let i = 0; i < numOfBoxes; i++) {
      const newRect = rectTemplate.cloneNode(true);
      newRect.setAttribute("y", boxSize * i + yStartPoint);
      const rectTextGroup = document.createElementNS(XML_NS, "g");
      rectTextGroup.setAttribute("data-index", i);
      rectTextGroup.setAttribute("data-context", "rectTextGroup");
      rectTextGroup.appendChild(newRect);
      const text = document.createElementNS(XML_NS, "text");
      text.setAttribute("fill", COLOR_RED);
      text.innerHTML = i + 1;
      text.setAttribute("font-size", 40);
      text.setAttribute("x", 10);
      text.setAttribute("y", boxSize * i + yStartPoint + boxSize - 10);
      rectTextGroup.appendChild(text);
      tilesGroup.appendChild(rectTextGroup);
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
  function initFlameTemplate() {
    flameTemplate = templateContainer
      .querySelector('[data-context="flame"]')
      .cloneNode(true);
    flameTemplate.style.visibility = "hidden";
    display.appendChild(flameTemplate);
    flameDimensions = flameTemplate.getBBox();
    display.removeChild(flameTemplate);
    flameTemplate.style.visibility = "visible";
  }
  function positionBot(zeroIndexedPosition = 0) {
    rediBot.setAttribute("x", (boxSize - botDimensions.width) / 2);
    rediBot.setAttribute(
      "y",
      yStartPoint +
        zeroIndexedPosition * boxSize +
        (boxSize - botDimensions.height) / 2
    );
  }
  this.extinguishFlame = position => {
    const flame = display.querySelector(
      `[data-context="flame"][data-position="${position}"]`
    );
    flame.classList.add("out");
    // flame.parentNode.removeChild(flame);
  };
  function addFlame(position) {
    const flame = flameTemplate.cloneNode(true);
    const x = boxSize - flameDimensions.width;
    const y =
      yStartPoint + position * boxSize + boxSize - flameDimensions.height;
    flame.setAttribute("x", x);
    flame.setAttribute("y", y);
    flame.setAttribute("data-context", "flame");
    flame.setAttribute("data-position", position);
    display
      .querySelector(`[data-index="${position}"][data-context="rectTextGroup"]`)
      .appendChild(flame);
  }
  function setupLevel({ numberOfTiles = 4, fires = [] }) {
    setupBoxes(numberOfTiles);
    setBot();
    initFlameTemplate();
    fires.forEach(addFlame);
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
  function initLevelMenu() {
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
    stopButton = document.querySelector(stopButtonSelector);
    display = container.querySelector(".botDisplay");
    levelMenuContainer = document.querySelector(levelSelector);
    initialDisplay = display.cloneNode(true);
    rectTemplate = templateContainer.querySelector("rect");
    boxSize = parseInt(rectTemplate.getAttribute("width"), 10);
    stopButton.addEventListener("click", onStop);
    initLevelMenu();
    initFlameTemplate();
  }
  this.moveBot = newPosition => {
    const newY = newPosition * boxSize * -1;
    tilesGroup.setAttribute("transform", `translate(0, ${newY})`);
  };
  this.runLevel = currentRunData => {
    const oldDisplay = display;
    display = initialDisplay.cloneNode(true);
    oldDisplay.parentNode.replaceChild(display, oldDisplay);
    hudContainer = container.querySelector("#hud");
    waterSupplyValueContainer = hudContainer.querySelector(
      '[data-context="waterSupplyValue"]'
    );
    tileAheadValueContainer = hudContainer.querySelector(
      '[data-context="tileAheadValue"]'
    );
    tileOnFireValueContainer = hudContainer.querySelector(
      '[data-context="tileOnFireValue"]'
    );
    showGameDisplay();
    setupLevel(currentRunData);
  };
  this.setHud = ({ waterSupply, tileAhead, tileOnFire }) => {
    console.log(
      { tileAhead },
      tileAheadValueContainer,
      tileAheadValueContainer.childNodes[0]
    );
    waterSupplyValueContainer.innerHTML = waterSupply;
    tileAheadValueContainer.innerHTML = tileAhead ? "Yes" : "No";
    tileOnFireValueContainer.innerHTML = tileOnFire ? "Yes" : "No";
  };
}
