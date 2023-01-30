const add2Numbers = (num1, num2 = 0) =>  +num1 + +num2;
const subtract2Numbers = (num1, num2 = 0) => +num1 - +num2;
const multiply2Numbers = (num1, num2 = num1) => +num1 * +num2;
const divide2Numbers = (num1, num2 = 1) => +num1 / +num2;
const squareRoot = (num) => Math.sqrt(num);
const percentPlusMinus = (num1, num2, operator) => {
  let ans;
  if (operator === multiply2Numbers) {
    ans = num1 * (num2 * 0.01);
  } else if (operator === add2Numbers) {
    ans = +num1 + +(num1 * (num2 * 0.01));
  } else if (operator === subtract2Numbers) {
    ans = num1 - num1 * (num2 * 0.01);
  }
  return numberFormatter(ans);
};

const operate = (num1, num2, operator) => {
  if (num2 === "0" && operator === divide2Numbers) {
    return "💥EXPLODES💥";
  } else {
    return parseFloat(numberFormatter(operator(num1, num2).toFixed(7)));
  }

};

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
    row5: ['btnZero', 'btnPeriod', 'percentPlusMinus', 'equals'],
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

function numberFormatter(number) {
  if (!number) return;
  if (typeof number !== 'string') number = number.toString();
  return number.includes('.') ? number.substring(0, 9) : number.substring(0, 8);
}

function functionHandler (buttonPressed) {
  let operator;
  if (buttonPressed === "opAdd") {
    operator = add2Numbers;
  } else if ( buttonPressed === "opSubtract") {
    operator = subtract2Numbers;
  } else if (buttonPressed === "opMultiply") {
    operator = multiply2Numbers;
  } else if (buttonPressed === "opDivide") {
    operator = divide2Numbers;
  }
  return operator;
}

function buttonHandler() {
  let buttons = Array.from(document.querySelectorAll('button'));
  let [theNum, operator, result] = ["", "", ""];
  let [answerChain, prevOpsString, opsHistory] = [[], [], []];

  buttons.forEach((e) =>
    e.addEventListener('click', (e) => {
      let buttonPressed = e.target.className;
      // if either an operation or equals is pressed and the second value isn't a duplicate
      if(buttonPressed.substring(0, 3) !== "btn" &&
      (prevOpsString[1] !== buttonPressed)) {
        prevOpsString.push(buttonPressed);
        if (prevOpsString.length > 2) prevOpsString.shift();
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
        // This needs to be fixed to work with percentPlusMinus.
        // Also if num1 multiplication num2 equals happens, then a plus, display clears for some reason.
        if (prevOpsString[0] === "equals" && theNum) {
          answerChain = [theNum, null];
        }
        if ((theNum || answerChain[0] )&& prevOpsString[0] !== "percentPlusMinus") {
          (!answerChain[0]) ? answerChain[0] = theNum : answerChain[1] = theNum;
        } else if (!theNum && !answerChain[0]) {
          displayResultBlink("0");
          return;
        };
        
        operator = functionHandler(buttonPressed);
        
        if (opsHistory[opsHistory.length-1] !== operator) opsHistory.push(operator);
        if (opsHistory.length > 2) opsHistory.shift();
        console.log(opsHistory[0], opsHistory[1]);
        
        if (prevOpsString[0] === "percentPlusMinus" && (prevOpsString[1] === "opAdd" || prevOpsString[1] === "opSubtract"))  {
          console.log("percentPlusMinus test ran");
          displayResultBlink(result);
          return;
        }
        
        if (prevOpsString[0] === "equals") {
          displayResultBlink(answerChain[0]);
        } else {
          if (prevOpsString[1]) {
            answerChain[0] = operate(answerChain[0], answerChain[1], opsHistory[0]).toString();
            // assign result to first number position in answer chain
            // answerChain[0] = theNum;
            printAll(answerChain);
          } 
        }
        // else if (result) {
        //   theNum = result;
        // }
        
        displayResultBlink(answerChain[0]);
        theNum = "";
        
      } else if (buttonPressed === "equals") {
        /* Ok, so now 3+===... works, 3*===... works, but 3 + 3===... is failing. It creates 6, but then everything is added by 6. So that means the result is being set once to a variable, then it's adding that result  */
        // if(answerChain.length === 0 || !operator) return;
        if (theNum && !opsHistory[0]) {
          displayResultBlink(theNum);
          return;
        }
        // If a number has been entered or answerChain[1] is populated
        if (theNum || answerChain[1]) {
          // If a number has been entered or a result exists
          if (theNum || result) {
            if(theNum) answerChain[1] = theNum;
            console.log("route one");
            result = operate(answerChain[0], answerChain[1], operator).toString();
            answerChain = [result, answerChain[1]];
            // Runs when theNum isn't occupied and result isn't occupied
            // So when 3+4/=
          } else if (!theNum) { 
            console.log("route two");
            if (opsHistory[1] === divide2Numbers) {
              // What do I put here?
              result = operate(answerChain[0], 1, operator).toString();
              answerChain = [answerChain[0], result];
            }
            result = operate(answerChain[0], answerChain[1], operator).toString();
            answerChain = [result, answerChain[1]];
          }
          // This runs when theNum isn't occupied AND answerChain[1] isn't occupied, so 3+= or 3*=
        } else if (!theNum) {
          console.log("route 3");
          result = operate(answerChain[0], answerChain[1], operator).toString();
          answerChain = [result, answerChain[0]];

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
        if (buttonPressed === "clr") [result, answerChain, prevOpsString, opsHistory] = ["",[],[], []];
        displayResultBlink("0");
      } else if (buttonPressed === "percentPlusMinus") {
        if (answerChain[0]){
          if (theNum) {
            answerChain[1] = theNum;
            console.log({opsHistory});
            result = percentPlusMinus(answerChain[0], answerChain[1], opsHistory[opsHistory.length-1]).toString();
            answerChain = [answerChain[0], result];
          } else return;
        } else {
          result = "0";
        };
        displayResult(result);
        theNum = "";
      }
      
      console.log({theNum});
      console.log({result});
      printAll(answerChain);
      printAll(prevOpsString);
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
