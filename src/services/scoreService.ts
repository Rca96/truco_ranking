import { supabase } from '../lib/supabase';
import { Player } from '../types';

export async function fetchPlayersFromDatabase(): Promise<Player[]> {
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*')
    .order('name');

  if (playersError) throw playersError;

  if (!players || players.length === 0) return [];

  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('*');

  if (scoresError) throw scoresError;

  return players.map(player => {
    const playerScores: Record<string, number> = {};

    scores?.forEach(score => {
      if (score.player_id === player.id) {
        playerScores[score.month] = score.score;
      }
    });

    return {
      id: player.id,
      name: player.name,
      scores: playerScores,
    };
  });
}

export async function syncScoresFromSheet(): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const apiUrl = `${supabaseUrl}/functions/v1/sync-scores`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar dados');
  }
}
