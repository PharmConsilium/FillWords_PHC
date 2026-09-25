# FillWords PHC

В репозитории лежат два отдельных проекта филвордов:

- `BYER/` — версия для Bayer;
- `EGIS/` — версия для EGIS.

Каждый проект запускается и собирается из своей папки.

```bash
cd BYER
npm install
npm run dev
```

```bash
cd EGIS
npm install
npm run dev
```

## Deploy (Vercel)

Один GitHub-репозиторий → **два отдельных Vercel Project**. Так Bayer и EGIS не пересекаются: разные Root Directory, билды, env и домены.

| Vercel project (пример) | Root Directory | Build | Output |
| --- | --- | --- | --- |
| `fillwords-bayer` | `BYER` | `npm run build` | `dist` |
| `fillwords-egis` | `EGIS` | `npm run build` | `dist` |

### Настройка каждого проекта

1. Vercel → **Add New Project** → тот же репо `PharmConsilium/FillWords_PHC`.
2. Указать **Root Directory**: `BYER` или `EGIS`.
3. Framework: Vite (или Other). Install: `npm install`. Build / Output — как в таблице выше.
4. Env vars задавать **отдельно** в каждом проекте: Project Settings → Environment Variables (локально — `.env.bayer` / `.env.egis` или `.env` по `.env.example`).
5. На каждый проект — свой production URL / custom domain.

`BYER/vercel.json` и `EGIS/vercel.json` уже содержат SPA rewrite; Vercel подхватит их из Root Directory.

### Ignored Build Step

Без этой настройки push в `main` может запускать оба билда. Чтобы правки только в одной папке не пересобирали второй проект, в каждом Vercel-проекте включить **Ignored Build Step** (Project Settings → Git):

- Bayer: `git diff --quiet HEAD^ HEAD -- ./BYER`
- EGIS: `git diff --quiet HEAD^ HEAD -- ./EGIS`

Если в своей папке нет изменений — exit `0`, Vercel **скипает** билд; если есть — exit `1`, билдит.
