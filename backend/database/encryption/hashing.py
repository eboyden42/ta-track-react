import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(check_pass: str, actual_pass: str) -> bool:
    return bcrypt.checkpw(
        check_pass.encode('utf-8'), 
        actual_pass.encode('utf-8')
    )
