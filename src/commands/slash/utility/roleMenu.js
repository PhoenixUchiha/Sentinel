const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-menu')
        .setDescription('Create a role selection menu with buttons')
        .addStringOption(opt => opt.setName('title').setDescription('The title of the menu').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('The description of the menu').setRequired(true))
        .addRoleOption(opt => opt.setName('role1').setDescription('The first role').setRequired(true))
        .addRoleOption(opt => opt.setName('role2').setDescription('The second role'))
        .addRoleOption(opt => opt.setName('role3').setDescription('The third role'))
        .addRoleOption(opt => opt.setName('role4').setDescription('The fourth role'))
        .addRoleOption(opt => opt.setName('role5').setDescription('The fifth role'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const title = interaction.options.getString('title', true);
        const description = interaction.options.getString('description', true);
        const roles = [];

        for (let i = 1; i <= 5; i++) {
            const role = interaction.options.getRole(`role${i}`);
            if (role) roles.push(role);
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('Blue')
            .setFooter({ text: 'Click a button below to get or remove a role!' });

        const row = new ActionRowBuilder();

        for (const role of roles) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${role.id}`)
                    .setLabel(role.name)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        for (const role of roles) {
            await db.addReactionRole(interaction.guildId, {
                messageId: message.id,
                emoji: 'button',
                roleId: role.id
            });
        }
    }
};
