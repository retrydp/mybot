const tmi = require('tmi.js');
const env = require('dotenv');
env.config();
function colorize(color, output) {
  return ['\033[', color, 'm', output, '\033[0m'].join('');
}
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.C,
    password: process.env.TWITCH_TOKEN,
  },
  channels: ['kykla66'],
});
client.connect().catch(console.error);
const currentTime = () =>
  new Date().toLocaleTimeString('en-US', { hour12: false });
client.on('message', (channel, tags, message, self) => {
  if (self) return;
  // if (message.toLowerCase() === '!hello') {
  //   client.say(channel, `@${tags.username}, heya!`);
  // }
  const nameTag = `<${currentTime()}>[channel:${channel}] ${tags.username} ${
    tags['message-type']
  }: `;
  const coloredTag = colorize(36, nameTag);
  process.stdout.write(coloredTag);
  console.log(message);
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
