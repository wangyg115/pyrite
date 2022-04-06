![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

[Galène](https://galene.org/) is a videoconference server (an “SFU”) that is easy
to deploy and that requires moderate server resources. [Pyrite](https://pyrite.video)
is an alternative web client and management interface based on the [Vue](https://v3.vuejs.org/) framework. Learn more about Pyrite's [features](./docs/features.md) or read the
[documentation](./docs/index.md) about topics like deploying Pyrite on a network.

## Installation

### Docker

```bash
git clone https://github.com/garage44/pyrite
cd pyrite/docker
PYRITE_UID=1000 PYRITE_GID=1000 docker-compose up
# Open a browser to http://localhost:3030
```

### Vanilla

```bash
git clone https://github.com/jech/galene
cd galene
git checkout galene-0.5.1
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
./galene --insecure
```

```bash
npx @garage44/pyrite:latest
```

<img height="300" src="./docs/pyrite.png">
<img height="300" src="./docs/pyrite-admin.png">
