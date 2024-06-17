const NEWLINE = "\n";
const BACKSPACE = "\b";
const KEYCODE_BACKSPACE = 8;
class Console {
  constructor(
    columns,
    rows,
    scale,
    font,
    cursorFont,
    context2darray,
    containingElement,
    playSoundFn
  ) {
    this.font = font;
    this.cursorFont = cursorFont;
    this.context2d = context2darray[0];
    this.cursorContext2d = context2darray[1];
    this.columns = columns;
    this.rows = rows;
    this.buffersize = columns * rows;
    this.scale = scale;
    this.characterSize = 8 * scale;
    this.screenbuffer = new Array(columns * rows);
    for (let i = 0; i < this.buffersize; ++i) {
      this.screenbuffer[i] = " ";
    }
    this.cursor = { row: 0, column: 0 };

    this.isCursorBlinking = false;
    this.cursorBlinkState = true;
    this.cursorTimer = null;
    this.setCursorSkipABlink(false);

    this.containingElement = containingElement;
    this.playSoundFn = playSoundFn;

    this.startOfLine = { row: 0, column: 0 };
    this.endOfLine = { row: 0, column: 0 };

    //this.setInsertMode(true); // vs overstrike

    this.setKeyHandler();

    this.setCursorBlinking(true);
    this.render();
  }
  /*
  setInsertMode(value) {
    this._insertMode = value;
  }

  getInsertMode() {
    return this._insertMode;
  }
*/
  write(text) {
    this._write(text, false, true, false);
  }

  writeln(text) {
    this._write(text, true, true, false);
  }
  /*
    _moveRestOfLineToTheRight() {
        // from the cursor to endOfLine, move characters to the right
        let cursorOffset = this._bufferOffset(this.cursor);
        let endOfLineOffset = this._bufferOffset(this.endOfLine);
        // TODO :scroll on last line
        if (cursorOffset < endOfLineOffset) {
            for (var offset = endOfLineOffset - 1; offset >= cursorOffset; --offset) {
                this.screenbuffer[offset + 1] = this.screenbuffer[offset];
            }
        }
    }
*/

  // 1. move cursor to the beginning of next line
  //    b. cursor to beginning of line with possible scroll
  // 2. handle CR from text
  //    b. cursor to beginning of line with possible scroll
  //    c. reset start and end markers
  // 3. handle <return> key from keyboard
  //    a. capture text
  //    b. cursor to beginning of line with possible scroll
  //    c. reset start and end markers

  _incrementCursorPosition() {
    ++this.cursor.column;
    if (this.cursor.column >= this.columns) {
      this._handleCursorToNewline();
    }
  }

  _handleCursorToNewline() {
    ++this.cursor.row;
    this.cursor.column = 0;
    if (this.cursor.row >= this.rows) {
      this.scroll();
    }
  }

  _handleBackspace() {
    if (
      this._bufferOffset(this.cursor) > this._bufferOffset(this.startOfLine)
    ) {
      --this.cursor.column;
      if (this.cursor.column < 0) {
        this.cursor.column = this.columns - 1;
        if (this.cursor.row > 0) {
          --this.cursor.row;
        }
      }
    }

    this.screenbuffer[this._bufferOffset(this.cursor)] = " ";
  }

  _updateStartMarkerToCursorPosition() {
    this.startOfLine = shallowCopy(this.cursor);
  }

  _updateEndMarkerToCursorPosition() {
    this.endOfLine = shallowCopy(this.cursor);
  }

  _handleString(str, isFromKeyboard) {
    if (str !== null) {
      for (let ch of str) {
        this._handleCharacter(ch, isFromKeyboard);
      }
    }
  }

  _handleCharacter(ch, isFromKeyboard) {
    if (ch === NEWLINE) {
      if (isFromKeyboard) {
        // capture the text
        var inputText = this.captureEnteredText();
        console.log(`Entered text : '${inputText}'`);
      }
      this._handleCursorToNewline();

      // update the capture markers
      this._updateStartMarkerToCursorPosition();
      this._updateEndMarkerToCursorPosition();
    } else if (ch === BACKSPACE) {
      this._handleBackspace();
      this._updateEndMarkerToCursorPosition();
    } else {
      // add the character to the screen buffer
      this.screenbuffer[this._bufferOffset(this.cursor)] = ch;

      // increment the cursor position
      this._incrementCursorPosition();

      // update the capture markers
      if (!isFromKeyboard) {
        this._updateStartMarkerToCursorPosition();
      }
      this._updateEndMarkerToCursorPosition();
    }

    this.render();
  }

