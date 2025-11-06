/*
  # Criar tabelas para Torneio de Truco

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text, nome do jogador)
      - `created_at` (timestamp)
    
    - `scores`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key)
      - `month` (text, formato YYYY-MM)
      - `score` (integer, pontuação do mês)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS em ambas tabelas
    - Permitir SELECT público (dados são públicos)
    - Restringir INSERT/UPDATE/DELETE (apenas sistema)

  3. Indexes
    - Index em player_id para queries rápidas
    - Index em month para filtros
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  month text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, month)
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read scores"
  ON scores
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX idx_scores_player_id ON scores(player_id);
CREATE INDEX idx_scores_month ON scores(month);
