class TerminalFormatter {
  terminalColors = {
    white: 97,
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    gray: 90,
    lightRed: 91,
    lightGray: 37,
    lightGreen: 92,
    lightYellow: 93,
    lightBlue: 94,
    lightMagenta: 95,
    lightCyan: 96,
  };

  colorize = (color, output) => {
    return `\x1b[${this.terminalColors[color]}m${output}\x1b[0m`;
  };

  logToConsole(text) {
    process.stdout.write(text + '\n');
  }
}

module.exports = TerminalFormatter;
