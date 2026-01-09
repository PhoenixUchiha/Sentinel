const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check yours or another user\'s invite statistics')
        .addUserOption(opt => opt.setName('user').setDescription('The user to check')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guildId;

        const invites = await db.getUserInvites(guildId, user.id);
        const userInvites = invites.filter(i => i.inviterId === user.id);

        const totalUses = userInvites.reduce((sum, inv) => sum + inv.uses, 0);
        const codes = userInvites.map(i => `\`${i.inviteCode}\` (${i.uses})`).join(', ') || 'None';

        const embed = new EmbedBuilder()
            .setTitle(`✉️ Invite Stats: ${user.tag}`)
            .setColor('Blue')
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Total Invites', value: totalUses.toString(), inline: true },
                { name: 'Active Codes', value: codes, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
