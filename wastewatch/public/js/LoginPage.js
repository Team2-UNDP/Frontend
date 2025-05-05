let isModalOpen = false;

function toggleLoginForm() {
  const modal = document.getElementById("loginForm");
  const logo = document.getElementById("logo");
  const loginBtn = document.getElementById("loginBtn");

  if (!isModalOpen) {
    modal.classList.remove(
      "modal-exit",
      "modal-exit-active",
      "modal-enter-active"
    );
    modal.classList.remove("hidden");
    modal.classList.add("modal-enter");
    void modal.offsetWidth;
    modal.classList.add("modal-enter-active");
    modal.classList.remove("modal-enter");

    logo?.classList.add("logo-shrink");
    loginBtn?.classList.add("hidden");

    isModalOpen = true;
  } else {
    modal.classList.remove("modal-enter", "modal-enter-active");
    modal.classList.add("modal-exit");
    void modal.offsetWidth;
    modal.classList.add("modal-exit-active");
    modal.classList.remove("modal-exit");

    setTimeout(() => {
      modal.classList.remove("modal-exit-active");
      modal.classList.add("hidden");

      logo?.classList.remove("logo-shrink");
      loginBtn?.classList.remove("hidden");
      isModalOpen = false;
    }, 300);
  }
}

window.toggleLoginForm = toggleLoginForm;
