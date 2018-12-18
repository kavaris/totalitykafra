const Discord = require('discord.js');
const Config = require('./config.json');

var client = new Discord.Client();
var lobbies = require('./lobbies.json');

var ongoing = {};

var MVPassigned = [];
var ETassigned = [];
var RIFTassigned = [];
var VALassigned = [];
var ANYassigned = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (!msg.content.startsWith(Config.Command)) return;

  if (msg.channel.id === lobbies.MVPLOBBY.Main) {

    if (MVPassigned.length >= lobbies.MVPLOBBY.Channels.length) return msg.channel.send("Maximum concurrent polls reached.")

    console.log(`Creating ongoing poll queue for message id: ${msg.id} in MVP lobby.`);
    ongoing[msg.id] = {"users": [], "type": "mvp"};
  
  } else if(msg.channel.id === lobbies.ETLOBBY.Main) {

    if (ETassigned.length >= lobbies.ETLOBBY.Channels.length) return msg.channel.send("Maximum concurrent polls reached.")

    console.log(`Creating ongoing poll queue for message id: ${msg.id} in ET lobby.`);
    ongoing[msg.id] = {"users": [], "type": "et"};

  } else if(msg.channel.id === lobbies.RIFTLOBBY.Main) {

    if (RIFTassigned.length >= lobbies.RIFTLOBBY.Channels.length) return msg.channel.send("Maximum concurrent polls reached.")

    console.log(`Creating ongoing poll queue for message id: ${msg.id} in RIFT lobby.`);
    ongoing[msg.id] = {"users": [], "type": "rift"};

  } else if(msg.channel.id === lobbies.VALLOBBY.Main) {

    if (VALassigned.length >= lobbies.VALLOBBY.Channels.length) return msg.channel.send("Maximum concurrent polls reached.")

    console.log(`Creating ongoing poll queue for message id: ${msg.id} in VAL lobby.`);
    ongoing[msg.id] = {"users": [], "type": "val"};

  } else if(msg.channel.id === lobbies.ANYLOBBY.Main) {

    if (ANYassigned.length >= lobbies.ANYLOBBY.Channels.length) return msg.channel.send("Maximum concurrent polls reached.")

    console.log(`Creating ongoing poll queue for message id: ${msg.id} in ANY lobby.`);
    ongoing[msg.id] = {"users": [], "type": "any"};

  } else return;

  
  await msg.react("🛡");
  await msg.react("❤");
  await msg.react("⛈");
  await msg.react("⚔");
  await msg.react("🏹");

});

client.on("messageReactionAdd", async (messageReaction, user) => {
  if (user.id == client.user.id) return;
  if (!ongoing[messageReaction.message.id]) return;
  if (ongoing[messageReaction.message.id].users.includes(user.id)) {
    return;
  }

  ongoing[messageReaction.message.id].users.push(user.id);
  console.log(`Added ${user.id} to ${messageReaction.message.id} poll lobby queue. Count ${ongoing[messageReaction.message.id].users.length}`);

  if (ongoing[messageReaction.message.id].users.length == 5) {
    await messageReaction.message.clearReactions();

    let type = ongoing[messageReaction.message.id].type;
    let lobby = -1;
    let idx;

    if (type == "mvp") {
      for (var i = 0; i < lobbies.MVPLOBBY.Length; i++) {
        if (!MVPassigned.includes(i)) { 
          lobby = lobbies.MVPLOBBY.Channels[i];
          idx = i;
          MVPassigned.push(i)
          break;
        }
      }
    } else if (type == "et") {
      for (var i = 0; i < lobbies.ETLOBBY.Length; i++) {
        if (!ETassigned.includes(i)) { 
          lobby = lobbies.ETLOBBY.Channels[i];
          idx = i;
          ETassigned.push(i)
          break;
        }
      }
    } else if (type == "rift") {
      for (var i = 0; i < lobbies.RIFTLOBBY.Length; i++) {
        if (!RIFTassigned.includes(i)) { 
          lobby = lobbies.RIFTLOBBY.Channels[i];
          idx = i;
          RIFTassigned.push(i)
          break;
        }
      }
    } else if (type == "val") {
      for (var i = 0; i < lobbies.VALLOBBY.Length; i++) {
        if (!VALassigned.includes(i)) { 
          lobby = lobbies.VALLOBBY.Channels[i];
          idx = i;
          VALassigned.push(i)
          break;
        }
      }
    } else if (type == "any") {
      for (var i = 0; i < lobbies.ANYLOBBY.Length; i++) {
        if (!ANYassigned.includes(i)) { 
          lobby = lobbies.ANYLOBBY.Channels[i];
          idx = i;
          ANYassigned.push(i)
          break;
        }
      }
    } 


    if (lobby == -1) return console.log("Max lobbies reached?");
    
    let users = [];

    for (var i in ongoing[messageReaction.message.id].users) {
      let m = messageReaction.message.guild.members.get(ongoing[messageReaction.message.id].users[i])

      m.addRole(messageReaction.message.guild.roles.get(lobby.Role))
      users.push(m.toString());
    }

    messageReaction.message.channel.send(`${users.join(', ')} have successfully formed a party! Please proceed to the respective text/voice channels.`);
    
    setTimeout(() => {
      for (var i in ongoing[messageReaction.message.id].users) {
        messageReaction.message.guild.members.get(ongoing[messageReaction.message.id].users[i])
          .removeRole(messageReaction.message.guild.roles.get(lobby.Role))
          .catch(console.log)

        messageReaction.message.guild.channels.get(lobby)
          .bulkDelete(100000)
          .catch(console.log)
      }
      
      delete ongoing[messageReaction.message.id];

      if (type == "mvp") {
        MVPassigned = MVPassigned.filter(item => !-- idx);
      } else if (type == "et") {
        ETassigned = ETassigned.filter(item => !-- idx);
      } else if (type == "rift") {
        RIFTassigned = RIFTassigned.filter(item => !-- idx);
      } else if (type == "val") {
        VALassigned = VALassigned.filter(item => !-- idx);
      } else if (type == "any") {
        ANYassigned = ANYassigned.filter(item => !-- idx);
      }

    }, 24*60*60000);
  }
});
client.on("messageReactionRemove", async (messageReaction, user) => {
  if (user.id == client.user.id) return;
  if (!ongoing[messageReaction.message.id]) return;
  if (ongoing[messageReaction.message.id].users.includes(user.id)) {
    let count = 0;

    messageReaction.message.reactions.forEach((r) => {
      if (r.users.get(user.id)) count++
    })

    if (count == 0) {
      ongoing[messageReaction.message.id].users = ongoing[messageReaction.message.id].users.filter(item => !-- user.id);
      console.log(`Removed ${user.id} from ${messageReaction.message.id} poll lobby queue. Count ${ongoing[messageReaction.message.id].users.length}`);
    }
    return;
  }
});

client.on('error', console.error); 

console.log('Initiating the login process...');
client.login(process.env.BOT_TOKEN);
