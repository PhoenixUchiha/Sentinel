const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('Setup the server verification system')
        .addRoleOption(option =>
            option.setName('role').setDescription('The role to give upon verification').setRequired(true))
        .addChannelOption(option =>
            option.setName('channel').setDescription('The channel to send the verification message to').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role', true);
        const channel = interaction.options.getChannel('channel', true);
        const guildId = interaction.guildId;

        await db.updateSettings(guildId, {
            verifiedRoleId: role.id,
            verificationChannelId: channel.id
        });

        const embed = new EmbedBuilder()
            .setTitle('Server Verification')
            .setDescription(`Welcome to **${interaction.guild?.name}**!\n\nTo access the rest of the server, please click the button below to verify yourself.`)
            .setColor('Blue')
            .setFooter({ text: 'Verification System' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_user')
                    .setLabel('Verify Me')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({ content: `Verification system has been set up in ${channel} with role ${role}.`, ephemeral: true });
    }
};
