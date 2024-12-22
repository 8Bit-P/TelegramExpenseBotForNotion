import logging
from dotenv import load_dotenv
import os
import requests
from datetime import datetime

##################################################################
################## Global variable definition#####################
##################################################################
# Load the .env file
load_dotenv()

# Access the variables
BOT_TOKEN = os.getenv('BOT_TOKEN')
NOTION_TOKEN = os.getenv('NOTION_TOKEN')
MAIN_DATABASE_ID = os.getenv('MAIN_DATABASE_ID')
MONTHS_DATABASE_ID = os.getenv('MONTHS_DATABASE_ID')
CHAT_ID = os.getenv('CHAT_ID')

headers = {
    "Authorization": "Bearer " + NOTION_TOKEN,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

##################################################################
################## Global variable definition end#################
##################################################################


def get_month_page(expenseDate: str):
    """Fetches the account page from the Accounts Database based on account name"""
    query_url = f"https://api.notion.com/v1/databases/{MONTHS_DATABASE_ID}/query"
    
    try:
        # Try to parse with microseconds first
        date_object = datetime.strptime(expenseDate, "%Y-%m-%dT%H:%M:%S.%f")
    except ValueError:
        # Fall back to parsing without microseconds
        date_object = datetime.strptime(expenseDate, "%Y-%m-%dT%H:%M:%S")

    month = date_object.strftime("%B")  # Full month name with first letter capitalized

    # Build the payload for querying the database
    payload = {
        "filter": {
            "property": "Month",  
            "title": {
                "equals": month
            }
        }
    }
    
    res = requests.post(query_url, headers=headers, json=payload)

    if res.status_code == 200:
        results = res.json().get("results")
        if results:
            return results[0].get("id")  # Return the first matching account's page_id
        else:
            logger.error("No matching month found.")
            return None
    else:
        logger.error(f"Failed to fetch month: {res.text}")
        return None

def update_month_summary( expense_page_id: str, isExpense: bool, expenseDate: str):
    """Updates the RelationExpenses field in the month row by appending the new expense or income"""


    # Step 0: Fetch id of current month
    month_page_id = get_month_page(expenseDate)

    # Step 1: Fetch the current relations from the account page
    account_url = f"https://api.notion.com/v1/pages/{month_page_id}"
    res = requests.get(account_url, headers=headers)

    if res.status_code != 200:
        logger.error(f"Failed to fetch month data: {res.text}")
        return

    month_data = res.json()
    
    if isExpense:
        # Extract the current relations (if any) from the "RelationExpenses" field
        current_relations = month_data.get("properties", {}).get("RelationExpenses", {}).get("relation", [])
    else:
        current_relations = month_data.get("properties", {}).get("RelationIncome", {}).get("relation", [])


    # Step 2: Append the new expense to the list of relations
    current_relations.append({"id": expense_page_id})

    # Step 3: Update the account page with the new list of relations
    if isExpense:
        data = {"RelationExpenses": {"relation": current_relations }}# Set the updated list of relations
    else:
        data = {"RelationIncome": {"relation": current_relations }}# Set the updated list of relations


    update_url = f"https://api.notion.com/v1/pages/{month_page_id}"
    update_res = requests.patch(update_url, headers=headers, json={"properties": data})

    if update_res.status_code == 200:
        logger.info(f"""Successfully updated month with new {"expense" if isExpense else "income"} relation.""")
    else:
        logger.error(f"Failed to update month: {update_res.text}")

def create_page(data: dict, database_id: str):
    """ Creates record in Notion DB and returns the page_id """

    create_url = "https://api.notion.com/v1/pages"
    payload = {"parent": {"database_id": database_id}, "properties": data}

    res = requests.post(create_url, headers=headers, json=payload)
    
    # Check if the request was successful
    if res.status_code == 200:
        return res.json().get("id")  # Return the ID of the created page
    else:
        logger.error(f"Error creating page: {res.text}")
        return None