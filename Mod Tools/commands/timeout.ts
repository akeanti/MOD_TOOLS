import {
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  SlashCommandBuilder,
} from "npm:discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member for a certain period")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to timeout")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Timeout duration in seconds")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(3600)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the timeout")
        .setRequired(false)
    ),
  action: async (client: Client, interaction: ChatInputCommandInteraction) => {
    try {
      const guild = interaction.guild;
      if (!guild) {
        throw new Error("This command can only be used in a server.");
      }

      const member = interaction.member;
      if (!member || !("permissions" in member)) {
        await interaction.reply({
          content: "Unable to verify your permissions.",
          ephemeral: true,
        });
        return;
      }

      if (!member.permissions.has("ModerateMembers")) {
        await interaction.reply({
          content: "You do not have permission to timeout members.",
          ephemeral: true,
        });
        return;
      }

      const user = interaction.options.getUser("user");
      if (!user) {
        await interaction.reply({
          content: "No user found.",
          ephemeral: true,
        });
        return;
      }

      const duration = interaction.options.getInteger("duration");
      if (!duration) {
        await interaction.reply({
          content: "Invalid timeout duration.",
          ephemeral: true,
        });
        return;
      }

      const reason = interaction.options.getString("reason") || "No reason provided.";

      const targetMember = guild.members.cache.get(user.id) as GuildMember;
      if (!targetMember) {
        await interaction.reply({
          content: "The specified user is not a member of this server.",
          ephemeral: true,
        });
        return;
      }

      if (!targetMember.moderatable) {
        await interaction.reply({
          content: "I cannot timeout this user. They might have higher permissions.",
          ephemeral: true,
        });
        return;
      }

      await targetMember.timeout(duration * 1000, reason);
      await interaction.reply({
        content: `Successfully timed out <@${user.id}> for ${duration} seconds. Reason: ${reason}`,
      });
    } catch (error) {
      console.error("Error timing out user:", error);
      await interaction.reply({
        content: "There was an error attempting to timeout the user. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
