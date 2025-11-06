export interface Player {
  id: string;
  name: string;
  scores: Record<string, number>;
}

export interface PlayerWithTotal extends Player {
  totalScore: number;
}
