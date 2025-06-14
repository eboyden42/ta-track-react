import psycopg2
from cryptography.fernet import Fernet
import os

# Set up encryption driver
fernet = Fernet(os.environ["FERNET_KEY"])

print(os.environ["FERNET_KEY"])