import {
    ChatInputCommandInteraction,
    Client,
    GuildMember,
    SlashCommandBuilder,
  } from "npm:discord.js";
  
  export default {
    data: new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kick a member from the server")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user you want to kick")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for kicking the user")
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
  
        if (!member.permissions.has("KickMembers")) {
          await interaction.reply({
            content: "You do not have permission to use this command.",
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
  
        const reason = interaction.options.getString("reason") || "No reason provided.";
  
        const targetMember = guild.members.cache.get(user.id) as GuildMember;
        if (!targetMember) {
          await interaction.reply({
            content: "The specified user is not a member of this server.",
            ephemeral: true,
          });
          return;
        }
  
        if (!targetMember.kickable) {
          await interaction.reply({
            content: "I cannot kick this user. They might have higher permissions.",
            ephemeral: true,
          });
          return;
        }
  
        await targetMember.kick(reason);
        await interaction.reply({
          content: `Successfully kicked <@${user.id}>. Reason: ${reason}`,
        });
      } catch (error) {
        console.error("Error kicking user:", error);
        await interaction.reply({
          content: "There was an error kicking the user. Please try again later.",
          ephemeral: true,
        });
      }
    },
  };
  