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
  LOG_TARGETS = [
    'byme69',
    'blackgeneralgenagenerator',
    'latatatum',
    'molomus',
    'mr_bonger',
    'alpaca_m',
    'olkikz',
    'chakralounge',
    'mrtwentytwo',
    'k0smos95',
    'kykla66',
    'logika17',
    'izanami_dav',
    'goblak333',
    'sportmafia',
    'dysheboy',
    'yachmen2424',
  ];
  CHANNELS = ['k0smos95', 'kykla66', 'chakralounge'];

  constructor() {
    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_TOKEN,
      },
      channels: this.CHANNELS,
    });

    client
      .connect()
      .then(() =>
        process.stdout.write(
          this.colorize(
            this.TERM_COLORS.green,
            `Bot started on ${this.currentTime()}\n`
          )
        )
      )
      .catch((err) => {
        process.stdout.write(this.colorize(this.TERM_COLORS.lightRed, err));
        process.exit(0);
      });

    client.on('message', (...args) => {
      const [channel, userstate, message, self] = args;
      if (self) return;
      this.watcher(...args);
      this.logger(...args);
    });
  }

  logFilePathHandler(channelName) {
    return `./logs/${channelName.substring(1)}.txt`;
  }

  colorize(color, output) {
    return ['\x1b[', color, 'm', output, '\x1b[0m'].join('');
  }

  currentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  watcher(channel, tags, message) {
    if (this.LOG_TARGETS.includes(tags.username)) {
      fs.appendFile(
        this.logFilePathHandler(channel),
        `<${this.currentTime()}>[channel:${channel}] ${
          tags.username
        }: ${message}\n`,
        (err) => {
          if (err) {
            process.stdout.write(this.colorize(this.TERM_COLORS.lightRed, err));
            process.exit(0);
          }
        }
      );
      process.stdout.write(
        this.colorize(
          this.TERM_COLORS.blue,
          `Captured ${tags.username}'s message [channel:${channel}].\n`
        )
      );
    }
  }

  logger(channel, tags, message) {
    const formatted = `<${this.currentTime()}>[${channel}] ${this.colorize(
      this.TERM_COLORS.red,
      tags['display-name']
    )}: ${message}\n`;

    process.stdout.write(formatted);
  }
}

const bot = new MyBot();

// client.on('redeem', (channel, username, rewardType, tags, message) => {
//  process.stdout.write(
//     `<${currentTime()}>Triggered redeemed: ${username} -> ${rewardType}`
//   );
// });
// client.on('join', function (channel, username) {
//  process.stdout.write(`<${currentTime()}>Triggered join: <%s>`, username);
// });

// client.on('notice', (channel, msgid, message) => {
//  process.stdout.write(`-------------------------`);
//  process.stdout.write(
//     `<${currentTime()}>Triggered notice: msgid -> %s, message -> %s `,
//     msgid,
//     message
//   );
//  process.stdout.write(`-------------------------`);
// });
