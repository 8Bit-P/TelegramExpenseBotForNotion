# 📊 **Telegram Expense Bot for Notion**

A **Telegram bot** that integrates with **Notion** to keep track of your daily expenses, easily registering them in your personal Notion database.

## ✨ **Features**
- **Track expenses** and **income** in real-time.
- Seamlessly **log records** directly into your Notion page.
- Simplify personal finance management with minimal effort.

## 🔧 **Commands**
| Command                                 | Description                                        |
|-----------------------------------------|----------------------------------------------------|
| `/help`                                 | Get a list of all available commands.              |
| `/addexpense [amount] [date (optional)] [description] 🚨` | Log an **expense** with the specified amount, date (optional), and description. Example: `/addexpense 50 05/10/2024 Lunch at Cafe 🚨` |
| `/addincome [amount] [date (optional)] [description] 💵`  | Log an **income** with the specified amount, date (optional), and description. Example: `/addincome 1000 Salary 💵`  |

## 📋 **Usage Example**
/addexpense 15.50 06/10/2024 Groceries 🚨


This will log a new expense of `$15.50` for groceries on **October 6, 2024** in your Notion database.

## 🚀 **Start Managing Your Finances Now!**
Simply use the commands above to track your daily expenses and incomes directly through Telegram, and keep everything organized in Notion effortlessly!

## 📂 **Required Fields in `.env` File**

To configure the bot, the following fields are required in the `.env` file:

```bash
BOT_TOKEN=                # Your Telegram bot token
CHAT_ID=                  # Telegram chat ID to prevent unauthorized users from adding expenses
BOT_NAME=                 # Name of the bot
BOT_USERNAME=             # Username of the bot

NOTION_TOKEN=             # Your Notion API token
MAIN_DATABASE_ID=         # The Notion database ID where primary expenses/income are logged
ACCOUNTS_DATABASE_ID=     # The Notion database ID for accounts where expense relations are stored
MONTH_DATABASE_ID=        # The ID of the Notion database where you store month-related data
```

### 📌 **Description of Each Field**
- **`BOT_TOKEN`**: This is the token generated when you create your Telegram bot using [BotFather](https://t.me/BotFather).
- **`CHAT_ID`**: The unique ID of your Telegram chat. This ensures only you (or authorized users) can interact with the bot and log expenses.
- **`BOT_NAME`**: The display name of your bot.
- **`BOT_USERNAME`**: The username you’ve chosen for your bot on Telegram.
- **`NOTION_TOKEN`**: Your Notion API token, generated from [Notion's integration settings](https://www.notion.so/my-integrations).
- **`MAIN_DATABASE_ID`**: The ID of your main Notion database, where you’ll log expenses and income.
- **`ACCOUNTS_DATABASE_ID`**: The ID of the Notion database where you store account-related data (such as relation expenses).
- **`MONTH_DATABASE_ID`**: The ID of the Notion database where you store month-related data .
