const { SlashCommandBuilder } = require('discord.js');
const {internalAPI, websiteURL} = require('../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Configure items to receive notifications for'),
	async execute(interaction) {
        let response = await fetch(internalAPI + '/create-session', {
            method: 'post',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "userid" : interaction.user.id,
                "channelId" : interaction.channelId
            }) 
        });
        if (response.ok) {
            let id = await response.text();
            // This is not used
		    // await interaction.reply(`Click on the following link to go to setup ${websiteURL}/${id}`);
            await interaction.reply(`Click on the following link to go to setup ${websiteURL}/user/${interaction.user.id}/${interaction.channelId}`);
        } else {
            await interaction.reply(`Error ${await response.text()}`);
        }
	},
};