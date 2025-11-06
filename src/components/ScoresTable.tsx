import { useState, useMemo } from 'react';
import { ArrowUpDown, Calendar } from 'lucide-react';
import { Player } from '../types';
import { getAllMonths, calculateTotalScore } from '../utils/scores';

interface ScoresTableProps {
  players: Player[];
}

type SortType = 'name' | 'score';
type SortOrder = 'asc' | 'desc';

export default function ScoresTable({ players }: ScoresTableProps) {
  const availableMonths = useMemo(() => getAllMonths(players), [players]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');
  const [sortType, setSortType] = useState<SortType>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedPlayers = useMemo(() => {
    const playersWithScores = players.map(player => ({
      ...player,
      currentScore: selectedMonth ? (player.scores[selectedMonth] || 0) : calculateTotalScore(player.scores)
    }));

    return playersWithScores.sort((a, b) => {
      if (sortType === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? a.currentScore - b.currentScore
          : b.currentScore - a.currentScore;
      }
    });
  }, [players, selectedMonth, sortType, sortOrder]);

  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder(type === 'score' ? 'desc' : 'asc');
    }
  };

  const formatMonthLabel = (month: string) => {
    if (month.includes('/')) {
      const [day, monthNum, year] = month.split('/');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    }
    if (month.includes('-')) {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    }
    return month;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white">Tabela de Pontuações</h2>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 px-4 text-slate-300 font-semibold">#</th>
              <th className="text-left py-4 px-4">
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-2 text-slate-300 font-semibold hover:text-white transition-colors"
                >
                  Nome
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-right py-4 px-4">
                <button
                  onClick={() => toggleSort('score')}
                  className="flex items-center gap-2 ml-auto text-slate-300 font-semibold hover:text-white transition-colors"
                >
                  Pontuação
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-4 px-4 text-slate-400 font-medium">{index + 1}</td>
                <td className="py-4 px-4 text-white font-medium">{player.name}</td>
                <td className="py-4 px-4 text-right">
                  <span className="text-amber-400 font-bold text-lg">{player.currentScore}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedPlayers.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          Nenhum jogador encontrado para este mês
        </div>
      )}
    </div>
  );
}
