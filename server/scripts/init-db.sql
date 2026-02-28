-- Run this in your PostgreSQL database (e.g. psql or GUI) to create the sample table.

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO items (name) VALUES ('First item'), ('Second item');
