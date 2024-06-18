class App {
  constructor() {
    const columns = 40;
    const rows = 24;
    const scale = 3;
    const characterSize = 8 * scale;

    let canvasElementIds = ["layer1", "layer2", "layer3"];
    let canvasElements = getElementsById(canvasElementIds);

    let containingElement = document.activeElement; // HTMLBodyElement

    // layers
    this.canvas = new LayeredCanvas(
      canvasElements,
      columns * characterSize,
      rows * characterSize
    );

    // fonts
    this.font = buildFont(
      atari8bitFont,
      [114, 187, 244, 255],
      [19, 81, 160, 255]
    );
    this.cursorFont = buildFont(
      cursorsFont,
      [114, 187, 244, 255],
      [0, 0, 0, 0]
    );

    // sound playback
    this.audio = new Audio("./Atari8BitKeyClick.mp3");
    this.audio.preload = "auto";
    this.playSound = function () {
      this.audio.play();
    };

    this.console = new Console(
      columns,
      rows,
      scale,
      this.font,
      this.cursorFont,
      [this.canvas.contexts2d[1], this.canvas.contexts2d[0]],
      containingElement,
      this.playSound.bind(this)
    );
  }
  async play() {
    // Print introduction
    this.console.print("Welcome to Guess my Number!\n\n");

    while (true) {
      this.console.print(`---------------------------------------\n`);

      // Pick a number between 1..10 inclusive
      let num = Math.trunc(Math.random() * 10) + 1;
      this.console.print(
        `I have picked a number between 1\n and 10 inclusive...guess my number!\n\n`
      );

      let answer;
      do {
        this.console.print(`What is your guess?`);

        // get the user's input as an integer number
        answer = Math.trunc(await this.console.input());

        if (answer < num) {
          this.console.print("Guess higher.\n\n");
        } else if (answer > num) {
          this.console.print("Guess lower.\n\n");
        }
      } while (answer !== num);

      this.console.print(
        `\nYou have correctly guessed\n my number (${num})!\n\n`
      );
    }
  }
}

window.onload = function () {
  window.app = new App();
  window.app.play();
};
