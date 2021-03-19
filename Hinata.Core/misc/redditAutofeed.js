const config = require("../../config.json");
const Snooper = require('reddit-snooper');
const {MessageEmbed} = require('discord.js');
const {Autofeeds} = require('./dbObjects');
const logger = require("log4js").getLogger();

const link = new RegExp('.(jpeg|jpg|png|gif)$');

const snooper = new Snooper({
    username: config.reddit.username,
    password: config.reddit.password,
    api_secret: config.reddit.secret,
    api_id: config.reddit.appId,

    automatic_retries: true,
    api_requests_per_minuite: 60
});

module.exports = {
    run: async function (bot, subreddit) {
        snooper.watcher.getPostWatcher(subreddit)
            .on('post', post => {
                const embed = new MessageEmbed()
                    .setAuthor(`Author: u/${post.data.author}`)
                    .setTitle(`Post link`)
                    .setURL(`https://www.reddit.com${post.data.permalink}`)
                    .setDescription(post.data.title)
                    .setFooter(post.data.subreddit)
                    .setTimestamp();

                Autofeeds.findAll({
                    where: {
                        subreddit: post.data.subreddit
                    }
                }).then(autofeeeds => {
                    autofeeeds.forEach(async autofeed => {
                            let server = await bot.guilds.cache.get(autofeed.serverId);
                            let channel = await server.channels.cache.get(autofeed.channel);

                            if (channel) {

                                if (post.data.subreddit === autofeed.subreddit) {
                                    if (link.test(post.data.url)) {
                                        if (post.data.over_18) {
                                            if (channel.nsfw) {
                                                embed.setImage(post.data.url);
                                            }
                                        } else {
                                            embed.setImage(post.data.url);
                                        }

                                        embed.setColor(bot.embedColors.logChange);
                                    } else if (post.data.selftext !== '') {
                                        let content
                                        if (post.data.selftext.length > 1018) {
                                            content = `${post.data.selftext.substring(0, 1018)} \`...\``;
                                        } else {
                                            content = post.data.selftext;
                                        }

                                        embed.addField('​', content)
                                            .setColor(bot.embedColors.logAdd);
                                    }

                                    server.fetchWebhooks()
                                        .then(async webhooks => {
                                            const webhook = webhooks.get(autofeed.webhookId);

                                            if (webhook) {
                                                await webhook.send(embed);
                                            } else {
                                                await Autofeeds.destroy({
                                                    where: {
                                                        id: autofeed.id
                                                    }
                                                });
                                            }
                                        }).catch(err => {
                                        logger.error(`error in: ${server.name}\n`, err);
                                    });
                                }
                            }
                        }
                    );
                });
            })
            .on('error', error => {
                if (error === 'Requested too many items (reddit does not keep this large of a listing)')
                    return;

                logger.error(error);
            });
    }
}
