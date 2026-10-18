CREATE TABLE IF NOT EXISTS entries (
  id            BIGSERIAL   PRIMARY KEY,

  entry_date    DATE        NOT NULL,

  amount_cents  BIGINT      NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),

  note          TEXT        NOT NULL DEFAULT '',
  category      TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT entries_not_empty CHECK (amount_cents > 0 OR note <> '')
);

CREATE INDEX IF NOT EXISTS entries_entry_date_idx ON entries (entry_date);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entries_set_updated_at ON entries;
CREATE TRIGGER entries_set_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL   PRIMARY KEY,
  name        TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories (name) VALUES
  ('Food'),
  ('Transport'),
  ('Bills'),
  ('Shopping'),
  ('Health'),
  ('Fun'),
  ('Other') 
ON CONFLICT (name) DO NOTHING;
