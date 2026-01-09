const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { config } = require('../../../utils/env');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('High-performance dashboard-style help menu'),
    async execute(interaction, client, collections) {
        if (!collections) return interaction.reply({ content: 'Help system is initializing...', ephemeral: true });

        const totalCommands = collections.slashCommands.size + collections.contextCommands.size + new Set(collections.prefixCommands.values()).size;

        const mainEmbed = new EmbedBuilder()
            .setTitle(`🛡️ ${client.user?.username || 'Sentinel'} Information Dashboard`)
            .setColor('#FF4B4B')
            .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) || null)
            .setDescription(
                `Welcome to the **Sentinel** help menu. Use the selection menu below to navigate through different module categories and explore my capabilities.\n\n` +
                `**System Overview**\n` +
                `> 📊 **Total Commands:** \`${totalCommands}\` commands loaded\n` +
                `> 🌐 **Network:** Monitoring \`${client.guilds.cache.size}\` servers\n` +
                `> 👥 **Users:** Serving \`${client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0).toLocaleString()}\` members\n` +
                `> 📡 **Status:** Shard ID \`#${client.shard?.ids[0] ?? 0}\` Operational`
            )
            .addFields(
                {
                    name: '🛠️ Core Modules',
                    value: '`Setups`, `Moderation`, `Automod`, `Security`',
                    inline: true
                },
                {
                    name: '⚙️ Support Systems',
                    value: '`Utility`, `Voice Protection`, `Logging`',
                    inline: true
                }
            )
            .setImage("https://media.discordapp.net/attachments/982652732911542402/1459243271820939317/standard.gif?ex=696291b3&is=69614033&hm=f468b68cfb970a5b1921e338a790668c8c0d130c0b4255189b2b14554a1414c9&=&width=1360&height=480")
            .setFooter({
                text: `${client.user?.username} Security Engine • Advanced Protection`,
                iconURL: client.user?.displayAvatarURL()
            });

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('Select a category to explore...')
                    .addOptions([
                        {
                            label: 'Dashboard Home',
                            value: 'help_home',
                            emoji: '🏠',
                            description: 'Return to the main overview'
                        },
                        {
                            label: 'Server Setups',
                            value: 'help_setups',
                            emoji: '🛠️',
                            description: 'Configuration for logs and verification'
                        },
                        {
                            label: 'Moderation',
                            value: 'help_mod',
                            emoji: '🛡️',
                            description: 'Standard moderation and management tools'
                        },
                        {
                            label: 'Voice & Security',
                            value: 'help_security',
                            emoji: '🔒',
                            description: 'Anti-Raid, VC Mod, and soundboard protection'
                        },
                        {
                            label: 'Utility Systems',
                            value: 'help_utility',
                            emoji: '⚙️',
                            description: 'General purpose tools and info'
                        }
                    ])
            );

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Hub')
                    .setURL('https://discord.gg/zSNMexbnuq')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Add Sentinel')
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)
                    .setStyle(ButtonStyle.Link),
            );

        await interaction.reply({ embeds: [mainEmbed], components: [selectMenu, buttons] });
    }
};
