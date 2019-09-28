function BotManager(workspace) {
  const initialWaterSupply = 2;
  const stepTimer = 200;
  let currentCode = "";
  let outputContainer = null;
  let displayManager = null;
  let runButton = null;
  function onStartIntepreting() {
    runButton.disabled = true;
  }
  function onStopIntepreting() {
    runButton.disabled = false;
  }
  function runCode() {
    onStartIntepreting();
    let waterSupply = initialWaterSupply;
    let currentTile = 0;
    console.log("runCurrentCode");
    const moveForward = () => {
      currentTile++;
      displayManager.moveBot(currentTile);
      console.log("moveForward");
      console.log({ currentTile, waterSupply });
    };
    const extinguishFire = () => {
      waterSupply--;
      console.log("extinguishFire");
      console.log({ currentTile, waterSupply });
    };
    const highlightBlock = (id) => {
      workspace.highlightBlock(id);
    }
    const initIntepreter = (interpreter, scope) => {
      interpreter.setProperty(scope, "waterSupply", waterSupply);
      interpreter.setProperty(scope, "currentTile", currentTile);
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
    };

    const jsInterpreter = new Interpreter(currentCode, initIntepreter);
    let stepCount = -1;
    const nextStep = () => {
      stepCount++;
      const lastOne = jsInterpreter.step() === false;
      if (lastOne) {
        onStopIntepreting();
        return
      }
      if (stepCount % 2 === 0) {
        nextStep()
        return
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
    displayManager = new DisplayManager("#visualContainer", ".svgTemplates");
    runButton = document.querySelector("#runButton");
    outputContainer = document.getElementById("output");
    workspace.addChangeListener(onWorspaceUpdate);
    runButton.addEventListener("click", runCode);
  }
  init();
}
