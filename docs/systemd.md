# Systemd

Create a systemd service:

```bash
[Unit]
Description=Galene
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/galene/galene
User=galene
Group=galene
ExecStart=/home/galene/galene/galene --insecure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```
