// Функція для отримання списку адміністраторів каналу
export async function getChannelAdmins(bot, channelId) {
    try {
      const admins = await bot.getChatAdministrators(channelId);
      return admins.map(admin => admin.user.id);
    } catch (error) {
      console.error('Помилка отримання списку адміністраторів:', error);
      return [];
    }
  }
  
  // Функція для перевірки доступу
  export async function checkAccess(bot, channelId, chatId) {
    const admins = await getChannelAdmins(bot, channelId);
    return admins.includes(chatId);
  }