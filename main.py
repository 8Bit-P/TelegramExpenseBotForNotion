import logging
import socket
from telegram import Update
from telegram.ext import  ApplicationBuilder, ContextTypes, CommandHandler
from dotenv import load_dotenv
import os
import time
from datetime import datetime
import re
from supabase import create_client, Client

##################################################################
################## Global variable definition#####################
##################################################################

# Load the .env file
load_dotenv()

# Access the variables
BOT_TOKEN = os.getenv('BOT_TOKEN')
CHAT_ID = os.getenv('CHAT_ID')

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)


HELP_TEXT = """The following list of commands are available to use to add expenses to your Notion database:
    - /help
    - /addexpense [amount] [date (optional)] [description] 🚨
    - /addincome [amount] [date (optional)] [description] 💵
"""

INVALID_CHAT_ID = "You don't have permission to access this bot functionality."

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

##################################################################
################## Global variable definition end#################
##################################################################

##################################################################
################## Wait for Internet Connection ##################
##################################################################

def wait_for_internet(host="8.8.8.8", port=53, timeout=3):
    """Check if the internet connection is available by pinging a reliable host."""
    while True:
        try:
            socket.setdefaulttimeout(timeout)
            socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
            print("Internet connection established!")
            return True
        except socket.error:
            print("Waiting for internet connection...")
            time.sleep(5)

wait_for_internet()

##################################################################
################## Boot functionality ############################
##################################################################

async def insert_into_supabase(data: dict):
    try:
        response = supabase.table("expenses").insert(data).execute()
        
        if not response.data:
            logger.error("Supabase insert failed: No data returned.")
            return False

        return True
    except Exception as e:
        logger.error(f"Error inserting into Supabase: {e}")
        return False


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

            except ValueError:
                await context.bot.send_message(chat_id=update.effective_chat.id, text="Error in date format. It should be in the format dd/mm/yyyy.")
                return
        #User has not introduced a date (we expect the other arguments to be a description)
        else:
            description = ' '.join(context.args[1:])
            expense_date = datetime.now().isoformat()

        # Prepare data for Supabase (adapt keys & format)
        supabase_data = {
            "description": description,
            "amount": amount,
            "date": expense_date,  # ISO string
            "creation_date": datetime.now().isoformat(),  # or page creation time if available
            "account": 0,  # since you use "RegularAccount" here, map to 0; adjust if dynamic
            "expense": isExpense,
            "tipo": None  # No type set from telegram
        }

        success = await insert_into_supabase(supabase_data)

        if not success:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="Warning: Failed to insert data into Supabase.")


        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=f"""{"🚨 <b>EXPENSE ADDED:</b>" if isExpense else "💵 <b>INCOME ADDED:</b>"}\n<b>Amount</b>: {amount}€\n<b>Description</b>: {description}\n<b>Date</b>: {date_str if hasDate else 'today'}""",
            parse_mode="HTML"
        )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Welcome, I'm Edward the expense tracker bot 🤖, type /help to get the available commands for this bot")

async def help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text=HELP_TEXT)

async def addExpense(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.chat_id != int(CHAT_ID): 
        await context.bot.send_message(chat_id=update.effective_chat.id, text=INVALID_CHAT_ID)
    else:
        await addExpenseIncomeRow(update, context, True)

async def addIncome(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.chat_id != int(CHAT_ID): 
        await context.bot.send_message(chat_id=update.effective_chat.id, text=INVALID_CHAT_ID)
    else:
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
