const tmi = require('tmi.js');
const env = require('dotenv');
const fs = require('fs');
env.config();

const TERM_COLORS = {
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
  white: 97,
};
const LOG_FILE = './logs/log.txt';
const LOG_TARGETS = ['cohhilitionbot', 'suzunahara'];

function colorize(color, output) {
  return ['\033[', color, 'm', output, '\033[0m'].join('');
}

const currentTime = () =>
  new Date().toLocaleTimeString('en-US', { hour12: false });

const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_TOKEN,
  },
  channels: ['cohhcarnage'],
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const formatted = `<${currentTime()}>[channel:${channel}] ${colorize(
    TERM_COLORS.red,
    tags.username
  )} ${tags['message-type']}: ${message}\n`;

  process.stdout.write(formatted);
  if (LOG_TARGETS.includes(tags.username)) {
    fs.appendFile(
      LOG_FILE,
      `<${currentTime()}>[channel:${channel}] ${tags.username} ${message}\n`,
      (err) => {
        if (err) {
          console.log(err);
          process.exit(0);
        }
      }
    );
  }
});
client.on('redeem', (channel, username, rewardType, tags, message) => {
  console.log(
    `<${currentTime()}>Triggered redeemed: ${username} -> ${rewardType}`
  );
});
client.on('join', function (channel, username) {
  console.log(`<${currentTime()}>Triggered join: <%s>`, username);
});

client.on('notice', (channel, msgid, message) => {
  console.log(`-------------------------`);
  console.log(
    `<${currentTime()}>Triggered notice: msgid -> %s, message -> %s `,
    msgid,
    message
  );
  console.log(`-------------------------`);
});
