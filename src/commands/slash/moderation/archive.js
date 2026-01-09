const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('Archive the current channel (locks it and moves it to an archive category)')
        .addStringOption(option =>
            option.setName('category_id').setDescription('The ID of the category to move the channel to').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.channel;
        const categoryId = interaction.options.getString('category_id');

        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            let targetCategory = null;

            if (categoryId) {
                targetCategory = interaction.guild?.channels.cache.get(categoryId);
            } else {
                targetCategory = interaction.guild?.channels.cache.find(c => c.name.toLowerCase() === 'archived' && c.type === ChannelType.GuildCategory);

                if (!targetCategory) {
                    targetCategory = await interaction.guild?.channels.create({
                        name: 'Archived',
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.SendMessages]
                            }
                        ]
                    });
                }
            }

            if (!targetCategory || targetCategory.type !== ChannelType.GuildCategory) {
                return interaction.editReply({ content: 'Target category not found or invalid.' });
            }

            await channel.setParent(targetCategory, { lockPermissions: true });

            const embed = new EmbedBuilder()
                .setTitle('Channel Archived')
                .setDescription(`This channel has been moved to **${targetCategory.name}** and locked.`)
                .setColor('Greyple')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while archiving the channel.' });
        }
    }
};
