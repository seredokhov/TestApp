// Интерфейс коллекции
interface MyIterable<T> {
    getIterator(): MyIterator<T>;
}
// Интерфейс итератора коллекции
interface MyIterator<T> {
    next(): MyIteratorResult<T>;
}
// Интерфейс возвращаемого итератором значения
interface MyIteratorResult<T> {
    done: boolean;
    value: T;
}

// Шаблон вопроса
interface Question {    
    question: string,
    validId: number,
    answers: string[] 
}

// Коллекция
class Test implements MyIterable<Question> {
    private questions: Question[] = [];

    public add(question: Question) {
        this.questions.push(question);
    }

    getIterator() {
        return new TestIterator(this.questions)
    }
}

// Итератор
class TestIterator implements MyIterator<Question> {
    public answers: Array<any> = [];
    private currentAnswerId: number;
    private validAnswerId: number;    
    private current: number = 0;

    constructor(private questions: Question[]) {}

    public setAnswerId(id: number) {
        this.currentAnswerId = id;
    }
    public setValidId(id: number) {
        this.validAnswerId = id;
    }
    public calcExpectedPercent() {
        return ((this.answers.length + 1) * 100) / this.questions.length;
    }
    public calcTotlaPercent() {
        let validAnswers = this.answers.filter( (answer)=>answer );
        return ((validAnswers.length) * 100) / this.questions.length;
    }

    public next(): MyIteratorResult<Question> {
        (this.currentAnswerId === this.validAnswerId) ? this.answers.push(true) : this.answers.push(false);
        

        if(this.current < this.questions.length - 1) {
            return {
                done: false,
                value: this.questions[++this.current]
            };
        }
        else {
            return {
                done: true,
                value: null
            }
        }
    }
        
    public shuffleArray(array) : void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    public refresh(): MyIteratorResult<Question> {
        this.current = 0;
        this.answers = [];
        this.shuffleArray(this.questions);
        return {
            done: false,
            value: this.questions[this.current]
        };
    }
}


// Рендер
class Render {
    private iterator: TestIterator;
    private questionEl: HTMLElement;
    private listEl: HTMLElement;
    private nextBtn: HTMLElement;
    private stopBtn: HTMLElement;
    private progress: HTMLElement;
    private card: HTMLElement;
    private totalBlock: HTMLElement;

    constructor(iterator: TestIterator) {
        this.iterator = iterator;
        this.questionEl = document.getElementById('question');
        this.listEl = document.getElementById('list');
        this.nextBtn = document.getElementById('next');        
        this.stopBtn = document.getElementById('stop');
        this.progress = document.getElementById('progress');
        this.card = document.getElementById('card');
        this.totalBlock = document.getElementById('totals')
        
        this.answerHandler();
        this.nextHandler();
        this.stopHandler();
    }

    private answerHandler() {
        this.listEl.addEventListener('click', (e: MouseEvent) => {
            let buttonsArray = Array.prototype.slice.call(this.listEl.children);
            buttonsArray.forEach((btn)=> {
                btn.classList.remove('active');
            });
            if (e.target instanceof HTMLButtonElement) {
                let btn = e.target;
                let percent = this.iterator.calcExpectedPercent();
                btn.classList.add('active');
                this.nextBtn.removeAttribute('disabled');
                this.iterator.setAnswerId(Number(btn.dataset.idx));
                this.progress.setAttribute('style','width:' + percent +  '%');
                this.progress.innerText = percent.toFixed(1) + '%';
                }            
        });
    }

    private nextHandler() {
        this.nextBtn.addEventListener('click', () => {
            let iteration = this.iterator.next();
            if (!iteration.done) {
                this.renderQuestion(iteration.value);
            } else {
                this.renderTotals();
            }

        });
    }

    private stopHandler() {
        this.stopBtn.addEventListener('click', () => {
            this.renderTotals()
        })
    }
    private refreshHandler(btn) {
        btn.addEventListener('click',() => {
            let firstQuestion = this.iterator.refresh();
            this.renderQuestion(firstQuestion.value);
            this.card.setAttribute('style', 'display:block');
            this.totalBlock.setAttribute('style', 'display:none');
            this.totalBlock.innerHTML = '';
            this.progress.setAttribute('style','width: 2em');
            this.progress.innerText = '0%';
        });    
    }


    private createListBtn(answer: string, idx: string) {
        let btn = document.createElement('button')
        btn.classList.add('list-group-item');
        btn.innerText = answer;
        btn.dataset.idx = idx;
        return btn;
    }
    private createRefreshBtn() {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn');
        btn.classList.add('btn-block');
        btn.classList.add('btn-primary');
        btn.innerText = 'Начать с начала';
        this.refreshHandler(btn);
        return btn;
    }

    private createAlert(state: string, title: string, total: number) {
        let alert = document.createElement('div');
        alert.classList.add('alert');
        alert.classList.add(state);
        alert.innerHTML = '<strong> ' + title + ' </strong>Вы ответили на ' + total + '%' + ' вопросов.';
        return alert;
    }

    renderQuestion(question: Question): void {
        this.listEl.innerHTML = '';
        this.nextBtn.setAttribute('disabled', 'disabled');
        this.iterator.setValidId(question.validId);
        this.questionEl.innerText = question.question + '?';
        question.answers.forEach( (answer, idx) => {
            this.listEl.appendChild(this.createListBtn(answer, String(idx)));
        });
    }
    renderTotals() {        
        let total: number = Number(this.iterator.calcTotlaPercent().toFixed(1));
        let title: string;
        let state: string;
        if (total < 60 ) {
            title = 'Тест не сдан!';
            state = 'alert-danger';
        } else {
            title = "Тест сдан!";
            state = 'alert-success';
        }

        this.totalBlock.innerHTML = '';        
        let h2 = document.createElement('h2');
        h2.innerText = 'Итоги:';
        this.totalBlock.appendChild(h2);
        let alert = this.createAlert(state, title, total);
        this.totalBlock.appendChild(alert);
        let btn = this.createRefreshBtn();
        this.totalBlock.appendChild(btn);
        
        this.card.setAttribute('style', 'display:none');
        this.totalBlock.setAttribute('style', 'display:block');
    }
}



window.addEventListener('load', (): void => {
    const test: Test = new Test();
    const iterator: TestIterator = test.getIterator()
    const render: Render = new Render(iterator);

   
    // AJAX
    let request: XMLHttpRequest = new XMLHttpRequest();
    request.onload = function() {
        let data : Question[] = JSON.parse(this.response);
        iterator.shuffleArray(data);
        render.renderQuestion(data[0]);
        data.forEach( (question: Question) => test.add(question) );
    }
    request.open('GET', '/TestApp/BD.json');
    request.send();

});
