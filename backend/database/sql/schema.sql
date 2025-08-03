CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    gradescope_username TEXT,
    gradescope_password_hash TEXT
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    gradescope_id TEXT NOT NULL,
    name TEXT
);

CREATE TABLE IF NOT EXISTS user_courses (
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    status TEXT DEFAULT 'pending',
    name TEXT,
    error_message TEXT,
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    gradescope_id TEXT NOT NULL,
    name TEXT,
    percent_graded TEXT,
    ws_link TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id),
    qs_link TEXT
);

CREATE TABLE IF NOT EXISTS tas (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    name TEXT NOT NULL,
    email TEXT
);

CREATE TABLE IF NOT EXISTS ta_question_stats (
    ta_id INTEGER REFERENCES tas(id),
    question_id INTEGER REFERENCES questions(id),
    graded_count INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (ta_id, question_id)
);


