const tmi = require('tmi.js');
const env = require('dotenv');
const fs = require('fs');
env.config();

class MyBot {
  TERM_COLORS = {
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
  LOG_TARGETS = ['byme69', 'blackgeneralgenagenerator', 'latatatum'];
  CHANNELS = ['k0smos95'];

  constructor() {
    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_TOKEN,
      },
      channels: this.CHANNELS,
    });

    client.connect().catch(console.error);

    client.on('message', (...args) => {
      if (args.at(-1)) return;
      this.terminalLog(...args);
      this.fileLog(...args);
    });
  }

  logFilePathHandler(channelName) {
    return `./logs/${channelName}.txt`;
  }

  colorize(color, output) {
    return ['\x1b[', color, 'm', output, '\x1b[0m'].join('');
  }

  currentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  fileLog(channel, tags, message) {
    if (this.LOG_TARGETS.includes(tags.username)) {
      fs.appendFile(
        this.logFilePathHandler(channel),
        `<${this.currentTime()}>[channel:${channel}] ${
          tags.username
        } ${message}\n`,
        (err) => {
          if (err) {
            console.log(err);
            process.exit(0);
          }
        }
      );
    }
  }

  terminalLog(channel, tags, message) {
    const formatted = `<${this.currentTime()}>[channel:${channel}] ${this.colorize(
      this.TERM_COLORS.red,
      tags.username
    )} ${tags['message-type']}: ${message}\n`;

    process.stdout.write(formatted);
  }
}

const bot = new MyBot();

// const TERM_COLORS = {
//   white: 97,
//   black: 30,
//   red: 31,
//   green: 32,
//   yellow: 33,
//   blue: 34,
//   magenta: 35,
//   cyan: 36,
//   gray: 90,
//   lightRed: 91,
//   lightGray: 37,
//   lightGreen: 92,
//   lightYellow: 93,
//   lightBlue: 94,
//   lightMagenta: 95,
//   lightCyan: 96,
// };
// const LOG_FILE = (cname) => `./logs/${cname}.txt`;
// const LOG_TARGETS = ['byme69', 'blackgeneralgenagenerator', 'latatatum'];

// function colorize(color, output) {
//   return ['\033[', color, 'm', output, '\033[0m'].join('');
// }

// const currentTime = () =>
//   new Date().toLocaleTimeString('en-US', { hour12: false });

// const client = new tmi.Client({
//   options: { debug: false },
//   identity: {
//     username: process.env.TWITCH_USERNAME,
//     password: process.env.TWITCH_TOKEN,
//   },
//   channels: ['k0smos95'],
// });

// const fileLog = (channel, tags, message) => {
//   if (LOG_TARGETS.includes(tags.username)) {
//     fs.appendFile(
//       LOG_FILE(channel),
//       `<${currentTime()}>[channel:${channel}] ${tags.username} ${message}\n`,
//       (err) => {
//         if (err) {
//           console.log(err);
//           process.exit(0);
//         }
//       }
//     );
//   }
// };

// const terminalLog = (channel, tags, message) => {
//   const formatted = `<${currentTime()}>[channel:${channel}] ${colorize(
//     TERM_COLORS.red,
//     tags.username
//   )} ${tags['message-type']}: ${message}\n`;

//   process.stdout.write(formatted);
// };

// client.connect().catch(console.error);

// client.on('message', (...args) => {
//   if (args.at(-1)) return;
//   terminalLog(...args);
//   fileLog(...args);
// });

// client.on('redeem', (channel, username, rewardType, tags, message) => {
//   console.log(
//     `<${currentTime()}>Triggered redeemed: ${username} -> ${rewardType}`
//   );
// });
// client.on('join', function (channel, username) {
//   console.log(`<${currentTime()}>Triggered join: <%s>`, username);
// });

// client.on('notice', (channel, msgid, message) => {
//   console.log(`-------------------------`);
//   console.log(
//     `<${currentTime()}>Triggered notice: msgid -> %s, message -> %s `,
//     msgid,
//     message
//   );
//   console.log(`-------------------------`);
// });
