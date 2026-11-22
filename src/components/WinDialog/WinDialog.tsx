import "./WinDialog.css";

const WinDialog = () => {
  function handleClick() {
    const dialog = document.getElementById("win-dialog") as HTMLDialogElement;
    dialog?.close();
  }

  return (
    <dialog id="win-dialog">
      <div id="dialog-content">
        <h1>Correct!</h1>
        <button autoFocus onClick={handleClick}>
          Next level
        </button>
      </div>
    </dialog>
  );
};

export default WinDialog;
