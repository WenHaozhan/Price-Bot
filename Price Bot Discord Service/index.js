const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const {token} = require('./config.json');
const express = require('express')

const client = new Client({ intents : [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}  

const app = require('./expressapp')(client);
app.use(express.json());
client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
	c.user.setPresence({
		status: 'online',
		activities: [{
			name: "/Slash Commands",
			type: ActivityType.Listening
		}],
		afk: false

	});
	// client.user.setStatus('online');
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// client.on(Events.Error, (error) => {
// 	console.log(error);
// });

// client.on(Events.Debug, (info) => {
// 	console.log(info);
// });

// client.on(Events.Warn, () => {

// });
let server = app.listen(app.get('port'), ()=>{console.log("Listening")});
client.login(token);

process.on('SIGINT', async () => {
	if (client.isReady()) {
		await client.destroy();
		console.log('Client Terminated');
	}
	server.close();
    console.log("Exit");
    process.exit(0);
});

