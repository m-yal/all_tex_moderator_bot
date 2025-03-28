// Головне меню з трьома кнопками
export const mainMenu = {
    reply_markup: {
        keyboard: [['Редагувати', 'Опублікувати']],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};
  
  // Reply-клавіатура з кнопкою "Назад"
export const backMenu = {
    reply_markup: {
        keyboard: [['Назад']],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};