import os
import csv
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Helper to parse amount and dates
def parse_amount(euro_str):
    return float(euro_str.replace("€", "").replace(".", "").replace(",", ".").strip())

def parse_date(date_str):
    # Expects format like: "5 de octubre de 2024 11:47" or just "5 de octubre de 2024"
    months = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    }
    parts = date_str.split(' de ')
    day = parts[0].strip()
    month = months[parts[1].strip()]
    rest = parts[2].split(' (')[0]  # Remove time zone if exists

    rest_parts = rest.strip().split(' ', 1)
    year = rest_parts[0]
    time = rest_parts[1] if len(rest_parts) > 1 else "00:00"  # Default time

    return datetime.strptime(f"{day}/{month}/{year} {time}", "%d/%m/%Y %H:%M")


def map_account(account_str):
    account_str = account_str.strip().lower()
    if account_str == "regularaccount":
        return 0
    elif account_str == "investmentaccount":
        return 1
    else:
        return None  # Or raise an error if you prefer strictness

# Read CSV and insert into Supabase
with open("migration.csv", newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        try:
            data = {
                "description": row["Description"],
                "amount": parse_amount(row["Amount"]),
                "date": parse_date(row["Date"]).isoformat(),
                "creation_date": parse_date(row["CreationDate"]).isoformat(),
                "account": map_account(row["Account"]),
                "expense": row["Expense"].strip().lower() == "yes",
                "tipo": row.get("Tipo") or None
            }
            print("Inserting:", data)
            response = supabase.table("expenses").insert(data).execute()
            print(response)
        except Exception as e:
            print("Error processing row:", row)
            print("Error:", e)
