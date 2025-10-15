const PREFIX = "tor-alza";
const DEFAULT_LENGTH = 24;
const CHARSET = {
  mixed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  simple: "abcdefghijklmnopqrstuvwxyz0123456789"
};

const generatedKeyEl = document.getElementById("generatedKey");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const keyLengthEl = document.getElementById("keyLength");
const includeSymbolsEl = document.getElementById("includeSymbols");
const lengthValueEl = document.getElementById("lengthValue");
const historyListEl = document.getElementById("historyList");
const validatorForm = document.getElementById("validatorForm");
const validatorResult = document.getElementById("validatorResult");

function randomSequence(length, charset) {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  const chars = charset;
  const mod = chars.length;
  return Array.from(array, (value) => chars[value % mod]).join("");
}

function generateKey() {
  const length = parseInt(keyLengthEl?.value ?? DEFAULT_LENGTH, 10);
  const charset = includeSymbolsEl?.checked ? CHARSET.mixed : CHARSET.simple;
  const sequence = randomSequence(length, charset);
  return `${PREFIX}${sequence}`;
}

function updateHistory(newKey) {
  if (!historyListEl) return;
  const entry = document.createElement("li");
  entry.textContent = newKey;
  historyListEl.prepend(entry);
  const maxItems = 5;
  while (historyListEl.children.length > maxItems) {
    historyListEl.removeChild(historyListEl.lastChild);
  }
}

function setGeneratedKey(newKey) {
  if (!generatedKeyEl) return;
  generatedKeyEl.textContent = newKey;
  updateHistory(newKey);
}

async function copyKey() {
  const key = generatedKeyEl?.textContent?.trim();
  if (!key) return;
  try {
    await navigator.clipboard.writeText(key);
    copyButton.textContent = "Скопировано";
    setTimeout(() => {
      copyButton.textContent = "Копировать";
    }, 1500);
  } catch (error) {
    copyButton.textContent = "Ошибка";
    setTimeout(() => {
      copyButton.textContent = "Копировать";
    }, 1500);
  }
}

function validateKeyFormat(key) {
  const pattern = /^tor-alza[A-Za-z0-9]{12,28}$/;
  return pattern.test(key);
}

function renderValidationResult({ success, message, details }) {
  if (!validatorResult) return;
  validatorResult.classList.remove("success", "error");
  validatorResult.classList.add(success ? "success" : "error");
  validatorResult.innerHTML = `
    <strong>${success ? "Ключ прошёл проверку" : "Ошибка валидации"}</strong>
    <span>${message}</span>
    ${details ? `<small>${details}</small>` : ""}
  `;
}

function handleValidationSubmit(event) {
  event.preventDefault();
  const key = document.getElementById("keyInput")?.value.trim();
  const resource = document.getElementById("scriptRef")?.value.trim();

  if (!key) {
    renderValidationResult({
      success: false,
      message: "Введите ключ для проверки."
    });
    return;
  }

  if (!validateKeyFormat(key)) {
    renderValidationResult({
      success: false,
      message: "Ключ должен начинаться с tor-alza и содержать 12-28 символов (буквы и цифры)."
    });
    return;
  }

  const resourceInfo = resource
    ? `Ресурс ${resource} добавлен для логирования и привязки активации.`
    : "Добавьте ссылку на репозиторий, чтобы привязать ключ к релизу в GitHub.";

  renderValidationResult({
    success: true,
    message: "Формат корректен. Ключ можно использовать в автоматизации.",
    details: resourceInfo
  });
}

function init() {
  if (lengthValueEl && keyLengthEl) {
    lengthValueEl.textContent = keyLengthEl.value;
    keyLengthEl.addEventListener("input", () => {
      lengthValueEl.textContent = keyLengthEl.value;
    });
  }

  const initialKey = generateKey();
  setGeneratedKey(initialKey);

  generateButton?.addEventListener("click", () => {
    const newKey = generateKey();
    setGeneratedKey(newKey);
  });

  copyButton?.addEventListener("click", copyKey);

  validatorForm?.addEventListener("submit", handleValidationSubmit);
}

document.addEventListener("DOMContentLoaded", init);
