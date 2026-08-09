-- Add current_player_id to draft_session (the player currently up for auction)
ALTER TABLE draft_session
  ADD COLUMN current_player_id UUID REFERENCES players(id) ON DELETE SET NULL;

-- Add updated_at to players so display screen can order by most recently sold
ALTER TABLE players
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated_at_trigger
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_players_updated_at();
