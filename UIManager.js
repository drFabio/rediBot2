function UIManager({ onDismiss, delay = 600 }) {
  let overlayContainer = null;
  let alertMessageContainer = null;
  let alertTitleContainer = null;
  let closeButon = null;
  init();
  function init() {
    overlayContainer = document.querySelector("#overlay");
    closeButon = overlayContainer.querySelector(".closeButton");
    alertMessageContainer = overlayContainer.querySelector(".alertMessage");
    alertTitleContainer = overlayContainer.querySelector(".alertTitle");
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
  function handleClose() {
    hide();
    onDismiss();
  }
  function show() {
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
    show();
  };
  this.onFailure = message => {
    alertTitleContainer.innerHTML = "Not ready yet...";
    alertTitleContainer.classList.add("failure");
    alertTitleContainer.classList.remove("success");
    alertMessageContainer.innerHTML = message;
    show();
  };
}
