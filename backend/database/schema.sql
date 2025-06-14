CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    gradescope_username TEXT,
    gradescope_password_hash TEXT
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    gradescope_id TEXT NOT NULL,
    name TEXT
);

CREATE TABLE user_courses (
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    gradescope_id TEXT NOT NULL,
    name TEXT
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id),
    name TEXT,
    number INTEGER
);

CREATE TABLE tas (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    name TEXT NOT NULL,
    email TEXT
);

CREATE TABLE ta_question_stats (
    ta_id INTEGER REFERENCES tas(id),
    question_id INTEGER REFERENCES questions(id),
    graded_count INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (ta_id, question_id)
);
