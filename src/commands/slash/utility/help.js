const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { config } = require('../../../utils/env');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('High-performance help menu with all commands'),
    async execute(interaction, client, collections) {
        if (!collections) return interaction.reply({ content: 'Help system is initializing...', ephemeral: true });

        const totalCommands = collections.slashCommands.size + collections.contextCommands.size + new Set(collections.prefixCommands.values()).size;

        const mainEmbed = new EmbedBuilder()
            .setTitle(`${client.user?.username || 'Bot'} Infrastructure`)
            .setColor('#FF4B4B')
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setDescription(
                `• Hey! 👋\n` +
                `• Total commands: \`${totalCommands}\` \n` +
                `• Get [Support Server](https://discord.gg/zSNMexbnuq) \n` +
                `• In \`${client.guilds.cache.size}\` servers with \`${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\` members`
            )
            .addFields(
                {
                    name: '__Main__',
                    value:
                        `🛠️ **Setups**\n` +
                        `🛡️ **Moderation**\n` +
                        `🤖 **Automod**\n` +
                        `🔒 **Security**`,
                    inline: true
                },
                {
                    name: '__Extras__',
                    value:
                        `ℹ️ **Information**\n` +
                        `⚙️ **Utility**\n` +
                        `💸 **Economy** (Soon)\n` +
                        `🎮 **Socials** (Soon)`,
                    inline: true
                }
            )
            .setFooter({
                text: `Powered By: @${client.user?.username}`,
                iconURL: client.user?.displayAvatarURL()
            });

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder(`${client.user?.username} | Help Menu`)
                    .addOptions([
                        { label: 'Setups', value: 'help_setups', emoji: '🛠️', description: 'Configure log channels and verification' },
                        { label: 'Moderation', value: 'help_mod', emoji: '🛡️', description: 'Kick, Ban, Timeout, Warn, and more' },
                        { label: 'Voice', value: 'help_voice', emoji: '🎙️', description: 'Voice moderation and soundboard spam' },
                        { label: 'Security', value: 'help_security', emoji: '🔒', description: 'Anti-Raid and panic mode settings' },
                        { label: 'Utility', value: 'help_utility', emoji: '⚙️', description: 'Ping, Help, and basic tools' }
                    ])
            );

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/zSNMexbnuq')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Invite Bot')
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)
                    .setStyle(ButtonStyle.Link),
            );

        await interaction.reply({ embeds: [mainEmbed], components: [selectMenu, buttons] });
    }
};
