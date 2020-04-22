const { Client, MessageAttachment } = require('discord.js');
const client = new Client();

const fetch = require('node-fetch')



var canSend
var maxComic;
var lastComic = 'null';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

});

client.on('message', async msg => {
  
  if (msg.content.startsWith("XKCD")){
    
    canSend = true
    maxComic = 2295
    
    const { num } = await fetch(`https://xkcd.com/info.0.json`).then(response => response.json())
  
    maxComic = num
    var ComicID;
    var stuff = msg.content.split('?');
    
    if (stuff[1] == 'latest') {
      ComicID = maxComic
      
    } else if (stuff[1] == 'random') {
      ComicID = (Math.floor(Math.random() * maxComic) + 1)
      lastComic = ComicID
      
    } else if (stuff[1] == 'next') {
      if (lastComic == 'null' || lastComic == maxComic) {
        msg.channel.send("There isn't a next comic; here's a random comic for your trouble though.")
        ComicID = (Math.floor(Math.random() * maxComic) + 1)
        lastComic = ComicID
      } else{
        ComicID = lastComic + 1;
        
      }
    } else if (stuff[1] == 'last') {
      if (lastComic == 'null' || lastComic == maxComic) {
        msg.channel.send("There isn't a next comic; here's a random comic for your trouble though.")
        ComicID = (Math.floor(Math.random() * maxComic) + 1)
        lastComic = ComicID
      } else{
        ComicID = lastComic - 1;
        
      }
    } else {
      var numb = parseInt(stuff[1])
      if (numb <= maxComic && numb > 0){
        ComicID = numb
        lastComic = ComicID
      } else {
        msg.reply("That isn't a valid comic id there buddy; here's a random one instead!")
        ComicID = (Math.floor(Math.random() * maxComic) + 1)
        lastComic = ComicID
      }
      
    }
    if (canSend) {  
    fetch(`https://xkcd.com/` + ComicID + `/info.0.json`).then(res => res.json()).then(json => msg.channel.send(json.img))  
      canSend = false;
  }
  }
});



client.login(bot_secret_token)
