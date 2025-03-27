#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
cd /home/max/My_Software_Projects/all_tex_moderator_bot/
echo "Чекаємо, поки MySQL стане активним..."
while ! mysqladmin ping -h localhost --silent; do
  echo "MySQL ще не готовий, чекаємо 1 секунду..."
  sleep 1
done
echo "MySQL активний, запускаємо бот..."
node src/bot.js