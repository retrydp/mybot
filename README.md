# Mybot
This is twitchbot for display statistic from Hearthstone Battlegrounds.

## Available commands:

1.  !help - displays help message
2.  !bgrank [battletag] - displays message with current ranking of player
3.  !refresh - fetches data from Blizzard`s api, this command is available for moderators, and permitted users (users can be specified in settings.json)

## settings.json

- **"targetChannels"** - array of channels to connect, example: `["get_right", "s1mple"]`.
  First channel in list will be default channel for bot. If you want to link bot for only your channel set `["your_channel_name"]`;
- **"permittedUsers"** - array of users, whos allowed to use **!refresh** command, example:
  `["name1", "name2", "name3"]` ;
- **"twitchUsername"** - string value, name of twitch account (you bot/or your own);
- **"twitchToken"** - string value, access token to twitch, you can obtain this token by visiting https://twitchtokengenerator.com and authorize.

## Used stuff

- **Nodejs, Tmi.js**

## License - MIT

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
