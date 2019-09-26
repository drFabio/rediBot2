function BotManager(workspace) {
  const initialWaterSupply = 2;
  let currentCode = "";
  let outputContainer = null;
  let displayManager = null;
  let runButton = null;
  function runCode() {
    runButton.disabled = true;
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
    console.log(`current code`, currentCode);
    eval(currentCode);
    runButton.disabled = false;
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
