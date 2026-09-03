# Server scheduling

The production deployment refreshes the public snapshot automatically with a
systemd user timer. It calls the existing Token Weather `POST /api/refresh`
endpoint every 30 minutes, after a five-minute boot delay.

The refresh is global and anonymous. It reads only configured public provider
documentation, status endpoints, and official blog feeds. It does not accept
visitor credentials, account identifiers, workload headers, or personal quota
data. A failed source remains an error and never becomes a forecast value.

## Install or update on San Francisco

From the server deployment checkout:

```bash
cd ~/deployments/token-weather
systemctl --user link "$PWD/deploy/token-weather-refresh.service" "$PWD/deploy/token-weather-refresh.timer"
systemctl --user daemon-reload
systemctl --user enable --now token-weather-refresh.timer
systemctl --user start token-weather-refresh.service
```

The server user has lingering enabled, so the user timer continues across
logout and reboot. The dashboard service and refresh job use the same
repository checkout; no Caddy change is required.

## Verify

```bash
systemctl --user list-timers token-weather-refresh.timer
systemctl --user status token-weather-refresh.service --no-pager
curl -fsS https://tokenweather.outerstellar.net/api/health
curl -fsS https://tokenweather.outerstellar.net/api/snapshot
```

The refresh service prints a JSON summary containing the generated timestamp,
successful documentation/status/statement counts, and any source errors.

## Stop or remove the schedule

```bash
systemctl --user disable --now token-weather-refresh.timer
systemctl --user unlink "$HOME/deployments/token-weather/deploy/token-weather-refresh.service" "$HOME/deployments/token-weather/deploy/token-weather-refresh.timer"
systemctl --user daemon-reload
```
