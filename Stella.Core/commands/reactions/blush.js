const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'blush',
    category: 'reactions',
    description: 'Show a blushing gif',
    usage: '[command | alias]',
    //</editor-fold>
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        embed.setImage(getGif(bot).toString())
            .setFooter('Powered by lost hopes and dreams');

        let text = `${message.author} is blushing!`;

        await message.channel.send(
            {
                content: text,
                embed: embed
            }
        );
    }
}

function getGif(bot) {
    return bot.reactions.blush[getRandom(bot.reactions.blush.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}