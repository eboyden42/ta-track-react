import psycopg2
import os

db_password = os.environ.get("PASSWORD")


conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password=db_password)
cursor = conn.cursor()

with open("schema.sql", "r") as f:
    cursor.execute(f.read()) 

conn.commit()
cursor.close()
conn.close()

