window.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const onLink = 'https://api.jsonbin.io/b/5df3c10a2c714135cda0bf0f/1';
  /**
   * Загружает данные с бекенда и рендерит полученные данные
   *
   * @param {string} url
   * @param {function} onSuccess
   * @param {function} onError
   */
  const load = (url, onSuccess, onError) => {
    const xhr = new XMLHttpRequest();

    xhr.responseType = 'json';

    xhr.addEventListener('load', function () {
      document.body.classList.add('loaded_hiding');
      if (xhr.status === 200) {
        onSuccess(xhr.response);
      } else {
        onError('Cтатус ответа: ' + xhr.status + ' ' + xhr.statusText);
      }
    });

    window.setTimeout(() => {
      document.body.classList.add('loaded');
      document.body.classList.remove('loaded_hiding');
    }, 1000);

    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });

    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });

    xhr.timeout = 10000; // 10s

    xhr.open('GET', url);
    xhr.send();
  };

  const onError = (message) => {
    console.error(message);
  };

  const onSuccess = (data) => {
    createProductListTemplate(data);
    renderList(data);
    initFilter(data);
  };

  load(onLink, onSuccess, onError);
});

/**
 * Ставит пробел в ценах
 *
 * @param num
 * @return {string}
 */
const prettify = (num) => {
  let n = num.toString();
  return n.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + ' ');
};

/**
 * Рендерить список продуктов
 *
 * @param {Array} data
 * @returns {string}
 */
const createProductListTemplate = data => data.map(item =>
  `<li class="product__list">
    <div class="product__first">
      <h3>${item.name}</h3>
      <div>
        <span>${item.cpu.count}</span> x ${item.cpu.name}
        <span>${item.cpu.count * item.cpu.cores < 5
          ? ' ' + item.cpu.count * item.cpu.cores + ' ядра'
          : ' ' + item.cpu.count * item.cpu.cores + ' ядер'}</span>
      </div>
    </div>
    <div class="product__second">
      <span>${item.ram}</span>
      <div class="product__ram">
        <span>${item.disk.value + ' ГБ'}</span>
        <span>${item.disk.type}</span>
      </div>
      <span>${item.gpu ? item.gpu : ''}</span>
    </div>
    <div class="product__right">
      <h3>${prettify(item.price / 100)} ₽/месяц</h3>
      <button class="product__button button">Заказать</button>
    </div>
    </li>`
).join(``);

/**
 * Вставляет список в верстку
 *
 * @param data
 */
const renderList = (data) => {
  const product = document.querySelector('.product');
  product.innerHTML = data.length
    ? createProductListTemplate(data)
    : `Нет результатов...`;
};

/**
 * инициализирует список продуктов
 * @param data
 */
const initFilter = (data) => {
  const form = document.querySelector('form');
  const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));
  const coresRange = form.querySelector('input[type="range"]');
  const hasGPU = item => item.gpu;
  const hasSSD = item => item.disk.type === 'SSD';
  const hasRAID = item => item.disk.count > 2;
  const hasEnoughCores = (coresCount, item) => item.cpu.cores * item.cpu.count == coresCount;

  form.addEventListener('change', () => {
    coresCount = coresRange.value;
    const filters = checkboxes
    .filter(input => input.checked)
    .map(input => input.getAttribute('data-filter'));

    renderList(data.filter((item) => {
      const needSSD = filters.includes('ssd');
      const needGPU = filters.includes('gpu');
      const needRAID = filters.includes('raid');

      return !(needGPU && !hasGPU(item)
        || needSSD && !hasSSD(item)
        || needRAID && !hasRAID(item)
        || !hasEnoughCores(coresCount, item));
    }));
  });
};


