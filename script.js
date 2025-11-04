const keyboardLayout = [
  [
    { label: "`", value: "`", shiftValue: "~" },
    { label: "1", value: "1", shiftValue: "!" },
    { label: "2", value: "2", shiftValue: "@" },
    { label: "3", value: "3", shiftValue: "#" },
    { label: "4", value: "4", shiftValue: "$" },
    { label: "5", value: "5", shiftValue: "%" },
    { label: "6", value: "6", shiftValue: "^" },
    { label: "7", value: "7", shiftValue: "&" },
    { label: "8", value: "8", shiftValue: "*" },
    { label: "9", value: "9", shiftValue: "(" },
    { label: "0", value: "0", shiftValue: ")" },
    { label: "-", value: "-", shiftValue: "_" },
    { label: "=", value: "=", shiftValue: "+" },
    { label: "Backspace", value: "Backspace", type: "action", size: 5, class: "key--wide" }
  ],
  [
    { label: "Tab", value: "Tab", type: "action", size: 3, class: "key--wide" },
    { label: "q", value: "q" },
    { label: "w", value: "w" },
    { label: "e", value: "e" },
    { label: "r", value: "r" },
    { label: "t", value: "t" },
    { label: "y", value: "y" },
    { label: "u", value: "u" },
    { label: "i", value: "i" },
    { label: "o", value: "o" },
    { label: "p", value: "p" },
    { label: "[", value: "[", shiftValue: "{" },
    { label: "]", value: "]", shiftValue: "}" },
    { label: "\\", value: "\\", shiftValue: "|", size: 3, class: "key--wide" }
  ],
  [
    { label: "Caps", value: "CapsLock", type: "caps", size: 4, class: "key--wide key--primary" },
    { label: "a", value: "a" },
    { label: "s", value: "s" },
    { label: "d", value: "d" },
    { label: "f", value: "f" },
    { label: "g", value: "g" },
    { label: "h", value: "h" },
    { label: "j", value: "j" },
    { label: "k", value: "k" },
    { label: "l", value: "l" },
    { label: ";", value: ";", shiftValue: ":" },
    { label: "'", value: "'", shiftValue: """ },
    { label: "Enter", value: "Enter", type: "action", size: 6, class: "key--wide" }
  ],
  [
    { label: "Shift", value: "Shift", type: "shift", size: 6, class: "key--wide key--primary" },
    { label: "z", value: "z" },
    { label: "x", value: "x" },
    { label: "c", value: "c" },
    { label: "v", value: "v" },
    { label: "b", value: "b" },
    { label: "n", value: "n" },
    { label: "m", value: "m" },
    { label: ",", value: ",", shiftValue: "<" },
    { label: ".", value: ".", shiftValue: ">" },
    { label: "/", value: "/", shiftValue: "?" },
    { label: "Shift", value: "Shift", type: "shift", size: 7, class: "key--wide key--primary" }
  ],
  [
    { label: "Copy", value: "Copy", type: "copy", size: 4, class: "key--wide key--primary" },
    { label: "Ctrl", value: "Ctrl", type: "noop", size: 4, class: "key--wide" },
    { label: "Alt", value: "Alt", type: "noop", size: 4, class: "key--wide" },
    { label: "Space", value: "Space", type: "space", size: 10, class: "key--wide" },
    { label: "Paste", value: "Paste", type: "paste", size: 4, class: "key--wide key--primary" }
  ]
];

const input = document.getElementById("virtual-input");
const keyboard = document.getElementById("keyboard");
const copyButton = document.getElementById("copy-button");
const statusMessage = document.getElementById("status-message");
const zoomSlider = document.getElementById("zoom-slider");

const AUTO_PASTE_DELAY_MS = 10000;

const setKeyScale = (scale) => {
  const clamped = Math.min(1.5, Math.max(0.5, scale));
  document.documentElement.style.setProperty("--key-scale", String(clamped));
};

const state = {
  shift: false,
  caps: false,
  autoPasteTimeout: null,
  lastCopiedText: ""
};

const shiftKeys = [];
const capsKeys = [];

const createKeyElement = (keyData) => {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("key");

  if (keyData.class) {
    keyData.class.split(" ").forEach((className) => {
      if (className.trim()) {
        button.classList.add(className.trim());
      }
    });
  }

  if (keyData.size) {
    button.dataset.size = keyData.size;
  }

  if (keyData.shiftValue) {
    const shifted = document.createElement("span");
    shifted.className = "key__shifted";
    shifted.textContent = keyData.shiftValue;
    button.appendChild(shifted);
  }

  const mainLabel = document.createElement("span");
  mainLabel.textContent = keyData.label;
  button.appendChild(mainLabel);

  if (keyData.type === "shift") {
    shiftKeys.push(button);
  }

  if (keyData.type === "caps") {
    capsKeys.push(button);
  }

  button.addEventListener("click", () => handleKeyPress(keyData));
  return button;
};

const renderKeyboard = () => {
  keyboardLayout.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard__row";

    row.forEach((keyData) => {
      const keyElement = createKeyElement(keyData);
      rowElement.appendChild(keyElement);
    });

    keyboard.appendChild(rowElement);
  });
};

const updateStatus = (message, timeout = 2500) => {
  statusMessage.textContent = message;
  if (timeout) {
    window.clearTimeout(statusMessage.dataset.timeoutId);
    const id = window.setTimeout(() => {
      statusMessage.textContent = "";
      delete statusMessage.dataset.timeoutId;
    }, timeout);
    statusMessage.dataset.timeoutId = id;
  }
};

const insertCharacter = (character) => {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const before = input.value.slice(0, start);
  const after = input.value.slice(end);
  input.value = `${before}${character}${after}`;
  const newPosition = start + character.length;
  input.setSelectionRange(newPosition, newPosition);
};

const resolveCharacter = (keyData) => {
  const isLetter = /^[a-z]$/i.test(keyData.value);

  if (isLetter) {
    const shouldUppercase = state.shift !== state.caps;
    const char = shouldUppercase ? keyData.value.toUpperCase() : keyData.value.toLowerCase();
    return char;
  }

  if (state.shift && keyData.shiftValue) {
    return keyData.shiftValue;
  }

  return keyData.value;
};

const setShift = (on) => {
  state.shift = on;
  shiftKeys.forEach((button) => {
    button.classList.toggle("is-active", on);
  });
};

const toggleCaps = () => {
  state.caps = !state.caps;
  capsKeys.forEach((button) => {
    button.classList.toggle("is-active", state.caps);
  });
};

const handleKeyPress = (keyData) => {
  switch (keyData.type) {
    case "action":
      if (keyData.value === "Backspace") {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;

        if (start === end && start > 0) {
          input.value = `${input.value.slice(0, start - 1)}${input.value.slice(end)}`;
          const newPosition = start - 1;
          input.setSelectionRange(newPosition, newPosition);
        } else if (start !== end) {
          input.value = `${input.value.slice(0, start)}${input.value.slice(end)}`;
          input.setSelectionRange(start, start);
        }
      }

      if (keyData.value === "Enter") {
        updateStatus("Enter is not available on the single line field.");
      }

      if (keyData.value === "Tab") {
        insertCharacter("    ");
      }
      break;

    case "shift":
      setShift(!state.shift);
      return;

    case "caps":
      toggleCaps();
      return;

    case "space":
      insertCharacter(" ");
      break;

    case "copy":
      handleCopy();
      break;

    case "paste":
      updateStatus(`Will paste clipboard in ${AUTO_PASTE_DELAY_MS / 1000} seconds...`);
      scheduleAutoPaste();
      break;

    case "noop":
      updateStatus(`${keyData.label} is disabled on the virtual keyboard.`);
      break;

    default: {
      const char = resolveCharacter(keyData);
      insertCharacter(char);
      break;
    }
  }

  if (state.shift && keyData.type !== "shift") {
    setShift(false);
  }
};

const handleCopy = async () => {
  if (!navigator.clipboard) {
    updateStatus("Clipboard access is unavailable in this browser.");
    return;
  }

  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const hasSelection = end > start;
  const textToCopy = hasSelection ? input.value.slice(start, end) : input.value;

  if (!textToCopy) {
    updateStatus("Nothing to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    state.lastCopiedText = textToCopy;
    updateStatus(hasSelection ? "Copied selection to clipboard." : "Copied all text to clipboard.");
  } catch (error) {
    console.error("Failed to copy", error);
    updateStatus("Clipboard permissions are required for copy.");
  }
};

const scheduleAutoPaste = () => {
  if (!navigator.clipboard) {
    updateStatus("Clipboard access is unavailable for paste.");
    return;
  }

  if (state.autoPasteTimeout) {
    window.clearTimeout(state.autoPasteTimeout);
  }

  state.autoPasteTimeout = window.setTimeout(async () => {
    if (!navigator.clipboard.readText) {
      updateStatus("Auto paste is not supported by this browser.");
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        updateStatus("Clipboard is empty.");
        return;
      }
      insertCharacter(clipboardText);
      updateStatus("Pasted clipboard contents.");
    } catch (error) {
      console.error("Auto paste failed", error);
      updateStatus("Auto paste needs additional browser permission.");
    }
  }, AUTO_PASTE_DELAY_MS);
};

const handlePhysicalKey = (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const key = event.key;

  const specialKeyMap = {
    Backspace: "Backspace",
    Enter: "Enter",
    Tab: "Tab",
    CapsLock: "CapsLock",
    Shift: "Shift",
    " ": "Space"
  };

  if (specialKeyMap[key]) {
    if (key === "Shift") {
      setShift(true);
    }
    handleKeyPress({ type: "action", value: specialKeyMap[key] });
    event.preventDefault();
    return;
  }

  const isPrintable = key.length === 1;
  if (!isPrintable) {
    return;
  }

  const lowerKey = key.toLowerCase();
  const simulated = { type: "char", value: lowerKey };

  if (event.shiftKey) {
    setShift(true);
  }

  handleKeyPress(simulated);
};

const handlePhysicalKeyUp = (event) => {
  if (event.key === "Shift") {
    setShift(false);
  }
};

if (zoomSlider) {
  const initialScale = parseFloat(zoomSlider.value);
  if (!Number.isNaN(initialScale)) {
    setKeyScale(initialScale);
  } else {
    setKeyScale(1);
  }

  zoomSlider.addEventListener("input", (event) => {
    const value = parseFloat(event.target.value);
    if (!Number.isNaN(value)) {
      setKeyScale(value);
    }
  });
}

renderKeyboard();
copyButton.addEventListener("click", handleCopy);
document.addEventListener("keydown", handlePhysicalKey);
document.addEventListener("keyup", handlePhysicalKeyUp);
input.focus();
