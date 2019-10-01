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
  const INITIAL_WATER_SUPPLY = MAX_FIRES;
  function ExtinguishWithoutWaterError() {
    this.message = "Tried to extinguish a flame without water";
  }
  ExtinguishWithoutWaterError.prototype = Error.prototype;
  ExtinguishWithoutWaterError.prototype.code = "NO_WATER";
  function ExtinguishNoFlameError() {
    this.message = "Tried to extinguish a place that did not have a flame";
  }
  ExtinguishNoFlameError.prototype = Error.prototype;
  ExtinguishNoFlameError.prototype.code = "NO_FLAME";
  function WalkedOutsideOfTheBoundariesError() {
    this.message = "You walked outside of the path";
  }
  WalkedOutsideOfTheBoundariesError.prototype = Error.prototype;
  WalkedOutsideOfTheBoundariesError.prototype.code = "OUTSIDE_OF_PATH";

  function randomInRange(max, min) {
    return Math.floor(Math.random() * (max - min) + min);
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
    currentRunData.waterSupply = INITIAL_WATER_SUPPLY;
    return currentRunData;
  }
  function onStartIntepreting(currentRunData) {
    runButton.disabled = true;
    displayManager.runLevel(currentRunData);
  }
  function onStopIntepreting({
    failed,
    firesPuttedOut,
    numberOfFires,
    currentPosition,
    numberOfTiles
  }) {
    runButton.disabled = false;
    if (
      !failed &&
      currentPosition === numberOfTiles - 1 &&
      firesPuttedOut === numberOfFires
    ) {
      alert("You passed this level");
    }
    alert("You did not passed this level");
  }
  function onLevelSelected(newLevelIndex) {
    currentLevelIndex = newLevelIndex;
  }
  function runCode() {
    const runData = getRunData();
    onStartIntepreting(runData);
    let { waterSupply, fires, currentPosition, numberOfTiles } = runData;
    const numberOfFires = fires.length;
    let firesPuttedOut = 0;
    let tileOnFire = fires[0] === currentPosition;
    if (tileOnFire) {
      fires.shift();
    }
    let tileAhead = currentPosition + 1 < numberOfTiles;
    let runTimeException = null;
    function initIntepreter(interpreter, scope) {
      function moveForward() {
        console.log(Object.keys(interpreter));
        currentPosition++;
        console.log("moveForward", { tileAhead }, this);
        if (!tileAhead) {
          runTimeException = new WalkedOutsideOfTheBoundariesError();
          return;
        }
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
          runTimeException = new ExtinguishWithoutWaterError();
          return;
        }
        if (!tileOnFire) {
          runTimeException = new ExtinguishNoFlameError();
          return;
        }
        waterSupply--;
        firesPuttedOut++;
        displayManager.extinguishFlame(currentPosition);
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
    }

    try {
      const jsInterpreter = new Interpreter(currentCode, initIntepreter);
      let stepCount = -1;
      const nextStep = () => {
        if (runTimeException) {
          alert(runTimeException.message);
          onStopIntepreting({ failed: true });
          return;
        }
        stepCount++;
        const lastOne = jsInterpreter.step() === false;
        if (lastOne) {
          onStopIntepreting({
            waterSupply,
            numberOfFires,
            firesPuttedOut,
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
    } catch (err) {
      alert(err.message);
    }
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
