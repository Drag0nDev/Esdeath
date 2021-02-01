const tools = require("../../misc/tools");
const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS'];

module.exports = {
    name: 'setmemberlog',
    aliases: ['sml', 'memberlog'],
    category: 'logging',
    description: 'Assign or create a member log channel for Stella.',
    usage: '[command | alias] <channelID>',
    examples: ['s!sm', 's!sm 763039768870649856', 's!sm #member-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const chan = new RegExp('[0-9]{17,}');
        let user = message.author;
        let guild = message.guild;

        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        await ServerSettings.findOne({
            where: {
                serverId: guild.id
            }
        }).then(async server => {
            if (!args[0]) {
                await guild.channels.create('member-log', {
                    type: "text",
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                        },
                        {
                            id: bot.user.id,
                            allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                        },
                        {
                            id: message.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL'],
                        }
                    ]
                }).then(channel => {
                    server.memberLogChannel = channel.id;

                    embed.setTitle('Set member log')
                        .setColor(bot.embedColors.normal)
                        .setDescription(`New member log created with name <#${channel.id}>`);
                });
            } else {
                if (!chan.test(args[0])) {
                    return embed.setTitle('Set member log')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                let channel = guild.channels.cache.get(chan.exec(args[0])[0]);

                if (!channel){
                    return embed.setTitle('Set member log')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                server.memberLogChannel = channel.id;

                embed.setTitle('Set member log')
                    .setColor(bot.embedColors.normal)
                    .setDescription(`member log channel set to <#${channel.id}>`);
            }

            server.save();
        });

        await message.channel.send(embed);
    }
}