const {MessageEmbed} = require('discord.js');
const {Servers} = require('../../misc/tools');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'grope',
    category: 'reactions',
    description: 'Grope someone',
    usage: '[command | alias] <mention / id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let userMentions = [];
        let text;
        let members = '';

        if (!message.channel.nsfw) {
            embed.setDescription('This command can only be used in an NSFW marked channel!');
            return message.channel.send(embed);
        }

        if (args[0]) {
            Servers.getMembers(message, args, userMentions).then(membersPromise => {
                members = membersPromise;
            });
        }

        if (message.mentions.everyone > 0)
            members += '@everyone ';

        let author = message.guild.members.cache.get(message.author.id);

        embed.setImage(getGif(bot).toString())
            .setFooter('Powered by lost hopes and dreams');

        if (members.length === 0) {
            userMentions.push(author.user.id)
            text = `*Gropes ${author}, lewd!*`;
        } else
            text = `${members}you have been groped by **${author.nickname === null ? author.user.username : author.nickname}**!`;

        await message.channel.send(
            {
                content: text,
                embed: embed,
                allowedMentions: {
                    users: userMentions,
                }
            }
        );
    }
}

function getGif(bot) {
    return bot.reactions.grope[getRandom(bot.reactions.grope.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}