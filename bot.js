const tmi = require('tmi.js');
const env = require('dotenv');
const fs = require('fs/promises');
const TerminalFormatter = require('./utils/terminalFormatter');
const { currentTime } = require('./utils/common');

env.config();

class MyBot {
  tf = new TerminalFormatter();
  modulesList = {
    hsbg: require('./modules/hsbg/hsbg'),
  };

  constructor({ username, password, modules, permittedUsers, targetChannels }) {
    this.defaultChannel = targetChannels[0];
    const { tf, defaultChannel, modulesList } = this;
    const _channel = `#${defaultChannel}`;
    const { colorize, logToConsole } = tf;
    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username,
        password,
      },
      channels: targetChannels,
    });

    client
      .connect()
      .then(() => {
        logToConsole(colorize('green', `Bot started on ${currentTime()}`));
      })
      .catch((err) => {
        logToConsole(colorize('red', err));
        process.exit(0);
      });

    const context = { client, _channel, permittedUsers, defaultChannel };

    modules.forEach((module) => {
      if (!Object.keys(modulesList).includes(module))
        throw new Error(`Module "${module}" not found.`);

      new modulesList[module](context);
    });
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
    const {
      twitchUsername: username,
      twitchToken: password,
      modules,
      permittedUsers,
      targetChannels,
    } = data;

    const ctx = {
      username: username || process.env.TWITCH_USERNAME,
      password: password || process.env.TWITCH_TOKEN,
      modules: modules || [],
      permittedUsers,
      targetChannels,
    };

    new MyBot(ctx);
  })
  .catch((err) => {
    const { colorize, logToConsole } = new TerminalFormatter();
    logToConsole(colorize(`red`, err));
    process.exit(1);
  });

process.on('unhandledRejection', console.error); //TODO: log this error

/* 
  TODO:
    - readSettings into particular class
    - add "connectionsToApiNumber" in settings
*/
