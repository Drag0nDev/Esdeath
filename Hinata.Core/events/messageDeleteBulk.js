const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, messages) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logRemove)
            .setTitle(`${messages.size} messages purged in ${messages.first().channel.name}`)
            .setFooter(`latest ${messages.size} shown`);
        let description = '';

        for (let i = 0; i < messages.size; i++) {
            const message = messages.values().next().value;

            if (message.author.bot) return;
            const author = message.author;

            if (message.content !== '')
                description += `**[${author.username}#${author.discriminator}]**: ${message.content}\n`;

            if (i%50 === 0) {
                embed.setDescription(description);
                await Logs.messageLog(messages.first().guild, embed);
                description = '';
            }
        }

        embed.setDescription(description);

        await Logs.messageLog(messages.first().guild, embed);
    } catch (err) {
        logger.error(err);
    }
}