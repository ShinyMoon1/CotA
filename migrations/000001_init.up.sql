CREATE SCHEMA CotA;

CREATE TYPE CotA.character_statue AS ENUM (
    'strength',
    'agility',
    'intellect',
    'vitality',
    'occultism'
);

CREATE TYPE CotA.habit_status AS ENUM (
    'done',
    'missed',
    'failed'
);

CREATE TABLE CotA.users (
    id            SERIAL                        PRIMARY KEY,
    nick_name     VARCHAR(100)  NOT NULL        CHECK(char_length(nick_name) BETWEEN 3 AND 100), 
    email         VARCHAR(255)  NOT NULL UNIQUE CHECK(email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE CotA.character_stats (
    id         SERIAL                       PRIMARY KEY,
    users_id   INTEGER NOT NULL UNIQUE,
    strength   INT     NOT NULL DEFAULT 1,
    agility    INT     NOT NULL DEFAULT 1,
    intellect  INT     NOT NULL DEFAULT 1,
    vitality   INT     NOT NULL DEFAULT 1,
    occultism  INT     NOT NULL DEFAULT 0,
    FOREIGN KEY (users_id) REFERENCES CotA.users(id) ON DELETE CASCADE
);

CREATE TABLE CotA.habits (
    id              SERIAL                              PRIMARY KEY,
    users_id        INT                     NOT NULL,
    title           VARCHAR(100)            NOT NULL, 
    description     VARCHAR,
    base_exp        INT                     NOT NULL,
    stat_type       CotA.character_statue   NOT NULL,
    stat_gain       INT                     NOT NULL    DEFAULT 1,
    created_at      TIMESTAMP               NOT NULL    DEFAULT NOW(),
    FOREIGN KEY (users_id) REFERENCES CotA.users (id)
);

CREATE TABLE CotA.habit_logs (
    id              SERIAL                           PRIMARY KEY,
    habits_id       INT                   NOT NULL,
    users_id        INT                   NOT NULL,
    perform_date    DATE                  NOT NULL,
    status          CotA.habit_status     NOT NULL,
    created_at      TIMESTAMP             NOT NULL   DEFAULT NOW(),
    FOREIGN KEY (habits_id) REFERENCES CotA.habits (id),
    FOREIGN KEY (users_id) REFERENCES CotA.users (id)
);