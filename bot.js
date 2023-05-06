const tmi = require('tmi.js');
const env = require('dotenv');
const settings = require('./settings.json');
const fs = require('fs/promises');
const Refresher = require('./utils/battlegroundStatsParser');
const TerminalFormatter = require('./utils/terminalFormatter');

env.config();

class MyBot {
  defaultChannel = settings.targetChannels[0];
  tf = new TerminalFormatter();

  constructor(username, password) {
    const _channel = `#${this.defaultChannel}`;
    const toPrivate = this.pmTag;
    const { colorize, logToConsole } = this.tf;
    const isChannelEqual = this.isChannelEqual;
    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username,
        password,
      },
      channels: settings.targetChannels,
    });
    client
      .connect()
      .then(() =>
        logToConsole(colorize('green', `Bot started on ${this.currentTime()}`))
      )
      .catch((err) => {
        logToConsole(colorize('red', err));
        process.exit(0);
      });

    client.on('message', (...args) => {
      const [channel, userstate, message, self] = args;
      const requestingUser = userstate['display-name'];
      if (self) return;
      if (
        message === '!refresh' &&
        (settings.permittedUsers.includes(userstate.username) ||
          userstate.mod) &&
        isChannelEqual(channel, _channel)
      ) {
        const refresher = new Refresher();
        refresher
          .init()
          .then(() =>
            client.say(channel, toPrivate(requestingUser, `Таблиця оновлена!`))
          )
          .catch((err) => {
            logToConsole(colorize('red', err));
            client.say(
              channel,
              toPrivate(requestingUser, `Помилка при оновленні таблиці!`)
            );
          });
      }
      if (message.startsWith('!bgrank') && isChannelEqual(channel, _channel)) {
        const nickname = message.split(' ')[1];

        if (!nickname) {
          client.say(
            channel,
            toPrivate(requestingUser, 'Потрібно вказати нікнейм!')
          );
          return;
        }
        this.searchUserInDatabaseAndSendResult(
          client,
          nickname,
          requestingUser
        );
      }
      if (message === '!help' && isChannelEqual(channel, _channel)) {
        client
          .say(
            channel,
            toPrivate(
              requestingUser,
              `!bgrank nickname - показує інфу про місце гравця`
            )
          )
          .catch(console.log);
      }
      this.logChat(...args);
    });
  }

  searchUserInDatabaseAndSendResult = (ctx, user, requestingUser) => {
    fs.readFile('./data/db.json')
      .then((data) => {
        const toPrivate = this.pmTag;
        const _channel = this.defaultChannel;
        const db = JSON.parse(data);
        const result = db.find(
          (el) => el.accountid.toLowerCase() === user.toLowerCase()
        );

        if (!result) {
          ctx.say(
            _channel,
            toPrivate(requestingUser, `Такий користувач не знайдений в базі`)
          );
          return;
        }
        const statsMessage = toPrivate(
          requestingUser,
          `Гравець ${result.accountid} зараз на ${result.rank} з рейтингом ${result.rating}`
        );
        ctx.say(_channel, statsMessage);
      })
      .catch((err) => {
        const { logToConsole, colorize } = this.tf;
        logToConsole(colorize('red', err));
        ctx.say(
          this.defaultChannel,
          'Помилка при завантаженні таблиці! Мабуть ви не обновили стату. (!refresh)'
        );
      });
  };

  currentTime() {
    return new Date().toLocaleTimeString('ua-UA', { hour12: false });
  }

  isChannelEqual(channelFromListener, defaultChannel) {
    return defaultChannel === channelFromListener;
  }

  pmTag(tag, text) {
    return `@${tag}: ${text}`;
  }

  logChat(channel, tags, message) {
    const timestamp = this.currentTime();
    const { logToConsole, colorize } = this.tf;
    const formatted = `<${timestamp}>[${channel}] ${colorize(
      'red',
      tags['display-name']
    )}: ${message}`;

    logToConsole(formatted);
  }
}

async function readSettings() {
  const settings = await fs.readFile('./settings.json');
  if (!settings) {
    throw new Error('Unable to read/parse settings.json');
  }
  const opts = JSON.parse(settings.toString());
  return opts;
}

readSettings()
  .then((data) => {
    const login = data.twitchUsername || process.env.TWITCH_USERNAME;
    const token = data.twitchToken || process.env.TWITCH_TOKEN;
    new MyBot(login, token);
  })
  .catch((err) => {
    const { colorize, logToConsole } = new TerminalFormatter();
    logToConsole(colorize(`red`, err));
    process.exit(1);
  });
