const logger = require("log4js").getLogger();
const {Server} = require('../misc/dbObjects');
const {MessageEmbed} = require('discord.js');
const tools = require('../misc/tools');
const pm = require('pretty-ms');

module.exports = async (bot, member) => {
    let embed = new MessageEmbed().setTimestamp();
    let date = new Date();

    let fetchedLogs;

    try {
        fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
    } catch (err) {
        logger.error(err);
    }


    if (!fetchedLogs)
        return;

    const kickLog = fetchedLogs.entries.first();

    if (
        !kickLog ||
        isClose(kickLog.createdTimestamp, date)
    )
        return;

    const {executor, target, reason} = kickLog;

    if (executor.bot)
        return;

    if (target.id === member.id) {
        embed.setTitle('User kicked')
            .setColor(bot.embedColors.kick)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible moderator:** ${executor.tag}`)
            .setFooter(`ID: ${member.id}`);
    } else {
        logger.warn('Failed to load the audit log!');
    }

    await tools.modlog(member, embed);
};

function isClose(logTime, programTime) {
    let logDate = new Date(logTime);
    let diff = programTime - logDate;

    return diff > 1000
}