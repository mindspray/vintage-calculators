const add2Numbers = (num1, num2 = 0) =>  +num1 + +num2;
const subtract2Numbers = (num1, num2 = 0) => +num1 - +num2;
const multiply2Numbers = (num1, num2 = num1) => +num1 * +num2;
const divide2Numbers = (num1, num2 = 1) => +num1 / +num2;

const operate = (num1, num2, operator) => operator(num1, num2);

function createElementsInDiv(
  divName,
  element,
  elementCount,
  elementClassNames,
  inSection // in which div section of calc (top, middle, bottom)
) {
  let elements = [];
  let div = document.createElement('div');
  div.className = divName;
  for (let i = 0; i < elementCount; i++) {
    elements.push(document.createElement(element));
    elements[i].className = elementClassNames[i];
  }
  div.append(...elements);
  inSection.append(div);
}
// for when more calc stylesheets are added
function changeDOMInit() {
  let link = document.querySelector('.currentCalc');
  link.href = './canon-palmtronic-8s.css';
}
changeDOMInit();

let palmtronics8s = {
  section: {
    top: document.querySelector('.calcTop'),
    mid: document.querySelector('.calcMid'),
    bottom: document.querySelector('.calcBottom'),
  },
  display: ['result'],
  button: {
    row1: ['sqrt', 'clr', 'clrInput', 'opMultiply'],
    row2: ['btnSeven', 'btnEight', 'btnNine', 'opDivide'],
    row3: ['btnFour', 'btnFive', 'btnSix', 'opSubtract'],
    row4: ['btnOne', 'btnTwo', 'btnThree', 'opAdd'],
    row5: ['btnZero', 'btnPeriod', 'btnPercentPlusMinus', 'equals'],
  },
  createCalc: function () {
    let allButtons = [
      ...this.button.row1,
      ...this.button.row2,
      ...this.button.row3,
      ...this.button.row4,
      ...this.button.row5,
    ];
    createElementsInDiv(
      'displayScreen',
      'p',
      this.display.length,
      this.display,
      this.section.mid
    );
    createElementsInDiv(
      'buttonGrid',
      'button',
      allButtons.length,
      allButtons,
      this.section.bottom
    );

    buttonHandler();
    displayResult('0');
  },
};

palmtronics8s.createCalc();

function numberHandler(buttonPressed, currentNumber) {
  switch (buttonPressed) {
    case 'btnOne':
      return "1";
    case 'btnTwo':
      return "2";
    case 'btnThree':
      return "3";
    case 'btnFour':
      return "4";
    case 'btnFive':
      return "5";
    case 'btnSix':
      return "6";
    case 'btnSeven':
      return "7";
    case 'btnEight':
      return "8";
    case 'btnNine':
      return "9";
    case 'btnZero':
      return "0";
    case 'btnPeriod':
      if (currentNumber.includes(".")) {
        return "";
      } else {
        return ".";
      }

    default:
      break;
  }
}

function buttonHandler() {
  let buttons = Array.from(document.querySelectorAll('button'));
  let [theNum, operator, result] = ["", "", ""];
  let [answerChain, prevOpsNoEquals, prevOpsAll] = [[],[], []];
  let [wasNumpadPressed, wasEqualsPressed] = [true, false];

  buttons.forEach((e) =>
    e.addEventListener('click', (e) => {
      let buttonPressed = e.target.className;
      wasEqualsPressed = (buttonPressed === "equals");
      // I need to disallow operations entered contiguously, but allow equals
      if(buttonPressed.substring(0, 2) === "op" || buttonPressed === "equals") {
        prevOpsAll.push(buttonPressed);
        if (prevOpsAll.length > 2) prevOpsAll.shift();
      }
      if(buttonPressed.substring(0, 2) === "op") {
        // no duplicate operations if numpad wasn't pressed in between
        if (buttonPressed === prevOpsNoEquals[prevOpsNoEquals.length] && wasNumpadPressed === false) {
          return;
        } else {
          // push button pressed to previous operations
          prevOpsNoEquals.push(buttonPressed);
          if (prevOpsNoEquals.length > 2) prevOpsNoEquals.shift();
        }
      }
      // build number to input in operation
      if(buttonPressed.substring(0, 3) === "btn"){
        wasNumpadPressed = true; // flag that numpad was pressed
        theNum += numberHandler(buttonPressed, theNum);
        displayResult(theNum);
        
      } else if (buttonPressed.substring(0, 2) === "op") {
        // push number that was built to the end of the answerChain
        // answerChain.push(theNum);
        // if (answerChain.length > 2) answerChain.shift();
        (!answerChain[0]) ? answerChain[0] = theNum : answerChain[1] = theNum;
        
        if (buttonPressed === "opAdd") {
          operator = add2Numbers;
        } else if ( buttonPressed === "opSubtract") {
          operator = subtract2Numbers;
        } else if (buttonPressed === "opMultiply") {
          operator = multiply2Numbers;
        } else if (buttonPressed === "opDivide") {
          operator = divide2Numbers;
        }

        console.log({wasEqualsPressed});

        if (wasEqualsPressed === false && prevOpsNoEquals[1]) {
          // Calculate result using numbers in answer chain and assign it to theNum
          theNum = operate(answerChain[0], answerChain[1], operator).toString();
          // assign result to first number position in answer chain
          answerChain[0] = theNum;
          printAll(answerChain);
        }
        
        displayResultBlink(theNum);
        theNum = "";
        
      } else if (buttonPressed === "equals") {
        if(answerChain.length === 0 || !operator) return; 
        answerChain[1] = theNum; // put the built number in the answer chain
        // if (answerChain.length > 2) answerChain.shift(); // Keep list to 2 items
        result = operate(answerChain[0], answerChain[1], operator).toString();
        displayResultBlink(result);
        answerChain = [result, answerChain[1]];
        
      } else if (buttonPressed === "clr" || buttonPressed === "clrInput") {
        theNum = "";
        answerChain = [];
        prevOpsNoEquals = [];
        displayResultBlink("0");
      }
      
      console.log({theNum});
      console.log({result});
      printAll(answerChain);
      printAll(prevOpsNoEquals);
    })
  );
}

function printAll (array) {
  array.forEach((element, index) => console.log(`${index}: ${element}`));
}

function displayResult(value) {
  document.querySelector(".result").textContent = value;
}

function displayResultBlink(value) {
  let result = document.querySelector(".result");
  result.style.setProperty("color", "rgb(0,0,0,0)");
  setTimeout(() => result.style.setProperty("color", "#409b96"), 50);
  result.textContent = value;
}
