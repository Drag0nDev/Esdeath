const config = require("../../../config.json")
const {Permissions} = require('../../misc/tools');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'leaveguild',
    aliases: ['lg', 'ls', 'leaveserver'],
    category: 'owner',
    description: 'Make the bot leave a guild',
    usage: '[command | alias]',
    ownerOnly: true,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Leave Guild');

        //check if serverid is given
        if (!args[0]) {
            embed.setDescription(`No server id given`)
                .setColor(bot.embedColors.embeds.error);
            return message.channel.send(embed);
        }

        try {
            bot.guilds.cache.get(args[0])
                .leave()
                .catch(err => {
                    embed.setDescription(err)
                        .setColor(bot.embedColors.embeds.error);
                });
            embed.setDescription(`Left the guild **${bot.guilds.cache.get(args[0])}**`)
                .setColor(bot.embedColors.embeds.normal);
        } catch {
            embed.setDescription(`No server found with id: **${args[0]}**`)
                .setColor(bot.embedColors.embeds.error);
        }


        await message.channel.send(embed);
    }
}