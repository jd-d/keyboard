const textDisplay = document.getElementById('textDisplay');
const keyboardContainer = document.querySelector('.keyboard');
const copyButton = document.getElementById('copyButton');
const copyStatus = document.getElementById('copyStatus');

const keyboardLayout = [
  [
    { type: 'dual', label: '`', value: '`', shift: '~', code: 'Backquote' },
    { type: 'dual', label: '1', value: '1', shift: '!', code: 'Digit1' },
    { type: 'dual', label: '2', value: '2', shift: '@', code: 'Digit2' },
    { type: 'dual', label: '3', value: '3', shift: '#', code: 'Digit3' },
    { type: 'dual', label: '4', value: '4', shift: '$', code: 'Digit4' },
    { type: 'dual', label: '5', value: '5', shift: '%', code: 'Digit5' },
    { type: 'dual', label: '6', value: '6', shift: '^', code: 'Digit6' },
    { type: 'dual', label: '7', value: '7', shift: '&', code: 'Digit7' },
    { type: 'dual', label: '8', value: '8', shift: '*', code: 'Digit8' },
    { type: 'dual', label: '9', value: '9', shift: '(', code: 'Digit9' },
    { type: 'dual', label: '0', value: '0', shift: ')', code: 'Digit0' },
    { type: 'dual', label: '-', value: '-', shift: '_', code: 'Minus' },
    { type: 'dual', label: '=', value: '=', shift: '+', code: 'Equal' },
    { type: 'action', label: 'Backspace', action: 'backspace', className: 'backspace', code: 'Backspace' }
  ],
  [
    { type: 'action', label: 'Tab', value: '\t', action: 'tab', className: 'tab', code: 'Tab' },
    { type: 'letter', label: 'Q', value: 'q', code: 'KeyQ' },
    { type: 'letter', label: 'W', value: 'w', code: 'KeyW' },
    { type: 'letter', label: 'E', value: 'e', code: 'KeyE' },
    { type: 'letter', label: 'R', value: 'r', code: 'KeyR' },
    { type: 'letter', label: 'T', value: 't', code: 'KeyT' },
    { type: 'letter', label: 'Y', value: 'y', code: 'KeyY' },
    { type: 'letter', label: 'U', value: 'u', code: 'KeyU' },
    { type: 'letter', label: 'I', value: 'i', code: 'KeyI' },
    { type: 'letter', label: 'O', value: 'o', code: 'KeyO' },
    { type: 'letter', label: 'P', value: 'p', code: 'KeyP' },
    { type: 'dual', label: '[', value: '[', shift: '{', code: 'BracketLeft' },
    { type: 'dual', label: ']', value: ']', shift: '}', code: 'BracketRight' },
    { type: 'dual', label: '\\', value: '\\', shift: '|', code: 'Backslash' }
  ],
  [
    { type: 'action', label: 'Caps', action: 'caps', className: 'caps', code: 'CapsLock' },
    { type: 'letter', label: 'A', value: 'a', code: 'KeyA' },
    { type: 'letter', label: 'S', value: 's', code: 'KeyS' },
    { type: 'letter', label: 'D', value: 'd', code: 'KeyD' },
    { type: 'letter', label: 'F', value: 'f', code: 'KeyF' },
    { type: 'letter', label: 'G', value: 'g', code: 'KeyG' },
    { type: 'letter', label: 'H', value: 'h', code: 'KeyH' },
    { type: 'letter', label: 'J', value: 'j', code: 'KeyJ' },
    { type: 'letter', label: 'K', value: 'k', code: 'KeyK' },
    { type: 'letter', label: 'L', value: 'l', code: 'KeyL' },
    { type: 'dual', label: ';', value: ';', shift: ':', code: 'Semicolon' },
    { type: 'dual', label: "'", value: "'", shift: '"', code: 'Quote' },
    { type: 'action', label: 'Enter', action: 'enter', className: 'enter', code: 'Enter' }
  ],
  [
    { type: 'action', label: 'Shift', action: 'shift', className: 'shift', code: 'ShiftLeft' },
    { type: 'letter', label: 'Z', value: 'z', code: 'KeyZ' },
    { type: 'letter', label: 'X', value: 'x', code: 'KeyX' },
    { type: 'letter', label: 'C', value: 'c', code: 'KeyC' },
    { type: 'letter', label: 'V', value: 'v', code: 'KeyV' },
    { type: 'letter', label: 'B', value: 'b', code: 'KeyB' },
    { type: 'letter', label: 'N', value: 'n', code: 'KeyN' },
    { type: 'letter', label: 'M', value: 'm', code: 'KeyM' },
    { type: 'dual', label: ',', value: ',', shift: '<', code: 'Comma' },
    { type: 'dual', label: '.', value: '.', shift: '>', code: 'Period' },
    { type: 'dual', label: '/', value: '/', shift: '?', code: 'Slash' },
    { type: 'action', label: 'Shift', action: 'shift', className: 'shift', code: 'ShiftRight' }
  ],
  [
    { type: 'modifier', label: 'Ctrl', action: 'ctrl', className: 'ctrl', code: 'ControlLeft' },
    { type: 'modifier', label: 'Alt', action: 'alt', className: 'alt', code: 'AltLeft' },
    { type: 'modifier', label: 'Cmd', action: 'meta', className: 'cmd', code: 'MetaLeft' },
    { type: 'action', label: '', value: ' ', action: 'space', className: 'space', code: 'Space' },
    { type: 'modifier', label: 'Cmd', action: 'meta', className: 'cmd', code: 'MetaRight' },
    { type: 'modifier', label: 'Alt', action: 'alt', className: 'alt', code: 'AltRight' },
    { type: 'modifier', label: 'Ctrl', action: 'ctrl', className: 'ctrl', code: 'ControlRight' }
  ]
];

