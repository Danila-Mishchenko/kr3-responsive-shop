'use strict';

for (const button of document.querySelectorAll('[data-lesson]')) {
  button.addEventListener('click', () => {
    const field = document.getElementById('chat-text');
    if (!field.value.trim()) {
      field.value =
        'Здравствуйте! Хочу узнать подробнее о занятии «' +
        button.dataset.lesson +
        '». Подскажите, когда можно прийти и сколько стоит занятие?';
    }
    document.getElementById('open-chat').click();
    field.focus();
  });
}
