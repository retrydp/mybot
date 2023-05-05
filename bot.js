const tmi = require('tmi.js');
const env = require('dotenv');
const settings = require('./settings.json');
const fs = require('fs/promises');
const Refresher = require('./utils/battlegroundStatsParser');
env.config();

class MyBot {
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

  constructor() {
    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_TOKEN,
      },
      channels: settings.targetChannels,
    });

    client
      .connect()
      .then(() =>
        process.stdout.write(
          this.colorize(
            this.terminalColors.green,
            `Bot started on ${this.currentTime()}\n`
          )
        )
      )
      .catch((err) => {
        process.stdout.write(this.colorize(this.terminalColors.lightRed, err));
        process.exit(0);
      });

    client.on('message', (...args) => {
      const [channel, userstate, message, self] = args;
      if (self) return;
      if (
        message === '!refresh' &&
        settings.permittedUsers.includes(userstate.username)
      ) {
        const refresher = new Refresher();
        refresher
          .init()
          .then(() =>
            client.say(
              'retrydp',
              `@${userstate['display-name']}: Таблиця оновлена!`
            )
          )
          .catch(() => {
            client.say(
              'retrydp',
              `@${userstate['display-name']}: Помилка при оновленні таблиці!`
            );
          });
      }
      if (message.startsWith('!bgrank')) {
        const nickname = message.split(' ')[1];

        if (!nickname) {
          client.say('retrydp', 'Потрібно вказати нікнейм!');
          return;
        }
        this.searchUserInDatabaseAndSendResult(client, nickname);
      }
      this.logChat(...args);
    });
  }

  searchUserInDatabaseAndSendResult = (ctx, user) => {
    fs.readFile('./data/db.json')
      .then((data) => {
        const db = JSON.parse(data);
        const result = db.find(
          (el) => el.accountid.toLowerCase() === user.toLowerCase()
        );

        if (!result) {
          ctx.say(
            'retrydp',
            `@${userstate['display-name']}: Такий користувач не знайдений в базі!`
          );
          return;
        }
        ctx.say('retrydp', JSON.stringify(result));
      })
      .catch((err) => {
        ctx.say(
          'retrydp',
          'Помилка при завантаженні таблиці! Мабуть ви не обновили стату. (!refresh)'
        );
      });
  };

  logFilePathHandler(channelName) {
    return `./logs/${channelName.substring(1)}.txt`;
  }

  colorize(color, output) {
    return `\x1b[${color}m${output}\x1b[0m`;
  }

  currentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  // monitorChat(channel, tags, message) {
  //   if (settings.watchedUsers.includes(tags.username)) {
  //     fs.appendFile(
  //       this.logFilePathHandler(channel),
  //       `<${this.currentTime()}>[channel:${channel}] ${
  //         tags.username
  //       }: ${message}\n`,
  //       (err) => {
  //         if (err) {
  //           process.stdout.write(
  //             this.colorize(this.terminalColors.lightRed, err)
  //           );
  //           process.exit(0);
  //         }
  //       }
  //     );
  //     process.stdout.write(
  //       this.colorize(
  //         this.terminalColors.blue,
  //         `Captured ${tags.username}'s message [channel:${channel}].\n`
  //       )
  //     );
  //   }
  // }

  logChat(channel, tags, message) {
    const formatted = `<${this.currentTime()}>[${channel}] ${this.colorize(
      this.terminalColors.red,
      tags['display-name']
    )}: ${message}\n`;

    process.stdout.write(formatted);
  }
}

const bot = new MyBot();

/*TODO:
  - dopilit' settings.json, +flagi na (ne)otobrajeniya chatfeeda v consol'ke
  - mb napistat' otdel`nyy configurator dl9 nego
  - mb zapihnut' v nego token dl9 hotswap, esli sletit sessiya
  - zapilit' norm logger, otlavlivat' catches 
  - zapihnut' ves' text v constanty/obj dl9 multilanga
  - zapilit' multilang dl9 kajdogo usera
  - vynesti colorize v utils
  - parsit' stats ne tolko dl9 eu
  - method dl9 stdout.write + \n v samom bote, realizatsiya est' uje v battlegroundStatsParser
  - ne vse otvety bota letyat v pm!
  - initialize parser pri starte bota
*/
