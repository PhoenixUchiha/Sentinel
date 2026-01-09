const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        if (!interaction.isUserContextMenuCommand()) return;
        const targetUser = interaction.targetUser;
        const member = interaction.targetMember;

        const embed = new EmbedBuilder()
            .setTitle(`User Info: ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: 'ID', value: targetUser.id, inline: true },
                { name: 'Created At', value: targetUser.createdAt.toDateString(), inline: true },
                { name: 'Joined At', value: member?.joinedAt?.toDateString() || 'N/A', inline: true },
                { name: 'Roles', value: member?.roles?.cache?.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'None' }
            )
            .setColor('Blue');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
