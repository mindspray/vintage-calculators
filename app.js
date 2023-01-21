const add2Numbers = (num1, num2 = 0) =>  +num1 + +num2;
const subtract2Numbers = (num1, num2 = 0) => +num1 - +num2;
const multiply2Numbers = (num1, num2 = num1) => +num1 * +num2;
const divide2Numbers = (num1, num2 = 1) => +num1 / +num2;
const squareRoot = (num) => Math.sqrt(num);

const operate = (num1, num2, operator) => parseFloat(operator(num1, num2).toFixed(7));

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
  let [answerChain, prevOpsAll] = [[], []];

  buttons.forEach((e) =>
    e.addEventListener('click', (e) => {
      let buttonPressed = e.target.className;
      // if either an operation or equals is pressed and the second value isn't a duplicate
      if((buttonPressed.substring(0, 2) === "op" || buttonPressed === "equals" || buttonPressed === "sqrt") &&
      (prevOpsAll[1] !== buttonPressed)) {
        prevOpsAll.push(buttonPressed);
        if (prevOpsAll.length > 2) prevOpsAll.shift();
      }
      // build number to input in operation
      // limit to 8 digits
      // add 0 to start if just . is pressed first
      if(buttonPressed.substring(0, 3) === "btn"){
        if (!theNum[0] && buttonPressed === "btnPeriod") { theNum = "0." }
        theNum += numberHandler(buttonPressed, theNum);
        // if()
        theNum = theNum.includes(".") ? theNum.substring(0, 9): theNum.substring(0, 8);
        displayResult(theNum);
        
      } else if (buttonPressed.substring(0, 2) === "op") {
        // if first number is empty, set it to theNum
        // otherwise, set 2nd number to theNum
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

        if (buttonPressed !== "equals" && prevOpsAll[1]) {
          theNum = operate(answerChain[0], answerChain[1], operator).toString();
          // assign result to first number position in answer chain
          answerChain[0] = theNum;
          printAll(answerChain);
        } else if (result) {
          theNum = result;
        }
        
        displayResultBlink(theNum);
        theNum = "";
        
      } else if (buttonPressed === "equals") {
        /* if plus is pressed, then enter, and if second number chain number isn't set, set first number chain value to second, and proceed as normal */
        if(answerChain.length === 0 || !operator) return;
        if (answerChain[0]){
          if (theNum) {
          // if (answerChain[1]) {
              answerChain[1] = theNum;
              result = operate(answerChain[0], answerChain[1], operator).toString();
              answerChain = [result, answerChain[1]];
            // } else {
            //   result = operate(answerChain[0], answerChain[1], operator).toString();
            //   answerChain = [result, answerChain[1]];
            // }
          } else {
            result = operate(answerChain[0], answerChain[1], operator).toString();
            answerChain = [result, answerChain[0]];
          }
        }
        
        displayResultBlink(result);
        theNum = "";
        
      } else if (buttonPressed === "sqrt") {
        if (!theNum) return;
        if (theNum) {
          if (!answerChain[0]) {
            theNum = operate(theNum, null, squareRoot);
            answerChain[0] = theNum;
            displayResult(answerChain[0]);
          } else {
            theNum = operate(theNum, null, squareRoot);
            answerChain[1] = theNum;
            displayResult(answerChain[1]);
            }
        }
      }else if (buttonPressed === "clr" || buttonPressed === "clrInput") {
        theNum = "";
        if (buttonPressed === "clr") [result, answerChain, prevOpsAll] = ["",[],[]];
        displayResultBlink("0");
      }
      
      console.log({theNum});
      console.log({result});
      printAll(answerChain);
      printAll(prevOpsAll);
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
  result.style.setProperty("color", "rgba(0,0,0,0)");
  setTimeout(() => result.style.setProperty("color", "#409b96"), 50);
  result.textContent = value;
}
