import { Trophy, Medal } from 'lucide-react';
import { Player, PlayerWithTotal } from '../types';
import { calculateTotalScore } from '../utils/scores';

interface TopThreeProps {
  players: Player[];
}

export default function TopThree({ players }: TopThreeProps) {
  const playersWithTotals: PlayerWithTotal[] = players
    .map(player => ({
      ...player,
      totalScore: calculateTotalScore(player.scores)
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3);

  const getPodiumClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-br from-amber-400 to-amber-600 h-64';
      case 1:
        return 'bg-gradient-to-br from-slate-300 to-slate-400 h-52';
      case 2:
        return 'bg-gradient-to-br from-amber-600 to-amber-800 h-44';
      default:
        return '';
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-12 h-12 text-amber-900" />;
      case 1:
        return <Medal className="w-10 h-10 text-slate-700" />;
      case 2:
        return <Medal className="w-10 h-10 text-amber-950" />;
      default:
        return null;
    }
  };

  const podiumOrder = [playersWithTotals[1], playersWithTotals[0], playersWithTotals[2]];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Top 3 - Ranking Geral</h2>

      <div className="flex items-end justify-center gap-6 min-h-[320px]">
        {podiumOrder.map((player, displayIndex) => {
          if (!player) return null;
          const actualIndex = displayIndex === 0 ? 1 : displayIndex === 1 ? 0 : 2;

          return (
            <div key={player.id} className="flex flex-col items-center gap-4 w-48">
              <div className="text-center mb-4">
                <div className="flex justify-center mb-3">
                  {getMedalIcon(actualIndex)}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
                <p className="text-3xl font-bold text-amber-400">{player.totalScore}</p>
                <p className="text-sm text-slate-400">pontos</p>
              </div>

              <div className={`${getPodiumClass(actualIndex)} w-full rounded-t-xl flex items-center justify-center transition-all duration-300 hover:scale-105`}>
                <span className="text-6xl font-bold text-white/20">{actualIndex + 1}º</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
