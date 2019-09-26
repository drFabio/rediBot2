function DisplayManager(containerSelector, templatesSelector) {
  let container;
  let templateContainer;
  let svg;
  let rectTemplate;
  let boxSize;
  let botDimensions;
  let rediBot;
  let flameTemplate;
  let flameDimensions;
  let initialSvg;
  init();
  let currentPosition = 0;
  function setupBoxes() {
    const numOfBoxes = 4;
    const y = parseInt(rectTemplate.getAttribute("y"), 10);
    for (let i = 0; i < numOfBoxes; i++) {
      const newRect = rectTemplate.cloneNode(true);
      newRect.setAttribute("y", boxSize * i + y);
      newRect.setAttribute("data-index", i);
      svg.appendChild(newRect);
    }
  }

  function setBot() {
    rediBot = templateContainer
      .querySelector('[data-context="rediBot"]')
      .cloneNode(true);
    rediBot.style.visibility = "hidden";
    svg.appendChild(rediBot);
    botDimensions = rediBot.getBBox();
    positionBot();
    rediBot.style.visibility = "visible";
  }
  function initFlame() {
    flameTemplate = templateContainer
      .querySelector('[data-context="flame"]')
      .cloneNode(true);
    flameTemplate.style.visibility = "hidden";
    svg.appendChild(flameTemplate);
    flameDimensions = flameTemplate.getBBox();
    svg.removeChild(flameTemplate);
    flameTemplate.style.visibility = "visible";
  }
  function positionBot(position) {
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
    svg.appendChild(flame);
  }
  function init() {
    container = document.querySelector(containerSelector);
    templateContainer = document.querySelector(templatesSelector);
    svg = container.querySelector("svg");
    initialSvg = container.cloneNode(true);
    rectTemplate = templateContainer.querySelector("rect");
    boxSize = parseInt(rectTemplate.getAttribute("width"), 10);
    setupBoxes();
    setBot();
    initFlame();
    addFlame(1);
  }
  this.moveBot = newPosition => {
    positionBot(newPosition);
  };
}
