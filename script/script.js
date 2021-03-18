'use strict';

const buttonStart = document.getElementById('start'),
  incomePlus = document.getElementsByTagName('button')[0],
  expensesPlus = document.getElementsByTagName('button')[1],
  depositCheck = document.querySelector('input#deposit-check'),
  additionalIncomeItem = document.querySelectorAll('.additional_income-item'),

  budgetMonthValue = document.getElementsByClassName('budget_month-value')[0],
  budgetDayValue = document.getElementsByClassName('budget_day-value')[0],
  expensesMonthValue = document.getElementsByClassName('expenses_month-value')[0],
  additionalIncomeValue = document.getElementsByClassName('additional_income-value')[0],
  additionalExpensesValue = document.getElementsByClassName('additional_expenses-value')[0],
  incomePeriodValue = document.getElementsByClassName('income_period-value')[0],
  targetMonthValue = document.getElementsByClassName('target_month-value')[0],

  salaryAmount = document.querySelector('.salary-amount'),
  incomeTitle = document.querySelector('.income-title'),
  expensesTitle = document.querySelector('.expenses-title'),
  additionalExpensesItem = document.querySelector('.additional_expenses-item'),
  targetAmount = document.querySelector('.target-amount'),
  periodSelect = document.querySelector('[type = \"range\"]'),
  titlePeriodAmount = document.querySelector('.period-amount'),
  depositBank = document.querySelector('.deposit-bank'),
  depositAmount = document.querySelector('.deposit-amount'),
  depositPercent = document.querySelector('.deposit-percent');

let incomeItems = document.querySelectorAll('.income-items'),
  expensesItems = document.querySelectorAll('.expenses-items');

const buttonCancel = document.querySelector('#cancel');

const isNumber = function (num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
};

class AppData {
  constructor() {
    this.budget = 0;
    this.budgetDay = 0;
    this.budgetMonth = 0;
    this.income = {};
    this.incomeMonth = 0;
    this.addIncome = [];
    this.expenses = {};
    this.expensesMonth = 0;
    this.addExpenses = [];
    this.deposit = false;
    this.percentDeposit = 0;
    this.moneyDeposit = 0;
  }

  start() {
    if (salaryAmount.value !== '') {
      if (depositCheck.checked === true) {
        if (depositAmount.value === '' || depositPercent.value === '') {
          return;
        }
      }
      this.budget = salaryAmount.value;

      this.getAddExpInc();
      this.getExpInc();
      this.getInfoDeposit();

      this.incomeMonth = this.getMonthExpInc(this.income);
      this.expensesMonth = this.getMonthExpInc(this.expenses);

      this.getBudget();
      this.showResult();

      this.setLocalStorage();
      this.setCookie();

      const inputs = document.querySelectorAll('.data input[type=text]');
      inputs.forEach(function (item) {
        if (item.className !== 'period-select') {
          item.disabled = true;
        }
      });

      depositCheck.disabled = true;
      incomePlus.disabled = true;
      expensesPlus.disabled = true;
      buttonStart.style.display = "none";
      buttonCancel.style.display = "block";
    }
  }

  reset() {
    this.budget = 0;
    this.budgetDay = 0;
    this.budgetMonth = 0;
    this.income = {};
    this.incomeMonth = 0;
    this.addIncome = [];
    this.expenses = {};
    this.expensesMonth = 0;
    this.addExpenses = [];
    this.deposit = false;
    this.percentDeposit = 0;
    this.moneyDeposit = 0;

    localStorage.clear();

    const items = document.querySelectorAll('input');
    items.forEach(function (item) {
      item.value = '';
      item.disabled = false;
    });

    periodSelect.value = 1;
    titlePeriodAmount.innerText = '1';

    if (incomeItems.length === 3) {
      incomePlus.style.display = 'block';
    }

    for (let i = 1; i < incomeItems.length; i++) {
      incomeItems[i].remove();
    }

    incomeItems = document.querySelectorAll('.income-items');

    if (expensesItems.length === 3) {
      expensesPlus.style.display = 'block';
    }

    for (let i = 1; i < expensesItems.length; i++) {
      expensesItems[i].remove();
    }

    expensesItems = document.querySelectorAll('.expenses-items');

    depositCheck.checked = false;
    this.depositHandler();

    depositCheck.disabled = false;
    incomePlus.disabled = false;
    expensesPlus.disabled = false;
    buttonStart.style.display = "block";
    buttonCancel.style.display = "none";
  }

