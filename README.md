# ifs24010-pabwe2026-sk-p5-nuxt — Delcom Cash Flow (Nuxt 4 + TypeScript)

## Menjalankan
```bash
bun install
cp .env.example .env
bun run dev              # http://localhost:3000
bun run test             # semua unit & integration test
bun run test:coverage    # test + coverage (threshold 100%), output: coverage/lcov.info
bun run build && bun run start   # build produksi + preview (untuk Lighthouse/Axe)
```

## SonarQube / Jenkins
`sonar-project.properties` membaca `coverage/lcov.info`; jalankan `bun run test:coverage` sebelum `sonar-scanner`.
