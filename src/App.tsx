import { useState, useEffect } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import TopThree from "./components/TopThree";
import ScoresTable from "./components/ScoresTable";
import { Player } from "./types";
import {
  fetchPlayersFromDatabase,
  syncScoresFromSheet,
} from "./services/scoreService";

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await fetchPlayersFromDatabase();
      setPlayers(data);
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncScoresFromSheet();
      await loadPlayers();
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-amber-400" />
            <h1 className="text-5xl font-bold text-white">Truco da rataida</h1>
          </div>
          <p className="text-slate-300 text-lg">Ranking e Estatísticas</p>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Planilha"}
          </button>
        </header>

        {players.length > 0 ? (
          <>
            <TopThree players={players} />
            <div className="mt-12">
              <ScoresTable players={players} />
            </div>
          </>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-slate-700 text-center">
            <p className="text-slate-300 text-lg mb-4">
              Nenhum jogador carregado ainda
            </p>
            <button
              onClick={handleSync}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Carregar dados da planilha
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
