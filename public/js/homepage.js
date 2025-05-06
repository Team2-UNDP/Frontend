// Toggle Modal
function toggleLoginForm() {
  const loginForm = document.getElementById("loginForm");
  loginForm.classList.toggle("hidden");
}
let isModalOpen = false;

function toggleLoginForm() {
  const modal = document.getElementById("loginForm");
  const logo = document.getElementById("logo");
  const loginBtn = document.getElementById("loginBtn");

  if (!isModalOpen) {
    // Reset animation classes in case they were left over
    modal.classList.remove(
      "modal-exit",
      "modal-exit-active",
      "modal-enter-active"
    );

    // Show modal
    modal.classList.remove("hidden");
    modal.classList.add("modal-enter");

    // Trigger reflow to allow animation
    void modal.offsetWidth; // <- this line forces reflow

    modal.classList.add("modal-enter-active");
    modal.classList.remove("modal-enter");

    logo.classList.add("logo-shrink");
    loginBtn.classList.add("hidden");

    isModalOpen = true;
  } else {
    // Start exit animation
    modal.classList.remove("modal-enter", "modal-enter-active");
    modal.classList.add("modal-exit");

    void modal.offsetWidth; // Force reflow

    modal.classList.add("modal-exit-active");
    modal.classList.remove("modal-exit");

    setTimeout(() => {
      modal.classList.remove("modal-exit-active");
      modal.classList.add("hidden");

      logo.classList.remove("logo-shrink");
      loginBtn.classList.remove("hidden");
      isModalOpen = false;
    }); // Duration should match your animation time
  }
}
