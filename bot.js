  require('dotenv').config()
  const { Client, GatewayIntentBits} = require('discord.js');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  const bot_secret_token = process.env.SECRET_TOKEN

  const UPDATE_FREQ = 15 * 60 * 1000;; // 15 minutes

  let state = {
    maxComic: 2943,
    lastComic: null,
    lastUpdate: 0
  }

  function getRandomId() {
    return Math.floor(Math.random() * state.maxComic) + 1;
  }

  async function getLatestComic() {
    const { num } = await fetch('https://xkcd.com/info.0.json')
      .then(response => response.json());
    return num ? num : state.maxComic;
  }

  function getComicId(arg) {
    let id = state.maxComic;
    let err = null;

    if (arg === 'latest') {
      id = state.maxComic;
    } else if (arg === 'random') {
      id = getRandomId();
    } else if (arg === 'next') {
      if (!state.lastComic) {
        id = getRandomId();
        err = "There isn't a comic to compare to; here's a random one instead!";
      } else {
        id = state.lastComic % state.maxComic + 1;
      }
    } else if (arg === 'previous') {
      if (!state.lastComic) {
        id = getRandomId();
        err = "There isn't a comic to compare to; here's a random one instead!";
      } else {
        id = state.lastComic === 1 ? state.maxComic : state.lastComic - 1;
      }
    } else {
      const num = parseInt(arg);
      if (num <= state.maxComic && num > 0) {
        id = num;
      } else {
        id = getRandomId();
        err = "That isn't a valid comic id; here's a random one instead!";
      }
    }

    return [id, err];
  }

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on('messageCreate', async msg => {
    if (!msg.content.startsWith("XKCD?")) { return; }

    const now = new Date();
    if (now - state.lastUpdate > UPDATE_FREQ) {
      state.lastUpdate = now;
      state.maxComic = await getLatestComic();
    }

    const stuff = msg.content.split('?');
    const arg = stuff[1] === "" ? "random" : stuff[1];

    if (arg === 'help') {
      msg.reply("XKCD Bot Usage:\n" +
        "`XKCD?help` - Send this help message\n" +
        "`XKCD?{num}` - Sends the `num`th XKCD. i.e. `XKCD?114`\n"  +
        "`XKCD?` - Send a random XKCD Comic\n" +
        "`XKCD?latest` - Send the most recent XKCD Comic\n" +
        "`XKCD?next` - Display the comic after the most recently sent one\n" +
        "`XKCD?previous` - Send the comic before the most recently sent one\n" +
        "`XKCD?random` - Send a random XKCD Comic\n");
    } else {
      let [comicId, err] = getComicId(arg);

      if (err) {
        msg.reply(err);
      }

      state.lastComic = comicId;
      fetch(`https://xkcd.com/${comicId}/info.0.json`)
        .then(res => res.json())
        .then(json => msg.reply(`XKCD ${comicId}: ${json.img}`));
    }
  });

  client.login(bot_secret_token);
