const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const modifiers = ["shift", "ctrl", "alt", "meta"];

// https://github.com/KittyGiraudel/focusable-selectors/blob/main/index.js
const focusableSelectors = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
  "details summary",
];
function isVisible(element) {
  return Boolean(
    element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
  );
}

const debugElements = new Set();

const clearDebugElements = () => {
  for (const element of debugElements) {
    document.body.removeChild(element);
    debugElements.delete(element);
  }
};

const loopingIndex = (length, index) => (length * 2 + index) % length;

/**
 *
 * @param {string} label
 * @param {Element} element
 */
const showElement = (label, element) => {
  const boundingRect = element.getBoundingClientRect();
  const debugElement = document.createElement("div");
  debugElement.textContent = label;
  Object.assign(debugElement.style, {
    position: "fixed",
    backgroundColor: "white",
    color: "black",
    border: "4px dashed black",
    opacity: "0.2",
    top: boundingRect.top + "px",
    left: boundingRect.left + "px",
    width: Math.max(boundingRect.width, 48) + "px",
    height: Math.max(boundingRect.height, 24) + "px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });
  document.body.appendChild(debugElement);
  debugElements.add(debugElement);
};

document.body.addEventListener("keydown", (event) => {
  if (
    !keys.includes(event.key) ||
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.defaultPrevented
  ) {
    return;
  }

  const focusableElements = Array.from(
    document.querySelectorAll(focusableSelectors.join(","))
  ).filter(isVisible);

  while (focusableElements.length) {
    const direction = /Up|Left/.test(event.key) ? -1 : 1;
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex =
      currentIndex === -1
        ? 0
        : loopingIndex(focusableElements.length, currentIndex + direction);

    const nextElement = focusableElements.at(nextIndex);
    console.log({ currentIndex, nextIndex, nextElement });

    nextElement.focus();

    // If it wasn't focusable, remove and try again.
    if (document.activeElement !== nextElement) {
      focusableElements.splice(nextIndex, 1);
      continue;
    }

    clearDebugElements();
    showElement(
      "prev",
      focusableElements.at(
        loopingIndex(focusableElements.length, nextIndex - 1)
      )
    );
    showElement(
      "next",
      focusableElements.at(
        loopingIndex(focusableElements.length, nextIndex + 1)
      )
    );

    event.preventDefault();
    return;
  }
});
