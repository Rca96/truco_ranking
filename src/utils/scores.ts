import { Player } from '../types';

export const calculateTotalScore = (scores: Record<string, number>): number => {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
};

export const getAllMonths = (players: Player[]): string[] => {
  const monthsSet = new Set<string>();

  players.forEach(player => {
    Object.keys(player.scores).forEach(month => monthsSet.add(month));
  });

  const monthsArray = Array.from(monthsSet);
  
  const monthOrder: Record<string, number> = {
    'Jan': 1, 'Fev': 2, 'Mar': 3, 'Abr': 4, 'Mai': 5, 'Jun': 6,
    'Jul': 7, 'Ago': 8, 'Set': 9, 'Out': 10, 'Nov': 11, 'Dez': 12
  };

  return monthsArray.sort((a, b) => {
    if (a.includes('/') && b.includes('/')) {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    }
    
    if (a.includes('-') && b.includes('-')) {
      return a.localeCompare(b);
    }
    
    const orderA = monthOrder[a] || 0;
    const orderB = monthOrder[b] || 0;
    return orderA - orderB;
  });
};
