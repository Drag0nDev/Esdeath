const {MessageEmbed} = require('discord.js');
const {Shop, Category} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Minor} = require('../../misc/tools');
const {Op} = require('sequelize');

module.exports = {
    name: 'shop',
    category: 'items',
    description: 'Add an item to the shop.\n',
    usage: '[command | alias] <sortstyle> <name>',
    examples: ['s!shop -n diamond ring -c badge '],
    run: async (bot, message, args) => {
        let shop = {
            item: {
                name: '',
                category: '',
            },
            embed: new MessageEmbed().setTitle('Shop'),
            nameReg: new RegExp('-n', 'i'),
            catReg: new RegExp('-c', 'i'),
            str: args.join(' '),
        };
        shop.array = [shop.nameReg.exec(shop.str), shop.catReg.exec(shop.str)];

        for (let i = 0; i < shop.array.length; i++) {
            let input = shop.array[i];

            if (input !== null)
                switch (input[0]) {
                    case '-n':
                        shop.item.name = getValue(shop.str, input, shop.nameReg, shop.array, i);
                        break;
                    case '-c':
                        shop.item.category = getValue(shop.str, input, shop.catReg, shop.array, i);
                        break;
                }
        }

        if (shop.item.name === '' && shop.item.category === '') {
            await shopMenu(bot, message, shop);
        } else if (shop.item.name !== '' && shop.item.category === '') {
            await shopByName(bot, message, shop);
        } else if (shop.item.name === '' && shop.item.category !== '') {
            await shopByCategory(bot, message, shop);
        } else {
            await shopByNameAndCat(bot, message, shop);
        }
    }
}

async function shopMenu(bot, message, shop) {
    shop.categoryDb = await Category.findAll();
    shop.str = '';

    for (let cat of shop.categoryDb) {
        shop.str += '- ' + cat.name + '\n';
    }

    shop.embed.setDescription('**Select a category to view its content.\n' +
        's!shop -c <category>**\n\n' + shop.str)
        .setColor(bot.embedColors.normal)
        .setTimestamp();

    await message.channel.send(shop.embed);
}

async function shopByName(bot, message, shop) {
    shop.db = await Shop.findAll({
        where: {
            name: {
                [Op.substring]: shop.item.name
            }
        },
        include: [Category],
        order: [
            ['category', 'ASC'],
        ]
    });

    shop.embed.setColor(bot.embedColors.normal)
        .setTimestamp();

    if (shop.db.length === 0) {
        shop.embed.setDescription(`No items found with name **${shop.item.name}**!`);

        return;
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, shop);
}

async function shopByCategory(bot, message, shop) {
    shop.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: shop.item.category
            }
        }
    });

    shop.db = await Shop.findAll({
        where: {
            category: shop.categoryDb.id
        },
        include: [Category],
        order: [
            ['category', 'ASC'],
            ['name', 'ASC']
        ]
    });

    shop.embed.setColor(bot.embedColors.normal)
        .setTimestamp();

    if (shop.db.length === 0) {
        shop.embed.setDescription(`No items found with name **${shop.item.name}**!`);

        return;
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, shop);
}

async function shopByNameAndCat(bot, message, shop) {
    shop.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: shop.item.category
            }
        }
    });

    shop.db = await Shop.findAll({
        where: {
            name: {
                [Op.substring]: shop.item.name
            },
            category: shop.categoryDb.id
        },
        include: [Category],
        order: [
            ['category', 'ASC'],
            ['name', 'ASC']
        ]
    });

    shop.embed.setColor(bot.embedColors.normal)
        .setTimestamp();

    if (shop.db.length === 0) {
        shop.embed.setDescription(`No items found with name **${shop.item.name}**!`);

        return;
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, shop);
}

function messageEditor(bot, message, shop) {
    message.channel.send(shop.embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);
            shop.page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 120000});

            collector.on('collect', async (reaction, user) => {
                shop.editEmbed = new MessageEmbed()
                    .setTitle(`Shop`)
                    .setColor(bot.embedColors.normal);

                if (reaction.emoji.name === '▶') {
                    shop.page++;
                    await pageEmbed(bot, message, shop);
                } else if (reaction.emoji.name === '◀') {
                    shop.page--;
                    if (shop.page < 0)
                        return;
                    await pageEmbed(bot, message, shop);
                }

                if (shop.editEmbed.fields.length !== 0) {
                    await messageBot.edit(shop.editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll();
            });
        });
}

async function pageEmbed(bot, message, shop) {
    for (let i = 10 * shop.page; (i < shop.page * 10) && (i < shop.db.length); i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true);
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`);
        }
    }

    shop.editEmbed.setFooter(`Page ${shop.page + 1}`);
}

function getValue(str, input, reg, array, i) {
    if (array[i + 1])
        return str.substring(input.index, array[i + 1].index).replace(reg, '').trim();
    else
        return str.substring(input.index).replace(reg, '').trim();
}