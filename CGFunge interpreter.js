/* CGFunge interpreter

Goal

CGFunge is a 2-dimensional, positional programming language.
This means that execution of a CGFunge program follows a designated pattern on a grid of ASCII characters.
Each command in the language is a single character.
The most basic commands involve flow control:

'>' - Continue to the right
'<' - Continue to the left
'^' - Continue up
'v' - Continue down
'S' - Skip the next character and continue with the subsequent character
'E' - End the program immediately

Execution always starts on the first character of the first line and proceeds to the right. Spaces are ignored.
So, for example, the following are equivalent:

11+E

vE<
1 +
>1^

SE S+1<

The execution of the program entirely revolves around a stack consisting only of integers in the range [0 - 255].
Any digit encountered (0 - 9) is pushed onto the stack.
Arithmetic operators ('+', '-', '*') pop two operands from the stack and push the result onto the stack.
For subtraction, the top element on the stack is subtracted from the second element on the stack.
So, for example, the program "52 - E" would leave the value 3 on the stack.

The following commands perform other basic stack manipulation tasks:

'P' - Pop the top value
'X' - Switch the order of the top two stack values
'D' - Push a duplicate of the top value onto the stack

The quotation mark character ('"') toggles "string mode".
When in string mode, the ASCII codes for all characters encountered are pushed onto the stack.

The following commands perform stack-based logical flow control:

'_' - Pop the top value from the stack. If it is 0, continue to the right. Otherwise, go left.
'|' - Pop the top value from the stack. If it is 0, continue down. Otherwise, go up.

Output is performed with the following commands:

'I' - Pop the top integer from the stack and print it to stdout.
'C' - Pop the top integer from the stack and interpret it as an ASCII code, printing the corresponding character to stdout.
*/

function CGFunge() {
    this.input = [];
    this.output = '';
    this.stack = [];
    this.i = 0;
    this.j = 0;
    this.directions = {
        RIGHT: '>',
        LEFT: '<',
        UP: '^',
        DOWN: 'v'
    };
    this.direction = this.directions.RIGHT;
    this.stringMode = false;
    this.skip = false;
    this.end = false;
}

CGFunge.prototype.addLine = function(line) {
    this.input.push(line.split(''));
};

CGFunge.prototype.trace = function() {
    while (!this.end) {   
        if (!this.skip)
            this.testChar(this.input[this.i][this.j]);
        else
            this.skip = false;
        
        switch(this.direction) {
            case this.directions.RIGHT:
                this.j++;
                break;
            case this.directions.LEFT:
                this.j--;
                break;
            case this.directions.UP:
                this.i--;
                break;
            case this.directions.DOWN:
                this.i++;
                break;
        }
    }
    
    return this.output;
};

CGFunge.prototype.testChar = function(char) {
    if (this.stringMode) {
        if (char !== '"')
            this.stack.push(char.charCodeAt());
        else
            this.stringMode = !this.stringMode;
    }
    else {
        switch(true) {
            case /\d/.test(char):
                this.stack.push(char);
                break;
            case /[+\-*]/.test(char):
                if (this.stack.length > 1) {
                    var val1 = parseInt(this.stack.pop()),
                        val2 = parseInt(this.stack.pop()),
                        res;
                    switch(char) {
                        case '+' :
                            res = val1 + val2;
                            break;
                        case '-' :
                            res = Math.abs(val1 - val2);
                            break;
                        case '*' :
                            res = val1 * val2;
                            break;
                    }
                    this.stack.push(res.toString());
                }
                break;
            case /P/.test(char):
                this.stack.pop();
                break;
            case /X/.test(char):
                if (this.stack.length > 1) {
                    var val = this.stack[this.stack.length - 1];
                    this.stack[this.stack.length - 1] = this.stack[this.stack.length - 2];
                    this.stack[this.stack.length - 2] = val;
                }
                break;
            case /D/.test(char):
                if (this.stack.length > 0)
                    this.stack.push(this.stack[this.stack.length - 1]);
                break;
            case /[\^v><]/.test(char):
                this.direction = char;
                break;
            case /_/.test(char):
                this.direction = (this.stack.pop() === '0') ?
                    this.directions.RIGHT :
                    this.directions.LEFT;
                break;
            case /\|/.test(char):
                this.direction = (this.stack.pop() === '0') ?
                    this.direction = this.directions.DOWN :
                    this.direction = this.directions.UP;
                break;
            case /\"/.test(char):
                this.stringMode = !this.stringMode;
                break;
            case /I/.test(char):
                this.output += this.stack.pop();
                break;
            case /C/.test(char):
                this.output += String.fromCharCode(this.stack.pop());
                break;
            case /S/.test(char):
                this.skip = true;
                break;
            case /E/.test(char):
                this.end = true;
                break;
        }
    }
};

var input = [ '39DD1+*+DI  >11091+   v>v',
          'v  " on the wall"    < D ',
          '>>     "reeb fo"      v S',
          '0v<" bottles "        < C',
          'X>DSC_SvPD      _25*+Cv |',
          '       *v   IS        < P',
          '^IDX-1 <>  SC        0v X',
          'v   "pass it around"  < 1',
          '>    " ,nwod eno ekat" ^-',
          ' Sing it!   ^+55D-1X_ESD<'],
    cgFunge = new CGFunge();

for (var i = 0; i < input.length; i++)
    cgFunge.addLine(input[i]);

var result = cgFunge.trace();
console.log(result);
