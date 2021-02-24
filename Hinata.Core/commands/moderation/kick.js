const {MessageEmbed} = require("discord.js");
const {Permissions, Servers, Logs, Compare} = require('../../misc/tools');
const neededPerm = ['KICK_MEMBERS'];

module.exports = {
    name: 'kick',
    category: 'moderation',
    description: 'Kick a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!kick @Drag0n#6666', 'h!kick @Drag0n#6666 being a bad boy'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const neededPerm = ['KICK_MEMBERS'];
        let reason = 'No reason provided';
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.kick).setTitle('User kicked');
        let guild = message.guild;

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to kick!');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });
        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        const canKick = Compare.compareRoles(author, member);

        //check if member is kickable
        if (!member.kickable) {
            return message.channel.send(`I can't kick **${member.user.tag}** due to role hierarchy!`);
        }

        //check if it is self kick, or bot kick
        if (member.user.id === message.author.id) {
            return message.channel.send("You can't kick yourself");
        }

        //check if the author has a higher role then the member
        if (!canKick)
            return message.channel.send(`You can't kick **${member.user.tag}** due to role hierarchy!`);

        await args.shift();

        //kick the member
        if (args[0])
            reason = args.join(' ');

        if (reason.length > 1000){
            embed.setColor(bot.embedColors.error)
                .setDescription('The reason is too long.\n' +
                    'Keep it under 1000 characters.')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        await member.createDM().then(async dmChannel => {
            await dmChannel.send(`\`You got kicked from **${guild.name}** with reason: **${reason}**!`);
        }).catch(error => {
            embed.addField('No DM sent', `${member.user.tag} was kicked but could not be DMed!`);
        });

        await member.kick(`${reason}`);
        message.channel.send(`**${member.user.tag}** got kicked for reason: **${reason}**`);

        const logEmbed = new MessageEmbed().setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.id}`);

        await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);
    }
}