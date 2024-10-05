import logging
from telegram import Update, InlineQueryResultArticle, InputTextMessageContent
from telegram.ext import filters, ApplicationBuilder, ContextTypes, CommandHandler, InlineQueryHandler
from uuid import uuid4
from dotenv import load_dotenv
import os
import requests
from datetime import datetime,timezone
import re

# Load the .env file
load_dotenv()

# Access the variables
BOT_TOKEN = os.getenv('BOT_TOKEN')
NOTION_TOKEN = os.getenv('NOTION_TOKEN')
DATABASE_ID = os.getenv('DATABASE_ID')

headers = {
    "Authorization": "Bearer " + NOTION_TOKEN,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

HELP_TEXT = """The following list of commands are available to use to add expenses to your Notion database:
    - /help
    - /addexpense [amount] [date (optional)] [description] 🚨
    - /addincome [amount] [date (optional)] [description] 💵
"""
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

#TODO: add chat_id filtering

def create_page(data: dict):
    """ Creates record in Notion DB """

    create_url = "https://api.notion.com/v1/pages"

    payload = {"parent": {"database_id": DATABASE_ID}, "properties": data}

    res = requests.post(create_url, headers=headers, json=payload)
    print(res)
    print(res.status_code)
    return res

async def addExpenseIncomeRow(update: Update, context: ContextTypes.DEFAULT_TYPE, isExpense: bool):
    if len(context.args) < 2:
        await context.bot.send_message(chat_id=update.effective_chat.id, text=f'Please provide an amount and a description. Format: {"/addexpense" if isExpense else "/addincome"} [amount] [date (optional)] [description]')
    else:
        # Validate the amount is a number
        try:
            amount = float(context.args[0])
        except ValueError:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="Amount must be a valid number.")
            return

        #Check if Date was entered
        date_str = context.args[1]
        hasDate = False
        # Regular expression to match date in format dd/mm/yyyy
        date_pattern = r'^\d{1,2}/\d{1,2}/\d{4}$'

        # Check if the date matches the pattern (User Introduced a date)
        if re.match(date_pattern, date_str):
            try:
                hasDate = True
                # Convert the date string to a datetime object
                expense_date = datetime.strptime(date_str, "%d/%m/%Y").isoformat()
                description = ' '.join(context.args[2:]) #The rest of the params joint

                data = {
                    "Description": {"title": [{"text": {"content": description}}]},
                    "Amount": {"number": amount},
                    "Date": {"date": {"start": expense_date}},
                    "Expense": {"checkbox": isExpense}  # To mark this as an expense
                }

            except ValueError:
                await context.bot.send_message(chat_id=update.effective_chat.id, text="Error in date format. It should be in the format dd/mm/yyyy.")
                return
        #User has not introduced a date (we expect the other arguments to be a description)
        else:
            description = ' '.join(context.args[1:])
            expense_date = datetime.now().isoformat()

            # Construct the data for Notion
            data = {
                "Description": {"title": [{"text": {"content": description}}]},
                "Amount": {"number": amount},
                "Date": {"date": {"start": expense_date}},
                "Expense": {"checkbox": isExpense}  # To mark this as an expense
            }

        # Call your create_page function to create the entry in Notion
        create_page(data)

        # Send a confirmation message back to the user
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=f"""  {"🚨 <b>EXPENSE ADDED:</b>" if isExpense else "💵 <b>INCOME ADDED:</b> "}\n
            <b>Amount</b>: {amount}\n
            <b>Description</b>: {description}\n
            <b>Date</b>: {date_str if hasDate else 'today'}""",
            parse_mode="HTML"
        )

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Welcome, I'm Edward the expense tracker bot 🤖, type /help to get the available commands for this bot")

async def help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text=HELP_TEXT)

async def addExpense(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await addExpenseIncomeRow(update, context, True)

async def addIncome(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await addExpenseIncomeRow(update, context, False)

if __name__ == '__main__':
    application = ApplicationBuilder().token(BOT_TOKEN).build()

    # Define handlers
    start_handler = CommandHandler('start', start)
    help_handler = CommandHandler('help', help)
    addExpense_handler = CommandHandler('addexpense', addExpense)
    addIncome_handler = CommandHandler('addincome', addIncome)
    
    # Add handlers to application
    application.add_handler(start_handler)
    application.add_handler(help_handler)
    application.add_handler(addExpense_handler)
    application.add_handler(addIncome_handler)

    # Run bot
    application.run_polling()
