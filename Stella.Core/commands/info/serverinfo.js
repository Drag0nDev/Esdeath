const {MessageEmbed} = require('discord.js');
const tools = require('../../misc/tools');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="serverinfo help">
    name: 'serverinfo',
    aliases: ['sinfo'],
    category: 'info',
    description: 'see info about the server',
    usage: '[command | alias]',
    examples: ['s!sinfo', 's!sinfo 418037700751261708', 's!sinfo @Drag0n#6666'],
    //</editor-fold>
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //<editor-fold defaultstate="collapsed" desc="Used variable declarations">
        //simplify the guild
        let guild = message.guild;

        //find the owner and all his/her info
        let owner = guild.members.cache.get(guild.ownerID);

        //find the amount of bots in the server
        let bots = tools.getBots(guild);

        //check the amount of each channel sort
        let textCh = tools.getChannelAmount(guild.channels.cache, 'text');
        let voiceCh = tools.getChannelAmount(guild.channels.cache, 'voice');
        let categoryCh = tools.getChannelAmount(guild.channels.cache, 'category');

        let channelString = `**Categories:** ${categoryCh}\n` +
            `**Text channels:** ${textCh}\n` +
            `**Voice channels:** ${voiceCh}`;

        //look for the system channel
        let systemchannel = getSystemChannel(guild);

        //look for AFK channel
        let afkChannel = getAfkChannel(guild);

        //get the date
        let date = tools.getDate(guild.createdTimestamp);
        //</editor-fold>

        //<editor-fold defaultstate="collapsed" desc="embed creation">
        embed.setTitle(guild.name)
            .setThumbnail(guild.iconURL({
                dynamic: true,
                size: 4096
            }))
            .addFields(
                {name: `Id`, value: `${guild.id}`, inline: true},
                {name: `Owner`, value: `${owner.user.username}#${owner.user.discriminator}`, inline: true},
                {name: `Users`, value: `${guild.memberCount}`, inline: true},
                {name: `Bots`, value: `${bots}`, inline: true},
                {name: `Creation date`, value: `${date}`, inline: true},
                {name: `Channels`, value: `${channelString}`, inline: true},
                {name: `System channel`, value: `${systemchannel}`, inline: true},
                {name: `AFK voice channel`, value: `${afkChannel}`, inline: true},
                {name: `Region`, value: `${guild.region}`, inline: true},
                {name: `Verification level`, value: `${guild.verificationLevel}`, inline: true},
                {name: `Boost tier`, value: `${guild.premiumTier}`, inline: true},
                {name: `Boosts`, value: `${guild.premiumSubscriptionCount}`, inline: true},
            );
        //</editor-fold>

        await message.channel.send(embed);
    }
}

// <editor-fold defaultstate="collapsed" desc="used functions">
function getSystemChannel(guild){

    //check for null on guld.systemChannel
    if(!guild.systemChannel) return `-`;

    let systemchannel = guild.channels.cache.get(guild.systemChannelID);

    return systemchannel.name;
}

function getAfkChannel(guild){

    //check for null on guld.systemChannel
    if(!guild.afkChannelID) return `-`;

    let afkChannel = guild.channels.cache.get(guild.afkChannelID);

    return afkChannel.name;
}
//</editor-fold>