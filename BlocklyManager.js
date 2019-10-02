function BlocklyManager() {
  let workspace;
  init();
  function init() {
    const blocklyArea = document.querySelector("#blocklyArea");
    const blocklyDiv = document.querySelector("#blocklyDiv");

    Blockly.Blocks["redi_var_tileOnFire"] = {
      init: function() {
        this.jsonInit({
          type: "variable_blocks",
          message0: "tileOnFire",
          output: "Boolean",
          colour: "40",
          tooltip: "Whether or not the tile is on fire",
          helpUrl: ""
        });
      }
    };
    Blockly.JavaScript["redi_var_tileOnFire"] = function(block) {
      const code = `tileOnFire`;
      return [code, Blockly.JavaScript.ORDER_NONE];
    };
    Blockly.Blocks["redi_moveForward"] = {
      init: function() {
        this.jsonInit({
          type: "procedure_blocks",
          message0: "move forward",
          previousStatement: null,
          nextStatement: null,
          colour: 290,
          tooltip: "",
          helpUrl: ""
        });
      }
    };
    Blockly.JavaScript["redi_moveForward"] = function(block) {
      return "moveForward();\n";
    };
    Blockly.Blocks["redi_extinguishFire"] = {
      init: function() {
        this.jsonInit({
          type: "procedure_blocks",
          message0: "Extinguish fire",
          previousStatement: null,
          nextStatement: null,
          colour: 290,
          tooltip:
            "Make the rediBot extinguish a fire if there is water available, decrease water",
          helpUrl: ""
        });
      }
    };
    Blockly.JavaScript["redi_extinguishFire"] = function(block) {
      return "extinguishFire();\n";
    };
    Blockly.Blocks["redi_var_tileAhead"] = {
      init: function() {
        this.jsonInit({
          type: "variable_blocks",
          message0: "tileAhead",
          output: "Boolean",
          colour: "40",
          tooltip: "Whether or not there is a tile ahead",
          helpUrl: ""
        });
      }
    };
    Blockly.JavaScript["redi_var_tileAhead"] = function(block) {
      // TODO: Assemble JavaScript into code variable.
      var code = "tileAhead";
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    };
    Blockly.Blocks["redi_var_waterSupply"] = {
      init: function() {
        this.jsonInit({
          type: "variable_blocks",
          message0: "waterSupply",
          output: "Number",
          colour: "40",
          tooltip: "Volume of water remaining",
          helpUrl: ""
        });
      }
    };
    Blockly.JavaScript["redi_var_waterSupply"] = function(block) {
      // TODO: Assemble JavaScript into code variable.
      var code = "waterSupply";
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    };
    const categoryStyles = {
      control_category: {
        colour: "#4a148c"
      },
      action_category: {
        colour: "#01579b"
      },
      logic_category: {
        colour: "rgb(225, 73, 101)"
      }
    };
    const blockStyles = {};
    const theme = Blockly.Theme(blockStyles, categoryStyles);

    workspace = Blockly.inject(blocklyDiv, {
      toolbox: document.querySelector("#toolbox"),
      trashcan: true
    });
    // Blockly.setTheme(theme);
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
