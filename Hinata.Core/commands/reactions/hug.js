const {MessageEmbed} = require('discord.js');
const {Servers} = require('../../misc/tools');
const hug = require('../../misc/reactions.json').hug;

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'hug',
    category: 'reactions',
    description: 'Hug someone',
    usage: '[command | alias] <mention / id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        const reaction = {
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            userMentions: [],
            members: '',
        }

        if (args[0])
            reaction.members = await Servers.getMembers(message, args, reaction.userMentions);

        if (message.mentions.everyone > 0)
            reaction.members += '@everyone ';

        reaction.author = message.guild.members.cache.get(message.author.id);

        reaction.embed.setImage(getGif())
            .setFooter('Powered by lost hopes and dreams');

        if (reaction.members.length === 0) {
            reaction.userMentions.push(reaction.author.user.id)
            reaction.text = `*hugs* ${reaction.author}!`;
        } else
            reaction.text = `${reaction.members}you have been hugged by **${reaction.author.nickname === null ? reaction.author.user.username : reaction.author.nickname}**!`;

        await message.channel.send(
            {
                content: reaction.text,
                embed: reaction.embed,
                allowedMentions: {
                    users: reaction.userMentions,
                }
            }
        );
    }
}

function getGif() {
    return hug[getRandom(hug.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}