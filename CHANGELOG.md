# Changelog

Each release is a git tag `vX.Y.Z`. The running version comes from that tag (`git describe`) and
is shown in the page footer and in `GET /api/health`.

## 1.0.0 (2026-11-28)

- The page footer and `/api/health` show the release version, read from the git tag (#3).
- The collector follows redirects itself and closes every response it does not read. Node 24's
  fetch left the socket of each unread redirect open, so the server leaked one connection per
  refresh. Pages that moved are now fetched at their new addresses, and each move is logged (#1).
- Tracks the products the moved pages now describe: Grok 4.7, Kimi K3.1 Pro and MiniMax M3.1
  Flash on the M Plan, with the M Plan's 5-hour and weekly usage windows (#2).