  _write(text, withNewLine, markStartOfLine, markEndOfLine) {
    for (var character of text) {
      if (character === "\n") {
        this.newline(true, false);
        continue;
      }
      //if (this.getInsertMode() == true) {
      //  this._moveRestOfLineToTheRight();
      //}
      this.screenbuffer[this._bufferOffset(this.cursor)] = character;
      ++this.cursor.column;
      if (this.cursor.column >= this.columns || character === "\n") {
        this.newline(false, false);
      }
    }

    if (withNewLine) {
      this.newline(true, false);
    }

    if (markStartOfLine) {
      this.startOfLine = shallowCopy(this.cursor);
      this.endOfLine = shallowCopy(this.cursor);
    } else if (markEndOfLine) {
      if (
        this._bufferOffset(this.cursor) > this._bufferOffset(this.endOfLine)
      ) {
        this.endOfLine = shallowCopy(this.cursor);
      } else {
        console.log(
          `vvvvv   this.endOfLine : (${this.endOfLine.row}, ${this.endOfLine.column})`
        );
        this._incrementPosition(this.endOfLine, text.length);
        console.log(`text : ${text}, text.length : ${text.length}`);
        console.log(
          `^^^^^   this.endOfLine : (${this.endOfLine.row}, ${this.endOfLine.column})`
        );
      }
    }
    this.render();
  }

  _incrementPosition(item, amount) {
    let offset = this._bufferOffset(item);
    offset += amount;
    offset = Math.min(this._maxBufferOffset(), offset);
    item.row = Math.trunc(offset / this.columns);
    item.column = offset - item.row * this.columns;

    //let remainder = offset % this.columns;
    //item.row = (offset - remainder) / this.columns;
    //item.column = offset;
  }

  captureEnteredText() {
    let startOfLineOffset = this._startOfLineOffset();
    let endOfLineOffset = this._bufferOffset(this.endOfLine);
    let countOfCharactersToCapture = endOfLineOffset - startOfLineOffset;
    let s = "";
    for (var i = 0; i < countOfCharactersToCapture; ++i) {
      s += this.screenbuffer[startOfLineOffset + i];
    }
    return s;
  }

  newline(isHardNewline, shouldCapture) {
    if (shouldCapture) {
      this.captureEnteredText();
    }
    ++this.cursor.row;
    this.cursor.column = 0;
    if (this.cursor.row >= this.rows) {
      this.scroll();
      --this.cursor.row;
      --this.startOfLine.row;
      --this.endOfLine.row;
    }
    if (isHardNewline) {
      this.startOfLine = shallowCopy(this.cursor);
      this.endOfLine = shallowCopy(this.cursor);
    }
    this.render();
  }

  backspace() {
    if (
      !(
        this.cursor.row == this.startOfLine.row &&
        this.cursor.column == this.startOfLine.column
      )
    ) {
      --this.cursor.column;
      if (this.cursor.column < 0) {
        this.cursor.column = this.columns - 1;
        --this.cursor.row;
      }
      this.screenbuffer[this.cursor.row * this.columns + this.cursor.column] =
        " ";
      this.endOfLine = shallowCopy(this.cursor);
    }
    this.render();
  }

  _cursorOffset() {
    let offset = this.cursor.row * this.columns + this.cursor.column;
    return offset;
  }

  _startOfLineOffset() {
    let offset = this.startOfLine.row * this.columns + this.startOfLine.column;
    return offset;
  }

  _bufferOffset(coordinates) {
    let offset = coordinates.row * this.columns + coordinates.column;
    return offset;
  }

  _maxBufferOffset() {
    return this.rows * this.columns - 1;
  }
  /*
  leftArrow() {
    this.setCursorSkipABlink(false);
    this.setCursorBlinkState(true);
    if (this._cursorOffset() > this._startOfLineOffset()) {
      --this.cursor.column;
      if (this.cursor.column < 0) {
        this.cursor.column = this.columns - 1;
        --this.cursor.row;
      }
    }
  }

  rightArrow() {
    this.setCursorSkipABlink(false);
    this.setCursorBlinkState(true);
    if (this._cursorOffset() < this._bufferOffset(this.endOfLine)) {
      ++this.cursor.column;
      if (this.cursor.column >= this.columns) {
        this.cursor.column = 0;
        ++this.cursor.row;
      }
    }
  }
*/
  scroll() {
    // move all lines up one line, add a new blank line to the bottom
    for (var lineIndex = 0; lineIndex < this.rows - 1; ++lineIndex) {
      // copy the line below to the line at lineIndex
      for (var columnIndex = 0; columnIndex < this.columns; ++columnIndex) {
        this.screenbuffer[lineIndex * this.columns + columnIndex] =
          this.screenbuffer[(lineIndex + 1) * this.columns + columnIndex];
      }
    }
    // blank out the last line
    for (var columnIndex = 0; columnIndex < this.columns; ++columnIndex) {
      this.screenbuffer[(this.rows - 1) * this.columns + columnIndex] = " ";
    }
    --this.cursor.row;
    --this.startOfLine.row;
    --this.endOfLine.row;
  }

