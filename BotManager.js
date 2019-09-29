/**
 * Class that handles the "business logic"  of the bot and levels
 * @param {*} workspace
 */
function BotManager(workspace) {
  const stepTimer = 200;
  let currentCode = "";
  let outputContainer = null;
  let displayManager = null;
  let runButton = null;
  let currentLevelIndex = 0;
  const MAX_TILES = 20;
  const MIN_TILES = 3;
  const MAX_FIRES = 2;
  const initialWaterSupply = MAX_FIRES;
  function randomInRange(max, min) {
    return Math.random() * (max - min) + min;
  }
  function getRunData() {
    const currentRunData = {};
    const currentLevel = levelInfo[currentLevelIndex];
    if (currentLevel.dynamicTiles) {
      currentRunData.numberOfTiles = randomInRange(MAX_TILES, MIN_TILES);
    } else {
      currentRunData.numberOfTiles = currentLevel.numberOfTiles;
    }
    if (currentLevel.dynamicFires) {
      const fireMap = {};
      currentRunData.fires = [];

      for (let i = 0; i < MAX_FIRES; i++) {
        let newPosition = randomInRange(currentRunData.numberOfTiles, 0);
        while (fireMap[newPosition] === true) {
          newPosition = randomInRange(currentRunData.numberOfTiles, 0);
        }
        fireMap[newPosition] = true;
        currentRunData.fires.push(newPosition);
      }
    } else {
      currentRunData.fires = (currentLevel.fires || []).map(
        ({ position }) => position - 1
      );
    }
    currentRunData.fires.sort();
    currentRunData.currentPosition = 0;
    currentRunData.waterSupply = initialWaterSupply;
    return currentRunData;
  }
  function onStartIntepreting(currentRunData) {
    runButton.disabled = true;
    displayManager.runLevel(currentRunData);
  }
  function onStopIntepreting(finalRunData) {
    console.log({ finalRunData });
    runButton.disabled = false;
  }
  function onLevelSelected(newLevelIndex) {
    currentLevelIndex = newLevelIndex;
  }
  function runCode() {
    const runData = getRunData();
    onStartIntepreting(runData);
    let { waterSupply, fires, currentPosition, numberOfTiles } = runData;
    let tileOnFire = fires[0] === currentPosition;
    if (tileOnFire) {
      fires.shift();
    }
    let tileAhead = currentPosition + 1 < numberOfTiles;

    function initIntepreter(interpreter, scope) {
      function moveForward() {
        currentPosition++;
        console.log("moveForward", { tileAhead }, this);

        tileAhead = currentPosition + 1 < numberOfTiles;
        tileOnFire = fires[0] === currentPosition;
        if (tileOnFire) {
          fires.shift();
        }
        displayManager.moveBot(currentPosition);
        console.log({ currentPosition, waterSupply });
        // if we don't pass this to the intepreter back the value will not be evaluated
        interpreter.setProperty(scope, "tileAhead", tileAhead);
        interpreter.setProperty(scope, "tileOnFire", tileOnFire);
      }
      function extinguishFire() {
        if (waterSupply <= 0) {
          return;
        }
        waterSupply--;
        console.log("extinguishFire");
        interpreter.setProperty(scope, "waterSupply", waterSupply);
        interpreter.setProperty(scope, "tileOnFire", false);
        console.log({ currentPosition, waterSupply });
      }
      function highlightBlock(id) {
        workspace.highlightBlock(id);
      }
      interpreter.setProperty(scope, "waterSupply", waterSupply);
      interpreter.setProperty(scope, "tileAhead", tileAhead);
      interpreter.setProperty(scope, "tileOnFire", tileOnFire);

      interpreter.setProperty(
        scope,
        "moveForward",
        interpreter.createNativeFunction(moveForward)
      );
      interpreter.setProperty(
        scope,
        "extinguishFire",
        interpreter.createNativeFunction(extinguishFire)
      );
      interpreter.setProperty(
        scope,
        "highlightBlock",
        interpreter.createNativeFunction(highlightBlock)
      );
      console.log({ tileAhead });
    }

    const jsInterpreter = new Interpreter(currentCode, initIntepreter);
    let stepCount = -1;
    const nextStep = () => {
      stepCount++;
      const lastOne = jsInterpreter.step() === false;
      if (lastOne) {
        onStopIntepreting({
          waterSupply,
          fires,
          currentPosition,
          numberOfTiles
        });
        return;
      }
      if (stepCount % 2 === 0) {
        nextStep();
        return;
      }
      window.setTimeout(nextStep, stepTimer);
    };
    nextStep();
  }
  function onWorspaceUpdate(event) {
    console.log(event);
    if (!event.recordUndo) {
      return false;
    }
    if (event.type !== "move" && event.type !== "delete") {
      return false;
    }
    try {
      currentCode = Blockly.JavaScript.workspaceToCode(workspace);
      outputContainer.value = currentCode;
    } catch (e) {
      console.error(e);
      console.error(
        "HEY LISTEN!!! We couldn't convert your code, we are ignoring it but if that was unintentional you should check it out "
      );
      console.log("the data was ", event);
    }
  }
  function init() {
    displayManager = new DisplayManager({
      levelIndex: currentLevelIndex,
      onLevelSelected
    });
    runButton = document.querySelector("#runButton");
    outputContainer = document.getElementById("output");
    workspace.addChangeListener(onWorspaceUpdate);
    runButton.addEventListener("click", runCode);
  }
  init();
}