  showResult() {
    const _this = this;
    budgetMonthValue.value = this.budgetMonth;
    budgetDayValue.value = this.budgetDay;
    expensesMonthValue.value = this.expensesMonth;
    additionalExpensesValue.value = this.addExpenses.join(', ');
    additionalIncomeValue.value = this.addIncome.join(', ');
    targetMonthValue.value = Math.ceil(this.getTargetMonth());
    incomePeriodValue.value = this.calcPeriod();

    periodSelect.addEventListener('input', function () {
      incomePeriodValue.value = _this.calcPeriod();
    });
  }

  getExpInc() {
    const count = (item) => {
      const startStr = item.className.split('-')[0];
      const itemTitle = item.querySelector('.' + startStr + '-title').value;
      const itemAmount = item.querySelector('.' + startStr + '-amount').value;

      if (itemTitle !== '' && itemAmount !== '') {
        this[startStr][itemTitle] = itemAmount;
      }
    }

    incomeItems = document.querySelectorAll('.income-items');
    expensesItems = document.querySelectorAll('.expenses-items');

    incomeItems.forEach(count);
    expensesItems.forEach(count);
  }

  getAddExpInc() {
    const _this = this;
    const count = (item) => {
      let itemValue = item.value.trim();

      if (item === additionalExpensesItem) {
        itemValue = itemValue.split(',');
        for (let key in itemValue) {
          itemValue[key] = itemValue[key].trim();
        }
      }

      if (itemValue && item !== additionalExpensesItem) {
        _this.addIncome.push(itemValue);
      }

      if (itemValue && item === additionalExpensesItem) {
        _this.addExpenses.push(itemValue);
      }
    };

    count(additionalExpensesItem);
    additionalIncomeItem.forEach(count);
  }

  addBlock(incExp, incExpBtn, incExpClass) {
    const cloneItem = incExp[0].cloneNode(true);
    const cloneItemInput = cloneItem.querySelectorAll('input');

    cloneItemInput.forEach((item) => {
      item.value = '';

      if (item.classList[1] === 'input--amount') {
        item.addEventListener('input', function (e) {
          item.value = item.value.replace(/[^\d.]/g, '');
        });
      } else if (item.classList[1] === 'input--text') {
        item.addEventListener('input', function (e) {
          item.value = item.value.replace(/[^А-Яа-яЁё\s ,]/, '');
        });
      }
    });

    incExp[0].parentNode.insertBefore(cloneItem, incExpBtn);
    incExp = document.querySelectorAll(incExpClass);
    if (incExp.length === 3) {
      incExpBtn.style.display = 'none';
    }
  }

  getMonthExpInc(incExp) {
    let sum = 0;
    for (const key in incExp) {
      sum += +incExp[key];
    }
    return sum;
  }

  getBudget() {
    const monthDeposit = this.moneyDeposit * (this.percentDeposit / 100);
    this.budgetMonth = +this.budget + this.incomeMonth - this.expensesMonth + monthDeposit;
    this.budgetDay = Math.ceil(this.budgetMonth / 30);
  }

  getTargetMonth() {
    return targetAmount.value / this.budgetMonth;
  }

  getStatusIncome() {
    if (this.budgetDay >= 1200) {
      return 'У Вас высокий уровень дохода';
    } else if (this.budgetDay >= 600 && this.budgetDay < 1200) {
      return 'У Вас средний уровень дохода';
    } else if (this.budgetDay > 0 && this.budgetDay < 600) {
      return 'У Вас низкий уровень дохода';
    } else if (this.budgetDay === 0) {
      return 'Скорее записывайся на курсы по JS в GLO ACADEMY';
    } else if (this.budgetDay < 0) {
      return 'Что-то пошло не так';
    }
  }

  getInfoDeposit() {
    if (this.deposit) {
      this.percentDeposit = +depositPercent.value;
      this.moneyDeposit = +depositAmount.value;
    }
  }

  depositInputValues(element) {
    element.value = element.value.replace(/[^\d.]/g, '');

    if (element === depositPercent) {
      if (+element.value < 0 || +element.value > 100) {
        alert('Введите корректное значение в поле проценты.');
        element.value = 0;
      }
    }
  }

  changePercent() {
    const valueSelect = depositBank.value;
    if (valueSelect === 'other') {
      depositPercent.value = '';
      depositPercent.style.display = 'inline-block';
      depositPercent.addEventListener('input', () => this.depositInputValues(depositPercent));
    } else {
      depositPercent.style.display = 'none';
      depositPercent.value = valueSelect;
      depositPercent.removeEventListener('input', this.depositInputValues);
    }
  }

  calcPeriod() {
    return this.budgetMonth * periodSelect.value;
  }

  changePeriodAmount() {
    titlePeriodAmount.textContent = periodSelect.value;
  }

