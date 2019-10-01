function BlocklyManager() {
  let workspace;
  init();
  function init() {
    const blocklyArea = document.querySelector("#blocklyArea");
    const blocklyDiv = document.querySelector("#blocklyDiv");
    workspace = Blockly.inject(blocklyDiv, {
      toolbox: document.querySelector("#toolbox"),
      trashcan: true
    });
    const onresize = function(e) {
      blocklyDiv.style.left = "0px";
      blocklyDiv.style.top = "0px";
      blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
      blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
      Blockly.svgResize(workspace);
    };
    window.addEventListener("resize", onresize, false);
    onresize();
    Blockly.svgResize(workspace);
    Blockly.JavaScript.STATEMENT_PREFIX = "highlightBlock(%1);\n";
    Blockly.JavaScript.addReservedWords("highlightBlock");
  }
  this.getWorkspace = () => {
    return workspace;
  };
  this.getCurrentCodeAsText = () => {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    return Blockly.Xml.domToText(xml);
  };
  this.setCodeFromText = codeAsText => {
    workspace.clear();
    const xml = Blockly.Xml.textToDom(codeAsText);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };
}
