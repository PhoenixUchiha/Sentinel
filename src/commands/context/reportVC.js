const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Report Voice Activity')
        .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        if (!interaction.isUserContextMenuCommand()) return;

        const target = interaction.targetUser;
        const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

        if (!member || !member.voice.channel) {
            return interaction.reply({ content: '❌ This user is not in a voice channel.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`vc_report_${target.id}`)
            .setTitle(`Report VC Activity: ${target.username}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('report_reason')
            .setLabel('What is the issue?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ear-rape, Toxicity, Music Bot abuse, etc.')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};
