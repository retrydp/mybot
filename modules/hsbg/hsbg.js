const Refresher = require('../../utils/battlegroundStatsParser');
const fs = require('fs/promises');
const { currentTime } = require('../../utils/common');
const TerminalFormatter = require('../../utils/terminalFormatter');

class Hsbg {
  tf = new TerminalFormatter();

  constructor(context) {
    const { client, permittedUsers, _channel, defaultChannel } = context;
    this.defaultChannel = defaultChannel;
    const { isChannelEqual, tf, pmTag: toPrivate } = this;
    const { logToConsole, colorize } = tf;

    client.on('message', (...args) => {
      const [channel, userstate, message, self] = args;
      const requestingUser = userstate['display-name'];

      if (self) return;

      if (
        message === '!refresh' &&
        (permittedUsers.includes(userstate.username) || userstate.mod) &&
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
    fs.readFile('./modules/hsbg/data/db.json')
      .then((data) => {
        const { pmTag: toPrivate, defaultChannel } = this;
        const _channel = `#${defaultChannel}`;
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

  isChannelEqual(channelFromListener, defaultChannel) {
    return defaultChannel === channelFromListener;
  }

  logChat(channel, tags, message) {
    const timestamp = currentTime();
    const { logToConsole, colorize } = this.tf;
    const formatted = `<${timestamp}>[${channel}] ${colorize(
      'red',
      tags['display-name']
    )}: ${message}`;

    logToConsole(formatted);
  }

  pmTag(tag, text) {
    return `@${tag}: ${text}`;
  }
}

module.exports = Hsbg;