  depositHandler() {
    if (depositCheck.checked) {
      depositBank.style.display = 'inline-block';
      depositAmount.style.display = 'inline-block';
      this.deposit = true;
      depositBank.addEventListener('change', this.changePercent.bind(this));
      depositAmount.addEventListener('input', () => this.depositInputValues(depositAmount));
    } else {
      this.deposit = false
      depositBank.style.display = 'none';
      depositAmount.style.display = 'none';
      depositPercent.style.display = 'none';
      depositBank.value = '';
      depositAmount.value = '';
      depositPercent.value = '';
      depositBank.removeEventListener('change', this.changePercent);
      depositAmount.removeEventListener('input', this.depositInputValues);
    }
  }

  eventsListeners() {
    console.log(this);
    buttonStart.disabled = true;
    salaryAmount.addEventListener('input', function () {
      if (salaryAmount.value === '') {
        buttonStart.disabled = true;
      } else {
        buttonStart.disabled = false;
      }
    });

    salaryAmount.classList.add('input--amount');
    targetAmount.classList.add('input--amount');
    additionalIncomeItem.forEach(function (item) {
      item.classList.add('input--text');
    });
    additionalExpensesItem.classList.add('input--text');

    const incomeInputs = document.querySelectorAll('.income input');
    incomeInputs.forEach(function (item) {
      if (item.classList[0] === 'income-title') {
        item.classList.add('input--text');
      } else if (item.classList[0] === 'income-amount') {
        item.classList.add('input--amount');
      }
    });

    const expensesInputs = document.querySelectorAll('.expenses input');
    expensesInputs.forEach(function (item) {
      if (item.classList[0] === 'expenses-title') {
        item.classList.add('input--text');
      } else if (item.classList[0] === 'expenses-amount') {
        item.classList.add('input--amount');
      }
    });

    const amountInputs = document.querySelectorAll('.input--amount');
    const textInputs = document.querySelectorAll('.input--text');

    amountInputs.forEach(function (item) {
      item.addEventListener('input', function (e) {
        item.value = item.value.replace(/[^\d.]/g, '');
      });
    });

    textInputs.forEach(function (item) {
      item.addEventListener('input', function (e) {
        item.value = item.value.replace(/[^А-Яа-яЁё\s ,]/, '');
      });
    });

    buttonStart.addEventListener('click', this.start.bind(this));
    buttonCancel.addEventListener('click', this.reset.bind(this));
    expensesPlus.addEventListener('click', () => this.addBlock(expensesItems, expensesPlus, '.expenses-items'));
    incomePlus.addEventListener('click', () => this.addBlock(incomeItems, incomePlus, '.income-items'));
    periodSelect.addEventListener('input', this.changePeriodAmount);

    depositCheck.addEventListener('change', this.depositHandler.bind(this));
  }

  setLocalStorage() {
    for (const item in this) {
      localStorage[item] = JSON.stringify(this[item]);
    }
  }

  setCookie() {
    for (const item in this) {
      let cookieStr = `${encodeURI(item)}=${encodeURI(this[item])}; expires=Tue, 7 May 2024 00:00:00 GMT`;
      document.cookie = cookieStr;
    }
    document.cookie = `isLoad=true`;
  }

  pageReload() {
    let cookie = decodeURI(document.cookie).split('; ')
    const cookiesName = [];

    cookie.forEach((item) => {
      item = item.split('=');
      cookiesName.push(item[0]);
    });

    for (const item in localStorage) {
      if (localStorage.hasOwnProperty(item)) {
        if (!cookiesName.some((i) => i === item)) {
          localStorage.clear();
        }
      }
    }

    if (localStorage.length) {
      const _this = this;
      for (const item in localStorage) {
        if (localStorage.hasOwnProperty(item)) {
          this[item] = JSON.parse(localStorage[item]);
        }
      }
      budgetMonthValue.value = this.budgetMonth;
      budgetDayValue.value = this.budgetDay;
      expensesMonthValue.value = this.expensesMonth;
      additionalExpensesValue.value = this.addExpenses.join(', ');
      additionalIncomeValue.value = this.addIncome.join(', ');
      targetMonthValue.value = Math.ceil(this.getTargetMonth());
      incomePeriodValue.value = this.calcPeriod();

      periodSelect.addEventListener('input', function () {
        incomePeriodValue.value = _this.calcPeriod();
      });

      const items = document.querySelectorAll('.data input');
      items.forEach(function (item) {
        if (item.type !== 'range') {
          //item.value = '';
          item.disabled = true;
        } else {
          item.value = 1;
          titlePeriodAmount.textContent = '1';
        }
      });

      depositCheck.disabled = true;
      incomePlus.disabled = true;
      expensesPlus.disabled = true;

      buttonStart.style.display = "none";
      buttonCancel.style.display = "block";
    }
  }
};

const appData = new AppData();
appData.eventsListeners();
appData.pageReload();

//console.log(map);
//console.log(document.cookie);