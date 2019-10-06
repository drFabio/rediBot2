/**
 * Class that handles the "business logic"  of the bot and levels
 */
function BotManager(blocklyManager) {
  const workspace = blocklyManager.getWorkspace();
  const DEFAULT_STEP_TIMER = 150;
  let currentCode = "";
  let outputContainer = null;
  let displayManager = null;
  let storageManager = null;
  let uiManager = null;
  let runButton = null;
  let currentLevelIndex = 0;
  const MAX_TILES = 10;
  const MIN_TILES = 3;
  const INITIAL_WATER_SUPPLY = 2;
  let forceStop = false;
  function handleAlertDismiss() {}
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
  function handleStopClick() {
    forceStop = true;
  }
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
    forceStop = false;
    displayManager.runLevel(currentRunData);
  }
  function onStopIntepreting(finalRunData, currentLevel) {
    const {
      fires,
      waterSupply,
      extinguishedFires,
      currentPosition,
      numberOfTiles,
      failed,
      message,
      stopped
    } = finalRunData;
    runButton.disabled = false;
    if (stopped) {
      return;
    }
    const errorMessage = "You did not passed this level";
    const successMessage = "You passed this level";
    let passed = false;
    let displayMessage = message || errorMessage;
    if (currentLevel.hasOwnProperty("checkSuccess")) {
      const levelPassData = currentLevel.checkSuccess(finalRunData);
      passed = levelPassData.passed;
      if (levelPassData.message) {
        displayMessage = levelPassData.message;
      } else if (passed) {
        displayMessage = message || successMessage;
      }
    } else if (
      !failed &&
      fires.length === extinguishedFires.length &&
      currentPosition === numberOfTiles - 1
    ) {
      passed = true;
      displayMessage = message || successMessage;
    }
    if (passed) {
      displayManager.setLevelAsPassed(currentLevelIndex);
      storageManager.setPassedLevel(currentLevelIndex);
      uiManager.onSuccess(displayMessage);
    } else {
      displayManager.unsetLevelAsPassed(currentLevelIndex);
      storageManager.unsetPassedLevel(currentLevelIndex);

      uiManager.onFailure(displayMessage);
    }
  }
  function onLevelSelected(newLevelIndex) {
    storageManager.setCurrentLevel(newLevelIndex);
    const codeText = storageManager.getLevelCode(newLevelIndex);
    if (codeText) {
      blocklyManager.setCodeFromText(codeText);
    }
    currentLevelIndex = newLevelIndex;
  }
  function runCode() {
    const codeAsText = blocklyManager.getCurrentCodeAsText();
    if (codeAsText) {
      storageManager.saveLevelCode(currentLevelIndex, codeAsText);
    }
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
    let stepTimer = DEFAULT_STEP_TIMER;

    function initIntepreter(interpreter, scope) {
      function setState(newState = {}) {
        const oldState = { tileAhead, tileOnFire, waterSupply };
        console.log(`INITING INTERPRETER ${JSON.stringify({ oldState })}`);
        const currentState = { ...oldState, ...newState };
        ({ tileAhead, tileOnFire, waterSupply } = currentState);
        // if we don't pass this to the intepreter back the value will not be evaluated
        interpreter.setProperty(scope, "tileAhead", tileAhead);
        interpreter.setProperty(scope, "tileOnFire", tileOnFire);
        interpreter.setProperty(scope, "waterSupply", waterSupply);
        displayManager.setHud(currentState);
      }
      setState();
      function moveForward() {
        stepTimer = Math.max(500, stepTimer);

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
        setState({ tileAhead, tileOnFire });
        console.log("AFTER FORWARD", {
          tileOnFire,
          tileAhead,
          currentPosition,
          waterSupply
        });
      }
      function extinguishFire() {
        stepTimer = Math.max(300, stepTimer);
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
        setState({ waterSupply, tileOnFire: false });
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
        if (forceStop) {
          onStopIntepreting({ stopped: true }, currentLevel);
          return;
        }
        if (runTimeException) {
          onStopIntepreting(
            { failed: true, message: runTimeException.message },
            currentLevel
          );
          return;
        }
        stepCount++;
        stepTimer = DEFAULT_STEP_TIMER;
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
        const currentTimer = stepTimer;
        stepTimer = DEFAULT_STEP_TIMER;
        // unfortunately since the blocks can be more than one code is hard to control the speed
        window.setTimeout(nextStep, currentTimer);
      };
      nextStep();
    } catch (err) {
      alert(err.message);
    }
  }
  function onWorspaceUpdate(event) {
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
    storageManager = new StorageManager();
    uiManager = new UIManager({
      onDismiss: handleAlertDismiss
    });
    currentLevelIndex = storageManager.getCurrentLevel();
    const passedLevels = storageManager.getPassedLevels();

    onLevelSelected(currentLevelIndex);
    displayManager = new DisplayManager({
      levelIndex: currentLevelIndex,
      onLevelSelected,
      onStop: handleStopClick,
      passedLevels
    });
    runButton = document.querySelector("#runButton");
    outputContainer = document.getElementById("output");
    workspace.addChangeListener(onWorspaceUpdate);
    runButton.addEventListener("click", runCode);
  }
  init();
}
