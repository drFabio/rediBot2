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
  const INITIAL_WATER_SUPPLY = 2;
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
  function getRunData(currentLevel) {
    const currentRunData = {};
    if (currentLevel.dynamicTiles) {
      currentRunData.numberOfTiles = randomInRange(MAX_TILES, MIN_TILES);
    } else {
      currentRunData.numberOfTiles = currentLevel.numberOfTiles;
    }
    if (currentLevel.dynamicFires) {
      const fireMap = {};
      currentRunData.fires = [];
      let maxFires = INITIAL_WATER_SUPPLY;
      if (currentLevel.unlimitedFires) {
        maxFires = randomInRange(
          INITIAL_WATER_SUPPLY,
          currentRunData.numberOfTiles
        );
      }
      for (let i = 0; i < maxFires; i++) {
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
  function onStopIntepreting(finalRunData, currentLevel) {
    const {
      fires,
      waterSupply,
      extinguishedFires,
      currentPosition,
      numberOfTiles,
      failed
    } = finalRunData;
    runButton.disabled = false;
    const errorMessage = "You did not passed this level";
    const successMessage = "You passed this level";
    let passed = false;
    let message = errorMessage;
    if (currentLevel.hasOwnProperty("checkSuccess")) {
      const levelPassData = currentLevel.checkSuccess(finalRunData);
      passed = levelPassData.passed;
      if (levelPassData.message) {
        message = levelPassData.message;
      } else if (passed) {
        message = successMessage;
      }
    } else if (
      !failed &&
      fires.length === extinguishedFires.length &&
      currentPosition === numberOfTiles - 1
    ) {
      passed = true;
      message = successMessage;
    }
    alert(message);
  }
  function onLevelSelected(newLevelIndex) {
    currentLevelIndex = newLevelIndex;
  }
  function runCode() {
    const currentLevel = levelInfo[currentLevelIndex];
    const runData = getRunData(currentLevel);
    onStartIntepreting(runData);
    let { waterSupply, fires, currentPosition, numberOfTiles } = runData;
    const extinguishedFires = [];
    const getTileOnFire = () => {
      return fires.findIndex(pos => pos === currentPosition) > -1;
    };
    let tileOnFire = getTileOnFire();
    let positionThatWaterRunOut = 0;
    let tileAhead = currentPosition + 1 < numberOfTiles;
    let runTimeException = null;
    function initIntepreter(interpreter, scope) {
      function moveForward() {
        console.log("ON MOVE FORWARD", {
          tileOnFire,
          tileAhead,
          currentPosition,
          waterSupply
        });
        currentPosition++;
        if (!tileAhead) {
          runTimeException = new WalkedOutsideOfTheBoundariesError();
          return;
        }
        tileAhead = currentPosition + 1 < numberOfTiles;
        tileOnFire = getTileOnFire();
        displayManager.moveBot(currentPosition);
        // if we don't pass this to the intepreter back the value will not be evaluated
        interpreter.setProperty(scope, "tileAhead", tileAhead);
        interpreter.setProperty(scope, "tileOnFire", tileOnFire);
        console.log("AFTER FORWARD", {
          tileOnFire,
          tileAhead,
          currentPosition,
          waterSupply
        });
      }
      function extinguishFire() {
        console.log("ON EXTINGUISH FIRE", {
          tileOnFire,
          tileAhead,
          currentPosition,
          waterSupply
        });
        console.log(`EXTINGUISHING FIRE WITH WATER SUPPLY ${waterSupply}`);
        if (waterSupply <= 0) {
          runTimeException = new ExtinguishWithoutWaterError();
          return;
        }
        if (!tileOnFire) {
          runTimeException = new ExtinguishNoFlameError();
          return;
        }
        waterSupply--;
        if (waterSupply === 0) {
          positionThatWaterRunOut = currentPosition;
        }
        extinguishedFires.push(currentPosition);
        displayManager.extinguishFlame(currentPosition);
        interpreter.setProperty(scope, "waterSupply", waterSupply);
        interpreter.setProperty(scope, "tileOnFire", false);
        console.log("AFTER EXTINGUISH FIRE", {
          tileOnFire,
          tileAhead,
          currentPosition,
          waterSupply
        });
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
          onStopIntepreting({ failed: true }, currentLevel);
          return;
        }
        stepCount++;
        const lastOne = jsInterpreter.step() === false;
        if (lastOne) {
          onStopIntepreting(
            {
              fires,
              waterSupply,
              extinguishedFires,
              currentPosition,
              numberOfTiles,
              positionThatWaterRunOut
            },
            currentLevel
          );
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
