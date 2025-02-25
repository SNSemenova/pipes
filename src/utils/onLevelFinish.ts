import confetti from "canvas-confetti";

const onLevelFinish = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  const dialog = document.getElementById("win-dialog") as HTMLDialogElement;
  dialog?.showModal();
};

export default onLevelFinish;
