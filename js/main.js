var Test = (function () {
    function Test() {
        this.questions = [];
    }
    Test.prototype.add = function (question) {
        this.questions.push(question);
    };
    Test.prototype.getIterator = function () {
        return new TestIterator(this.questions);
    };
    return Test;
}());
var TestIterator = (function () {
    function TestIterator(questions) {
        this.questions = questions;
        this.answers = [];
        this.current = 0;
    }
    TestIterator.prototype.setAnswerId = function (id) {
        this.currentAnswerId = id;
    };
    TestIterator.prototype.setValidId = function (id) {
        this.validAnswerId = id;
    };
    TestIterator.prototype.calcExpectedPercent = function () {
        return ((this.answers.length + 1) * 100) / this.questions.length;
    };
    TestIterator.prototype.calcTotlaPercent = function () {
        var validAnswers = this.answers.filter(function (answer) { return answer; });
        return ((validAnswers.length) * 100) / this.questions.length;
    };
    TestIterator.prototype.next = function () {
        (this.currentAnswerId === this.validAnswerId) ? this.answers.push(true) : this.answers.push(false);
        if (this.current < this.questions.length - 1) {
            return {
                done: false,
                value: this.questions[++this.current]
            };
        }
        else {
            return {
                done: true,
                value: null
            };
        }
    };
    TestIterator.prototype.refresh = function () {
        this.current = 0;
        this.answers = [];
        return {
            done: false,
            value: this.questions[this.current]
        };
    };
    return TestIterator;
}());
var Render = (function () {
    function Render(iterator) {
        this.iterator = iterator;
        this.questionEl = document.getElementById('question');
        this.listEl = document.getElementById('list');
        this.nextBtn = document.getElementById('next');
        this.stopBtn = document.getElementById('stop');
        this.progress = document.getElementById('progress');
        this.card = document.getElementById('card');
        this.totalBlock = document.getElementById('totals');
        this.answerHandler();
        this.nextHandler();
        this.stopHandler();
    }
    Render.prototype.answerHandler = function () {
        var _this = this;
        this.listEl.addEventListener('click', function (e) {
            var buttonsArray = Array.prototype.slice.call(_this.listEl.children);
            buttonsArray.forEach(function (btn) {
                btn.classList.remove('active');
            });
            if (e.target instanceof HTMLButtonElement) {
                var btn = e.target;
                var percent = _this.iterator.calcExpectedPercent();
                btn.classList.add('active');
                _this.nextBtn.removeAttribute('disabled');
                _this.iterator.setAnswerId(Number(btn.dataset.idx));
                _this.progress.setAttribute('style', 'width:' + percent + '%');
                _this.progress.innerText = percent.toFixed(1) + '%';
            }
        });
    };
    Render.prototype.nextHandler = function () {
        var _this = this;
        this.nextBtn.addEventListener('click', function () {
            var iteration = _this.iterator.next();
            if (!iteration.done) {
                _this.renderQuestion(iteration.value);
            }
            else {
                _this.renderTotals();
            }
        });
    };
    Render.prototype.stopHandler = function () {
        var _this = this;
        this.stopBtn.addEventListener('click', function () {
            _this.renderTotals();
        });
    };
    Render.prototype.refreshHandler = function (btn) {
        var _this = this;
        btn.addEventListener('click', function () {
            var firstQuestion = _this.iterator.refresh();
            _this.renderQuestion(firstQuestion.value);
            _this.card.setAttribute('style', 'display:block');
            _this.totalBlock.setAttribute('style', 'display:none');
            _this.totalBlock.innerHTML = '';
            _this.progress.setAttribute('style', 'width: 2em');
            _this.progress.innerText = '0%';
        });
    };
    Render.prototype.createListBtn = function (answer, idx) {
        var btn = document.createElement('button');
        btn.classList.add('list-group-item');
        btn.innerText = answer;
        btn.dataset.idx = idx;
        return btn;
    };
    Render.prototype.createRefreshBtn = function () {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn');
        btn.classList.add('btn-block');
        btn.classList.add('btn-primary');
        btn.innerText = 'Начать с начала';
        this.refreshHandler(btn);
        return btn;
    };
    Render.prototype.createAlert = function (state, title, total) {
        var alert = document.createElement('div');
        alert.classList.add('alert');
        alert.classList.add(state);
        alert.innerHTML = '<strong> ' + title + ' </strong>Вы ответили на ' + total + '%' + ' вопросов.';
        return alert;
    };
    Render.prototype.renderQuestion = function (question) {
        var _this = this;
        this.listEl.innerHTML = '';
        this.nextBtn.setAttribute('disabled', 'disabled');
        this.iterator.setValidId(question.validId);
        this.questionEl.innerText = question.question + '?';
        question.answers.forEach(function (answer, idx) {
            _this.listEl.appendChild(_this.createListBtn(answer, String(idx)));
        });
    };
    Render.prototype.renderTotals = function () {
        var total = Number(this.iterator.calcTotlaPercent().toFixed(1));
        var title;
        var state;
        if (total < 60) {
            title = 'Тест не сдан!';
            state = 'alert-danger';
        }
        else {
            title = "Тест сдан!";
            state = 'alert-success';
        }
        this.totalBlock.innerHTML = '';
        var h2 = document.createElement('h2');
        h2.innerText = 'Итоги:';
        this.totalBlock.appendChild(h2);
        var alert = this.createAlert(state, title, total);
        this.totalBlock.appendChild(alert);
        var btn = this.createRefreshBtn();
        this.totalBlock.appendChild(btn);
        this.card.setAttribute('style', 'display:none');
        this.totalBlock.setAttribute('style', 'display:block');
    };
    return Render;
}());
window.addEventListener('load', function () {
    var test = new Test();
    var iterator = test.getIterator();
    var render = new Render(iterator);
    var request = new XMLHttpRequest();
    request.onload = function () {
        var data = JSON.parse(this.response);
        render.renderQuestion(data[0]);
        data.forEach(function (question) { return test.add(question); });
    };
    request.open('GET', '/TestApp/BD.json');
    request.send();
});
//# sourceMappingURL=main.js.map