const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, GuildMember } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quarantine')
        .setDescription('Isolate a user by removing roles and adding a restricted role')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to quarantine').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('Reason for quarantine'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;

        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: 'Member not found in this server.', ephemeral: true });
        }

        if (!interaction.member || !(interaction.member instanceof GuildMember)) return;

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: 'You cannot quarantine a user with a higher or equal role.', ephemeral: true });
        }

        // 1. Find or Create Quarantined Role
        let quarantineRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'quarantined');
        if (!quarantineRole) {
            try {
                quarantineRole = await guild.roles.create({
                    name: 'Quarantined',
                    color: '#808080',
                    reason: 'Required for /quarantine command',
                    permissions: [] // No permissions
                });
            } catch (error) {
                return interaction.reply({ content: 'Failed to create a "Quarantined" role. Please create it manually.', ephemeral: true });
            }
        }

        // 2. Remove all roles and add quarantine role
        try {
            await member.roles.set([quarantineRole.id]);
        } catch (error) {
            return interaction.reply({ content: 'Failed to update user roles. Check bot permissions.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('User Quarantined')
            .setColor('Grey')
            .setDescription(`**${user.tag}** has been moved to quarantine.`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: interaction.user.tag }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Try to DM user
        await user.send(`You have been quarantined in **${guild.name}** for: ${reason}`).catch(() => { });
    }
};
