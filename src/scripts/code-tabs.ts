const CODE_TAB_ACTIVE_CLASSES = [
  "border-t-secondary",
  "border-b",
  "border-r-base-content/10",
  "border-b-neutral",
  "bg-neutral",
  "text-neutral-content",
  "shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-secondary)_55%,transparent)]",
];

const CODE_TAB_INACTIVE_CLASSES = [
  "border-t-transparent",
  "border-b",
  "border-base-content/10",
  "bg-base-100/40",
  "text-neutral-content/45",
  "hover:bg-base-content/5",
  "hover:text-neutral-content/75",
];

export const initCodeTabs = (el: HTMLElement) => {
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>("[data-code-tab]"));
  const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-code-panel]"));

  const setActiveClasses = (button: HTMLButtonElement, active: boolean) => {
    const addClasses = active ? CODE_TAB_ACTIVE_CLASSES : CODE_TAB_INACTIVE_CLASSES;
    const removeClasses = active ? CODE_TAB_INACTIVE_CLASSES : CODE_TAB_ACTIVE_CLASSES;

    button.classList.remove(...removeClasses);
    button.classList.add(...addClasses);
  };

  const activateTab = (tabName: string, focus = false) => {
    buttons.forEach((button) => {
      const active = button.dataset.codeTab === tabName;

      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
      setActiveClasses(button, active);

      if (active && focus) {
        button.focus();
      }
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.codePanel !== tabName;
    });
  };

  buttons.forEach((button, index) => {
    const handleClick = (event: Event) => {
      event.preventDefault();
      activateTab(button.dataset.codeTab!);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      const nextIndex = (index + 1) % buttons.length;
      const previousIndex = (index - 1 + buttons.length) % buttons.length;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        activateTab(buttons[nextIndex].dataset.codeTab!, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        activateTab(buttons[previousIndex].dataset.codeTab!, true);
      } else if (event.key === "Home") {
        event.preventDefault();
        activateTab(buttons[0].dataset.codeTab!, true);
      } else if (event.key === "End") {
        event.preventDefault();
        activateTab(buttons[buttons.length - 1].dataset.codeTab!, true);
      }
    };

    button.addEventListener("click", handleClick);
    button.addEventListener("keydown", handleKeydown);
  });
};
