const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const yt = require("youtube-info");


module.exports = {
    name: "play",
    category: "music",
    description: "epic music command that can play music",
     usage: "<link(youtube)/random stuff for search to play>",
 aliases: ["playmusic"],
    run: async (client, message, args, ops) => {
      
if (!message.member.voiceChannel) return message.channel.send('Please connect to a voice channel.');

    if (!args[0]) return message.channel.send('Sorry, please put something to search');

    let validate = await ytdl.validateURL(args[0]);
    if (!validate) {
      
      let commandFile = require("./search.js");
      return commandFile.run(client, message, args, ops);
    }

  let info = await ytdl.getInfo(args[0]);
//     let connection = await message.member.voiceChannel.join();
//     let dispatcher = await connection.playStream(ytdl(args[0], {
//         filter: 'audioonly'
//     }));

//     message.channel.send(`Now playing: ${info.title}`);

 let data = ops.active.get(message.guild.id) || {};

if(!data.connection) data.connection = await message.member.voiceChannel.join();
  if(!data.queue) data.queue = [];
  data.guildID = message.guild.id;

 data.queue.push({
   songTitle: info.title,
  dur: info.length_seconds,
  requester: message.author.tag,
   url: args[0],
   announceChannel: message.channel.id
 });




 if(!data.dispatcher) play(client, ops, data);
 else{
   message.channel.send(`Added to Queue: \`${info.title}\` | Requested By: ${message.author.username} | Duration: ${info.dur} seconds`);
   
   
 }

  ops.active.set(message.guild.id, data)
 async function play(client, ops, data) {


   client.channels.get(data.queue[0].announceChannel).send(`Now Playing: \`${data.queue[0].songTitle}\` | Requested By: ${data.queue[0].requester} | Duration: ${data.queue[0].dur} seconds`);
 
   data.dispatcher = await data.connection.playStream(ytdl(data.queue[0].url, { filter: 'audioonly' }));
   
   data.dispatcher.guildID = data.guildID;
   
    data.dispatcher.once('finish', function() {
        finish(client, ops, this);
    });
 
 }

function finish(client, ops, dispatcher) {
  
  let fetched = ops.active.get(dispatcher.guildID);
  
  fetched.queue.shift();

  if (fetched.queue.length > 0){

   ops.active.set(dispatcher.guildID, fetched);
      
      play(client, ops, fetched)

      } else {
        
        ops.active.delete(dispatcher.guildID);

    let vc = client.guilds.get(dispatcher.guildID).me.voiceChannel;

  if(vc) vc.leave();

 
      }
    }

    }

  
}