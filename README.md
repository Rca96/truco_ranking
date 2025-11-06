# truco_ranking
Projeto para exibir placar de truco

┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS                             │
│              (Fonte dos dados de pontuação)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 1. Usuário clica em "Sincronizar"
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                          │
│                  sync-scores                                 │
│  • Busca CSV do Google Sheets                                │
│  • Faz parse dos dados                                       │
│  • Salva no banco de dados                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 2. Dados salvos no banco
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE (PostgreSQL)                  │
│                                                               │
│  Tabela: players                                             │
│  ┌────────────────────────────────┐                         │
│  │ id (uuid)                       │                         │
│  │ name (text)                     │                         │
│  │ created_at (timestamp)          │                         │
│  └────────────────────────────────┘                         │
│                                                               │
│  Tabela: scores                                              │
│  ┌────────────────────────────────┐                         │
│  │ id (uuid)                       │                         │
│  │ player_id (uuid) → players.id   │                         │
│  │ month (text) - ex: "Set", "Out" │                         │
│  │ score (integer)                 │                         │
│  │ created_at, updated_at          │                         │
│  └────────────────────────────────┘                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 3. Frontend busca dados
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT FRONTEND                                  │
│              (Vite + TypeScript + Tailwind)                  │
│                                                               │
│  App.tsx                                                     │
│  ├─ TopThree.tsx (Top 3 jogadores)                          │
│  └─ ScoresTable.tsx (Tabela completa)                       │
│                                                               │
│  Services:                                                   │
│  └─ scoreService.ts                                          │
│     ├─ fetchPlayersFromDatabase()                           │
│     └─ syncScoresFromSheet()                                │
└─────────────────────────────────────────────────────────────┘