  render() {
    let column = 0;
    let row = 0;
    for (let i = 0; i < this.buffersize; ++i) {
      let character = this.screenbuffer[i];
      if (this.font.hasOwnProperty(character)) {
        this.context2d.drawImage(
          this.font[character],
          this.characterSize * column,
          this.characterSize * row,
          this.characterSize,
          this.characterSize
        );
      } else {
        this.context2d.drawImage(
          this.font[" "],
          this.characterSize * column,
          this.characterSize * row,
          this.characterSize,
          this.characterSize
        );
      }
      ++column;
      if (column >= this.columns) {
        column = 0;
        ++row;
      }
    }
    this.renderCursor();
  }

  renderCursor() {
    this.cursorContext2d.fillStyle = "rgba(0, 0, 0, 0)";
    this.cursorContext2d.fillRect(
      0,
      0,
      this.characterSize * this.columns,
      this.characterSize * this.rows
    );

    this.cursorContext2d.drawImage(
      this.cursorFont[this.cursorBlinkState === true ? "full" : "hidden"],
      this.characterSize * this.cursor.column,
      this.characterSize * this.cursor.row,
      this.characterSize,
      this.characterSize
    );

    // Debugging : draw a box at the beginning of the "line"
    this.context2d.beginPath();
    this.context2d.strokeStyle = "blue";
    this.context2d.lineWidth = "2";
    this.context2d.rect(
      this.characterSize * this.startOfLine.column,
      this.characterSize * this.startOfLine.row,
      this.characterSize,
      this.characterSize
    );
    this.context2d.stroke();

    // Debugging : draw a box at the end of the "line"
    this.context2d.beginPath();
    this.context2d.strokeStyle = "yellow";
    this.context2d.rect(
      this.characterSize * this.endOfLine.column,
      this.characterSize * this.endOfLine.row,
      this.characterSize,
      this.characterSize
    );
    this.context2d.stroke();
  }

  setCursorBlinking(state) {
    if (this.isCursorBlinking === false && state === true) {
      // turn on blinking
      this.cursorTimer = window.setInterval(this.cursorTimerFn.bind(this), 500);
    }
    if (this.isCursorBlinking === true && state === false) {
      // turn off blinking
      if (this.cursorTimer) {
        window.clearInterval(this.cursorTimer);
        this.cursorTimer = null;
      }
    }
    this.isCursorBlinking = state;
  }

  cursorTimerFn() {
    if (this.cursorSkipABlink) {
      this.cursorSkipABlink = false;
      return;
    }
    let newState = !this.cursorBlinkState;
    this.setCursorBlinkState(newState);
  }

  setCursorBlinkState(state) {
    this.cursorBlinkState = state;
    this.renderCursor();
  }

  setCursorSkipABlink(state) {
    this.cursorSkipABlink = state;
  }

  setKeyHandler() {
    this.containingElement.addEventListener(
      "keypress",
      this.keyHandler.bind(this)
    );
    this.containingElement.addEventListener(
      "keydown",
      this.keyDownHandler.bind(this)
    );
  }

  keyHandler(event) {
    console.log("this.playSoundFn()");
    this.playSoundFn();
    console.log(`keyHandler('${event.key}')`);
    if (event.key === "Enter") {
      this._handleCharacter(NEWLINE, true);
    } else if (event.key === "Backspace") {
      this._handleCharacter(BACKSPACE, true);
    } else {
      this._handleString(event.key, true);
    }
  }

  keyDownHandler(event) {
    console.log(`keyDownHandler(${event.keyCode}, ${event.charCode})`);
    var key = event.keyCode || event.charCode;

    // Chrome doesn't give us "backspace" in the key handler,
    // so we have to catch it here
    if (key == KEYCODE_BACKSPACE) {
      this._handleCharacter(BACKSPACE, true);
      this.playSoundFn();
    }

    /*
    //console.log("keyDownHandler() - key : " + key);
    if (key == 8 || key == 46) {
      //this.backspace();
      //this.playSoundFn();
    }
    if (key == 37) {
      this.playSoundFn();
      this.leftArrow();
    }
    if (key == 39) {
      this.playSoundFn();
      this.rightArrow();
    }
      */
  }
}
