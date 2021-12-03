# Services

## Galène

In this setup, a separate `pyrite` user is created on a (Arch)linux VPS,
using its own home directory. Install Galène with:

```bash
cd ~
git clone https://github.com/jech/galene
cd galene
# Currently using 0.4.2
git checkout galene-0.4.2
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
```

Next, create a systemd service for Galène:

```bash
vim /etc/systemd/system/galene.service
```

```bash
[Unit]
Description=Galene
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/pyrite/galene
User=pyrite
Group=pyrite
ExecStart=/home/pyrite/galene/galene --insecure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Verify whether Galène starts properly first:

```bash
cd ~/galene
./galene --insecure
2021/12/03 18:19:22 Starting built-in TURN server on :1194
2021/12/03 18:19:22 TURN: no public addresses
```

Everything is ok; stop the process and verify the service:

```bash
systemd start galene
ps -A|grep galene
# 300876 ?        00:01:04 galene
# The service runs, enable the service so it auto-starts after reboot
systemd enable galene
```

## Pyrite

In this example we use the latest version of Pyrite from npm. After each restart,
npx will check for a new version to run. This is in most situations the desired
situation, but you might want to use version pinning; because things may break
after an update.

```bash
vim /etc/systemd/system/pyrite.service
```

```bash
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/galene
User=galene
Group=galene
ExecStart=npx @garage44/pyrite@latest
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Verify Pyrite starts properly first:

```bash
npx @garage44/pyrite@latest
```

Start and enable the systemd service:

```bash
systemd enable pyrite
systemd start pyrite
```
