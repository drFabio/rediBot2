function DisplayManager({
  containerSelector,
  templatesSelector,
  levelSelector,
  levelIndex
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
  function setupBoxes() {
    const numOfBoxes = 4;
    const y = parseInt(rectTemplate.getAttribute("y"), 10);
    for (let i = 0; i < numOfBoxes; i++) {
      const newRect = rectTemplate.cloneNode(true);
      newRect.setAttribute("y", boxSize * i + y);
      newRect.setAttribute("data-index", i);
      display.appendChild(newRect);
    }
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
  function initFlame() {
    flameTemplate = templateContainer
      .querySelector('[data-context="flame"]')
      .cloneNode(true);
    flameTemplate.style.visibility = "hidden";
    display.appendChild(flameTemplate);
    flameDimensions = flameTemplate.getBBox();
    display.removeChild(flameTemplate);
    flameTemplate.style.visibility = "visible";
  }
  function positionBot(position = 0) {
    rediBot.setAttribute("x", (boxSize - botDimensions.width) / 2);
    rediBot.setAttribute(
      "y",
      position * boxSize + (boxSize - botDimensions.height) / 2
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
  function setupLevel() {
    setupBoxes();
    setBot();
    initFlame();
    addFlame(1);
  }
  function onLevelSelect({ target }, index) {
    levelMenuContainer.querySelectorAll(".current").forEach(el => {
      el.classList.remove("current");
    });
    target.classList.add("current");
    currentLevel = levelInfo[index];
    setupDescription();
  }
  function setupLevelMenu() {
    const numLevels = levelInfo.length;
    for (let i = 0; i < numLevels; i++) {
      const li = document.createElement("li");
      li.classList.add("levelItem");
      li.setAttribute("data-index", i);
      if (i === levelIndex) {
        li.classList.add("current");
      }
      li.addEventListener("click", e => onLevelSelect(e, i));
      li.innerHTML = i + 1;
      levelMenuContainer.appendChild(li);
    }
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
    setupDescription();
  }
  this.moveBot = newPosition => {
    positionBot(newPosition);
  };
  this.runLevel = () => {
    rulesContainer.style.display = "none";
    display.style.display = "block";
    setupLevel();
  };
}
