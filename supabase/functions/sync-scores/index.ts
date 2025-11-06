import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SHEET_ID = "1W6b1mjt8cf--8GMrl9G7UtjwEK6h89rUH4rlRZY8XuY";
const GID = "1183686384";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

interface PlayerScore {
  name: string;
  scores: Record<string, number>;
}

async function fetchSheetData(): Promise<PlayerScore[]> {
  try {
    const response = await fetch(CSV_URL);
    const csv = await response.text();
    const lines = csv.trim().split("\n");

    console.log("Total de linhas:", lines.length);
    console.log("Linha 0:", lines[0]);
    console.log("Linha 1:", lines[1]);
    console.log("Linha 2:", lines[2]);
    console.log("Linha 3:", lines[3]);

    if (lines.length < 4) return [];

    let headerLineIndex = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const firstValue = values[0].toLowerCase();

      if (
        (firstValue === "período" || firstValue === "periodo") &&
        values.length > 1
      ) {
        const hasDate = values
          .slice(1)
          .some((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim()));
        if (hasDate) {
          headerLineIndex = i;
          console.log("Linha de cabeçalho encontrada no índice:", i);
          break;
        }
      }
    }

    if (headerLineIndex === -1) {
      console.error("Cabeçalho não encontrado");
      return [];
    }

    const headers = lines[headerLineIndex].split(",").map((h) => h.trim());
    console.log("Headers encontrados:", headers);

    const players: PlayerScore[] = [];

    const somatoriaIndex = headers.findIndex(
      (h) => h.toLowerCase() === "somatória" || h.toLowerCase() === "somatoria"
    );

    console.log("Índice da coluna Somatória:", somatoriaIndex);

    for (let i = headerLineIndex + 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length < 2) continue;

      const playerName = values[0];

      if (
        !playerName ||
        playerName === "" ||
        playerName.toLowerCase() === "período" ||
        playerName.toLowerCase() === "periodo"
      )
        continue;

      const scores: Record<string, number> = {};

      for (let j = 1; j < headers.length; j++) {
        if (j === somatoriaIndex) continue;

        const header = headers[j];
        const scoreValue = values[j];

        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (dateRegex.test(header)) {
          const score = parseInt(scoreValue) || 0;
          scores[header] = score;
          console.log(`  ${header}: ${score}`);
        }
      }

      if (Object.keys(scores).length > 0) {
        console.log("Jogador:", playerName, "Scores:", scores);
        players.push({ name: playerName, scores });
      }
    }

    console.log("Total de jogadores processados:", players.length);
    return players;
  } catch (error) {
    console.error("Erro ao buscar dados da planilha:", error);
    throw error;
  }
}

async function syncToDatabase(players: PlayerScore[]) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const player of players) {
    const { data: existingPlayer, error: selectError } = await supabase
      .from("players")
      .select("id")
      .eq("name", player.name)
      .maybeSingle();

    if (selectError) throw selectError;

    let playerId: string;

    if (existingPlayer) {
      playerId = existingPlayer.id;
    } else {
      const { data: newPlayer, error: insertError } = await supabase
        .from("players")
        .insert({ name: player.name })
        .select("id")
        .single();

      if (insertError) throw insertError;
      playerId = newPlayer.id;
    }

    for (const [month, score] of Object.entries(player.scores)) {
      const { error: upsertError } = await supabase
        .from("scores")
        .upsert(
          {
            player_id: playerId,
            month,
            score,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "player_id,month" }
        );

      if (upsertError) throw upsertError;
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const players = await fetchSheetData();
    await syncToDatabase(players);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronizados ${players.length} jogadores`,
        players: players.length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
