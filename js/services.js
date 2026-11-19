'use strict';

// Учебный аккаунт
const accountDialog = document.getElementById('account-dialog');
const accountForm = document.getElementById('account-form');
const accountStatus = document.getElementById('account-status');
const accountButton = document.getElementById('open-account');
let registration = false;
let busy = false;
let returnToRequest = false;

function readAccounts() {
  const value = JSON.parse(localStorage.getItem('resonance-accounts') || '[]');
  if (!Array.isArray(value)) throw new Error('Некорректные данные аккаунтов.');
  return value;
}

function currentAccount() {
  try {
    const email = sessionStorage.getItem('resonance-session');
    return readAccounts().find((account) => account.email === email);
  } catch {
    return null;
  }
}

function renderAccount() {
  const account = currentAccount();
  document.getElementById('account-profile').hidden = !account;
  document.getElementById('account-forms').hidden = Boolean(account);
  document.getElementById('account-name').textContent = account ? account.name + ' · ' + account.email : '';
  accountButton.textContent = account ? 'Мой аккаунт' : 'Войти / Регистрация';
  syncRequestAccount();
}

function setAccountMode(register) {
  registration = register;
  accountForm.reset();
  document.getElementById('register-name-field').hidden = !register;
  document.getElementById('register-name').required = register;
  document.getElementById('account-password').autocomplete = register ? 'new-password' : 'current-password';
  document.getElementById('account-submit').textContent = register ? 'Зарегистрироваться' : 'Войти';
  document.getElementById('show-register').setAttribute('aria-pressed', String(register));
  document.getElementById('show-login').setAttribute('aria-pressed', String(!register));
  accountStatus.textContent = '';
}

// В хранилище записывается проверочное значение пароля и случайная соль.
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: Uint8Array.from(salt),
    iterations: 210000,
    hash: 'SHA-256',
  }, key, 256);
  return Array.from(new Uint8Array(bits)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

accountButton.addEventListener('click', () => {
  renderAccount();
  accountStatus.textContent = '';
  accountDialog.showModal();
});
document.getElementById('show-login').addEventListener('click', () => { if (!busy) setAccountMode(false); });
document.getElementById('show-register').addEventListener('click', () => { if (!busy) setAccountMode(true); });
document.getElementById('account-logout').addEventListener('click', () => {
  try {
    sessionStorage.removeItem('resonance-session');
    renderAccount();
    accountStatus.textContent = 'Вы вышли из аккаунта.';
  } catch {
    accountStatus.textContent = 'Браузер ограничивает доступ к хранилищу.';
  }
});
accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !accountForm.reportValidity()) return;
  const email = document.getElementById('account-email').value.trim().toLowerCase();
  const password = document.getElementById('account-password').value;
  const name = document.getElementById('register-name').value.trim();
  if (registration && !name) {
    accountStatus.textContent = 'Введите имя.';
    return;
  }
  busy = true;
  const submit = document.getElementById('account-submit');
  submit.disabled = true;
  accountStatus.textContent = 'Подождите…';
  try {
    const existing = readAccounts().find((account) => account.email === email);
    if (registration) {
      if (existing) throw new Error('Этот e-mail уже зарегистрирован в браузере.');
      const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await passwordHash(password, salt);
      const accounts = readAccounts();
      if (accounts.some((account) => account.email === email)) throw new Error('Этот e-mail уже зарегистрирован.');
      accounts.push({ name, email, salt, hash });
      localStorage.setItem('resonance-accounts', JSON.stringify(accounts));
    } else {
      if (!existing || await passwordHash(password, existing.salt) !== existing.hash) {
        throw new Error('Неверный e-mail или пароль.');
      }
    }
    sessionStorage.setItem('resonance-session', email);
    accountForm.reset();
    renderAccount();
    accountStatus.textContent = 'Вы вошли в учебный аккаунт.';
    if (returnToRequest) {
      returnToRequest = false;
      accountDialog.close();
      document.querySelector('#request-phone, #order-phone')?.focus();
    }
  } catch (error) {
    accountStatus.textContent = error.message || 'Не удалось открыть аккаунт. Проверьте доступ к хранилищу.';
  } finally {
    busy = false;
    submit.disabled = false;
  }
});
renderAccount();

// Данные аккаунта для заявки
function syncRequestAccount() {
  const fields = document.getElementById('request-fields');
  if (!fields) return;
  const account = currentAccount();
  fields.disabled = !account;
  document.getElementById('request-login').hidden = Boolean(account);
  document.getElementById('request-account-summary').textContent = account
    ? 'Заявка от ' + account.name + ' · ' + account.email
    : 'Для оформления заявки войдите или зарегистрируйтесь.';
  for (const [id, value] of [['order-name', account?.name], ['order-email', account?.email]]) {
    const field = document.getElementById(id);
    field.value = value || '';
    field.readOnly = Boolean(account);
    field.closest('.order-form__field').hidden = Boolean(account);
  }
}

const requestLogin = document.getElementById('request-login');
if (requestLogin) {
  requestLogin.addEventListener('click', () => {
    returnToRequest = true;
    setAccountMode(false);
    accountDialog.showModal();
  });
  const requestForm = document.getElementById('order-form');
  requestForm.addEventListener('reset', () => setTimeout(() => {
    syncRequestAccount();
    deliverySelect?.dispatchEvent(new Event('change'));
  }, 0));
}
accountDialog.addEventListener('close', () => { returnToRequest = false; });

// Чат
const chatDialog = document.getElementById('chat-dialog');
const messagesBox = document.getElementById('chat-messages');
const chatStatus = document.getElementById('chat-status');
let messages = [];
try {
  const saved = JSON.parse(localStorage.getItem('resonance-chat') || '[]');
  if (Array.isArray(saved)) messages = saved.filter((item) => typeof item?.text === 'string' && typeof item?.time === 'string').slice(-100);
} catch {
  chatStatus.textContent = 'История сообщений недоступна.';
}

function renderMessages() {
  messagesBox.replaceChildren();
  for (const message of messages) {
    const bubble = document.createElement('p');
    bubble.className = 'chat-message';
    const sender = document.createElement('strong');
    sender.className = 'chat-message__sender';
    sender.textContent = 'Вы';
    const time = document.createElement('time');
    const date = new Date(message.time);
    time.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ru-RU');
    bubble.append(sender, document.createTextNode(message.text), time);
    messagesBox.append(bubble);
  }
  messagesBox.scrollTop = messagesBox.scrollHeight;
}
document.getElementById('open-chat').addEventListener('click', () => {
  chatDialog.showModal();
  renderMessages();
});
document.getElementById('chat-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = document.getElementById('chat-text');
  const text = field.value.trim();
  if (!text || !event.currentTarget.reportValidity()) return;
  const next = [...messages, { text, time: new Date().toISOString() }].slice(-100);
  try {
    localStorage.setItem('resonance-chat', JSON.stringify(next));
    messages = next;
    renderMessages();
    field.value = '';
    chatStatus.textContent = 'Сообщение сохранено в этом браузере.';
  } catch {
    chatStatus.textContent = 'Не удалось сохранить сообщение. Текст остался в поле.';
  }
});

// Получение заявки
const deliverySelect = document.getElementById('request-delivery');
if (deliverySelect) {
  deliverySelect.addEventListener('change', () => {
    const delivery = deliverySelect.value === 'delivery';
    const address = document.getElementById('request-address');
    document.getElementById('request-address-field').hidden = !delivery;
    address.disabled = !delivery;
    address.required = delivery;
  });
}