const keyElements = new Map();
let shiftActive = false;
let capsActive = false;
let copyReminderTimeoutId;

function renderKeyboard() {
  keyboardContainer.innerHTML = '';
  keyboardLayout.forEach(row => {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard-row';

    row.forEach(key => {
      const keyElement = document.createElement('button');
      keyElement.type = 'button';
      keyElement.classList.add('key');
      keyElement.dataset.code = key.code;

      if (key.className) {
        keyElement.classList.add(key.className);
      }

      if (key.type === 'dual') {
        keyElement.innerHTML = `
          <span class="primary">${key.label}</span>
          <span class="shift-char">${key.shift}</span>
        `;
      } else {
        keyElement.textContent = key.label || key.value || '';
      }

      if (key.type === 'action' || key.type === 'modifier') {
        keyElement.classList.add('modifier');
      }

      keyElement.addEventListener('click', () => {
        handleVirtualKeyPress(key);
        highlightKey(key.code);
        setTimeout(() => unhighlightKey(key.code), 150);
      });

      rowElement.appendChild(keyElement);
      keyElements.set(key.code, keyElement);
    });

    keyboardContainer.appendChild(rowElement);
  });
}

function handleVirtualKeyPress(key) {
  switch (key.action) {
    case 'backspace':
      removeCharacter();
      break;
    case 'tab':
      insertCharacter('\t');
      break;
    case 'enter':
      insertCharacter('\n');
      break;
    case 'space':
      insertCharacter(' ');
      break;
    case 'shift':
      toggleShift();
      break;
    case 'caps':
      toggleCaps();
      break;
    default:
      if (key.type === 'letter' || key.type === 'dual') {
        insertFromKey(key);
      }
      break;
  }
}

function insertFromKey(key) {
  let character = key.value;

  if (key.type === 'letter') {
    if (shiftActive !== capsActive) {
      character = character.toUpperCase();
    }
  } else if (key.type === 'dual') {
    character = shiftActive ? key.shift : key.value;
  }

  insertCharacter(character);

  if (shiftActive) {
    setShift(false);
  }
}

