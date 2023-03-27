const { Client } = require('discord.js-selfbot-v13');
const settings = require('./settings.json');
const client = new Client({checkUpdate: false});

let lastMsg;
let amount = 1000;
let call = 'H';
let nextCall = call;
let isRunning = false;
let intervalId = null;
let totalamount =  132640;
client.on('messageCreate', async (message) => {
  if (message.content === 'start') {
    if (isRunning) {
      await message.channel.send('The script is already running.');
      return;
    }
    isRunning = true;
    await message.channel.send('Starting...');
    intervalId = setInterval(() => {
      message.channel.send(`ocf ${amount} ${nextCall}`)
        .then(msg => {
          setTimeout(async () => {
            const fetchedMsgs = await message.channel.messages.fetch({ limit: 1 });
            const fetchedMsg = fetchedMsgs.first();
            if (fetchedMsg.content.includes('you won')) {
                totalamount += amount;
                console.log(`\x1b[1mYou Bet: ${amount}, And You Won!\x1b[0m\n current balance: ${totalamount}`);
              amount = 1000;
              nextCall = call;
            } else if (fetchedMsg.content.includes('you lost it all')) {
                totalamount -= amount;
                console.log(`\x1b[1mYou Bet: ${amount}, And You Loss!\x1b[0m\n current balance: ${totalamount}`);
              amount *= 2;
              nextCall = (nextCall === 'H') ? 'T' : 'H';
            } else {
              if (nextCall === call && lastMsg) {
                nextCall = (lastMsg.includes('you won')) ? call : (call === 'H') ? 'T' : 'H';
              }
            }
            lastMsg = fetchedMsg.content;
          }, 3000);
        })
        .catch(console.error);
    }, 15000);
  } else if (message.content === 'stop') {
    if (!isRunning) {
      await message.channel.send('The script is not running.');
      return;
    }
    isRunning = false;
    clearInterval(intervalId);
    await message.channel.send('The script has been stopped.');
  } else if (message.content.includes('captcha') || message.content.includes('verify that you are human!')) {
    if (isRunning) {
      isRunning = false;
      clearInterval(intervalId);
      await message.channel.send('The script has been stopped due to a captcha.');
    }
  }
});

client.login(settings.token);
