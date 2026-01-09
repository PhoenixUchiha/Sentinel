const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Manage staff notes for a user')
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Add a note to a user')
                .addUserOption(option => option.setName('user').setDescription('The user to add a note to').setRequired(true))
                .addStringOption(option => option.setName('content').setDescription('The content of the note').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View notes for a user')
                .addUserOption(option => option.setName('user').setDescription('The user to view notes for').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove a note by ID')
                .addStringOption(option => option.setName('id').setDescription('The ID of the note to remove').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user', true);
            const content = interaction.options.getString('content', true);

            const note = {
                id: uuidv4(),
                userId: user.id,
                content: content,
                moderatorId: interaction.user.id,
                timestamp: Date.now()
            };

            await db.addNote(guildId, note);

            const embed = new EmbedBuilder()
                .setTitle('Note Added')
                .setDescription(`Note added for **${user.tag}**.`)
                .addFields({ name: 'Note ID', value: `\`${note.id}\`` })
                .setColor('Green')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'view') {
            const user = interaction.options.getUser('user', true);
            const notes = await db.getNotes(guildId, user.id);

            if (notes.length === 0) {
                return interaction.reply({ content: `No notes found for ${user.tag}.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Notes for ${user.tag}`)
                .setColor('Blue')
                .setTimestamp();

            notes.forEach(note => {
                embed.addFields({
                    name: `ID: ${note.id}`,
                    value: `${note.content}\n*By <@${note.moderatorId}> on <t:${Math.floor(note.timestamp / 1000)}:f>*`
                });
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'remove') {
            const id = interaction.options.getString('id', true);
            await db.removeNote(guildId, id);

            await interaction.reply({ content: `Note with ID \`${id}\` removed.`, ephemeral: true });
        }
    }
};
