# TAGuide

TAGuide is a full-stack web application that allows users to initiate course information scraping tasks and manage sensitive data securely. Built as an upgrade to a pure Python script, TAGuide introduces a user-friendly, web-accessible interface that enables teachers to use the tool at their convenience.

## Tech Stack

- Backend: Python, Flask

- Frontend: React

- Database: PostgreSQL

- Encryption: Fernet and bcrypt for secure storage and transmission of sensitive information

## Purpose

This project was developed to replace a previous command-line-based course scraper with a more intuitive, accessible interface. By bringing it to the web, teachers and head TAs can initiate scraping tasks and access results without needing to run scripts locally.

## Check it out!

Follow these steps to set up and run the app on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/eboyden42/ta-track-react.git
cd ta-track-react
```

### 2. Set Up the Backend

1. **Install PostgreSQL**:
   - Ensure PostgreSQL is installed on your computer.
   - Optionally, install PGAdmin for easier database management.

2. **Create a `.env` File**:
   - Copy the contents of `backend/.env.example` to a new `.env` file in the `backend` directory.
   - Replace the placeholders:
     - `your_database_password` with your PostgreSQL password.
     - `your_database_name` with your database name.
     - `your_database_user` with your PostgreSQL username.
   - If you're new to PostgreSQL or PGAdmin, [this video](https://www.youtube.com/watch?v=miEFm1CyjfM) can help.

3. **Generate Keys**:
   - Run the following script to generate your `COOKIES_KEY` and `ENCRYPT_KEY`:
     ```bash
     python backend/generate_keys.py
     ```
   - Copy the generated keys into their respective locations in the `.env` file.

4. **Install Backend Dependencies**:
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```

### 3. Set Up the Frontend

1. **Create a `.env` File**:
   - Copy the contents of `frontend/.env.example` to a new `.env` file in the `frontend` directory.

2. **Install Frontend Dependencies**:
   - Navigate to the `frontend` directory and run:
     ```bash
     npm install
     ```

### 4. Start the Application

1. **Start the Backend**:
   - Navigate to the `backend` directory and run:
     ```bash
     python server.py
     ```

2. **Start the Frontend**:
   - Navigate to the `frontend` directory and run:
     ```bash
     npm run dev
     ```

3. **Access the Web App**:
   - Open your browser and go to: [http://localhost:5173/](http://localhost:5173/)

That's it! Your app should now be up and running.


