function UIManager({ onDismiss, delay = 600, onRun, onStop, onStep }) {
  let overlayContainer = null;
  let alertMessageContainer = null;
  let alertTitleContainer = null;
  let closeButon = null;
  let runButton = null;
  let stopButton;
  let stepButton;

  init();
  function init() {
    overlayContainer = document.querySelector("#overlay");
    closeButon = overlayContainer.querySelector(".closeButton");
    alertMessageContainer = overlayContainer.querySelector(".alertMessage");
    alertTitleContainer = overlayContainer.querySelector(".alertTitle");
    runButton = document.querySelector("#runButton");
    runButton.addEventListener("click", handleRun);
    stopButton = document.querySelector("#stopButton");
    stopButton.addEventListener("click", handleStop);
    stepButton = document.querySelector("#stepButton");
    stepButton.addEventListener("click", handleStep);
    stopButton.disabled = true;
    overlayContainer.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    });
    closeButon.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    });
  }
  function handleStep() {
    runButton.disabled = true;
    stopButton.disabled = false;
    stepButton.disabled = true;

    onStep();
  }
  function handleStop() {
    handleEndOfRun();
    onStop();
  }
  function handleRun() {
    runButton.disabled = true;
    stopButton.disabled = false;
    stepButton.disabled = true;
    onRun();
  }
  function handleClose() {
    hide();
    onDismiss();
  }
  function handleEndOfRun() {
    runButton.disabled = false;
    stepButton.disabled = false;
  }
  function showMessage() {
    setTimeout(() => {
      overlayContainer.style.display = "flex";
    }, delay);
  }
  function hide() {
    overlayContainer.style.display = "none";
  }
  this.onSuccess = message => {
    alertTitleContainer.innerHTML = "Success!";
    alertTitleContainer.classList.add("success");
    alertTitleContainer.classList.remove("failure");
    alertMessageContainer.innerHTML = message;
    handleEndOfRun();
    showMessage();
  };
  this.onFailure = message => {
    alertTitleContainer.innerHTML = "Not ready yet...";
    alertTitleContainer.classList.add("failure");
    alertTitleContainer.classList.remove("success");
    alertMessageContainer.innerHTML = message;
    handleEndOfRun();
    showMessage();
  };
  this.onStepExecuted = () => {
    stepButton.disabled = false;
  };
}