function insertCharacter(char) {
  textDisplay.value += char;
  textDisplay.focus();
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function removeCharacter() {
  textDisplay.value = textDisplay.value.slice(0, -1);
  textDisplay.focus();
}

function toggleShift() {
  setShift(!shiftActive);
}

function setShift(state) {
  shiftActive = state;
  updateShiftKeys();
}

function updateShiftKeys() {
  ['ShiftLeft', 'ShiftRight'].forEach(code => {
    const key = keyElements.get(code);
    if (!key) return;
    key.classList.toggle('active', shiftActive);
  });
}

function toggleCaps() {
  capsActive = !capsActive;
  const capsKey = keyElements.get('CapsLock');
  if (capsKey) {
    capsKey.classList.toggle('active', capsActive);
  }
}

function highlightKey(code) {
  const key = keyElements.get(code);
  if (key) {
    key.classList.add('active');
  }
}

function unhighlightKey(code) {
  const key = keyElements.get(code);
  if (key && !shouldStayActive(code)) {
    key.classList.remove('active');
  }
}

function shouldStayActive(code) {
  if (code === 'CapsLock') {
    return capsActive;
  }
  if (code === 'ShiftLeft' || code === 'ShiftRight') {
    return shiftActive;
  }
  return false;
}

function handlePhysicalKeyDown(event) {
  if (!keyElements.has(event.code)) {
    return;
  }

  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    setShift(true);
  }

  if (event.code === 'CapsLock') {
    toggleCaps();
    return;
  }

  if (event.repeat && event.code !== 'Backspace') {
    event.preventDefault();
  }

  event.preventDefault();
  const key = findKeyByCode(event.code);
  if (key) {
    handleVirtualKeyPress(key);
    highlightKey(event.code);
  }
}

function handlePhysicalKeyUp(event) {
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    setShift(false);
  }
  unhighlightKey(event.code);
}

function findKeyByCode(code) {
  for (const row of keyboardLayout) {
    for (const key of row) {
      if (key.code === code) {
        return key;
      }
    }
  }
  return null;
}

copyButton.addEventListener('click', async () => {
  const text = textDisplay.value;
  if (!text) {
    copyStatus.textContent = 'Nothing to copy yet - try typing first.';
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback(true);
  } catch (error) {
    legacyCopy(text);
  }
});

function legacyCopy(text) {
  const wasReadOnly = textDisplay.hasAttribute('readonly');
  if (wasReadOnly) {
    textDisplay.removeAttribute('readonly');
  }
  textDisplay.select();
  textDisplay.setSelectionRange(0, textDisplay.value.length);

  try {
    const success = document.execCommand('copy');
    showCopyFeedback(success);
  } catch (error) {
    showCopyFeedback(false);
  }

  textDisplay.setSelectionRange(textDisplay.value.length, textDisplay.value.length);
  if (wasReadOnly) {
    textDisplay.setAttribute('readonly', '');
  }
  textDisplay.blur();
}

function showCopyFeedback(success) {
  window.clearTimeout(copyReminderTimeoutId);

  if (success) {
    copyStatus.textContent = 'Copied! We will remind you to paste in 10 seconds.';
    schedulePasteReminder();
  } else {
    copyStatus.textContent = 'Your browser blocked automatic copy. Use Ctrl+C / Cmd+C.';
  }
}

function schedulePasteReminder() {
  copyReminderTimeoutId = window.setTimeout(() => {
    copyStatus.textContent = 'Tip: Paste the copied text where you need it (Ctrl+V / Cmd+V).';
  }, 10000);
}

renderKeyboard();
textDisplay.addEventListener('focus', () => {
  textDisplay.selectionStart = textDisplay.selectionEnd = textDisplay.value.length;
});

document.addEventListener('keydown', handlePhysicalKeyDown);
document.addEventListener('keyup', handlePhysicalKeyUp);
