const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alt-check')
        .setDescription('Check if a user is a potential alt account')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to check').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

        const createdTimestamp = user.createdTimestamp;
        const accountAgeMs = Date.now() - createdTimestamp;
        const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle(`Alt Check: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        let risk = 'Low';
        let color = 'Green';

        if (accountAgeDays < 7) {
            risk = 'High';
            color = 'Red';
        } else if (accountAgeDays < 30) {
            risk = 'Medium';
            color = 'Orange';
        }

        embed.setColor(color);
        embed.addFields(
            { name: 'Risk Level', value: `**${risk}**`, inline: true },
            { name: 'Account Age', value: `${accountAgeDays} days`, inline: true },
            { name: 'Created At', value: `<t:${Math.floor(createdTimestamp / 1000)}:R>`, inline: true }
        );

        if (member) {
            const joinedAgeMs = Date.now() - (member.joinedTimestamp || Date.now());
            const joinedAgeDays = Math.floor(joinedAgeMs / (1000 * 60 * 60 * 24));
            embed.addFields({ name: 'Joined Server', value: `<t:${Math.floor((member.joinedTimestamp || 0) / 1000)}:R> (${joinedAgeDays} days ago)`, inline: false });

            if (accountAgeDays < 14 && joinedAgeDays < 1) {
                embed.setDescription('⚠️ **Potential Alt Alert:** This account is very young and joined the server today.');
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
};
