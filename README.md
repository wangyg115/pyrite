![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

[Galène](https://galene.org/) is a videoconference server (an “SFU”) that is easy
to deploy and that requires moderate server resources. [Pyrite](https://pyrite.video)
is an alternative web client and management interface based on the
[Vue](https://v3.vuejs.org/) framework. Checkout the documentation to learn more
about Pyrite's [features](./docs/features.md) or to find instructions how to
deploy Pyrite on a network.

# Installation

## Docker

For a quick try, just try the Docker-compose config, which includes Docker
images for the Galène & Pyrite service.

```bash
git clone https://github.com/garage44/pyrite
cd pyrite/docker
id # Find out your host user/group id; used to keep volume permissions sane
PYRITE_UID=1000 PYRITE_GID=1000 docker-compose up
```

## Vanilla Galène

As an alternative, build Galène manually:

```bash
git clone https://github.com/jech/galene
cd galene
git checkout galene-0.5.1
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
./galene --insecure
```

### Pyrite - Published

No need to build Pyrite manually; just run it directly from npm if you
trust the package. This is the Express service that also exposes the frontend
as one single service:

```bash
npx @garage44/pyrite:latest
```

### Pyrite - Development

The manual build is for development, or to get a grasp of how services interact.
The Express service and the frontend (Vitejs) are started separately to keep
development simple:

```bash
cd pyrite
npm install
npm run dev  # run frontend service on http://localhost:3000
nodemon admin/app.js  # run Express backend on http://localhost:3030
```

:tada: Open a browser: <http://localhost:3030>

<p float="left">
    <img width="300" src="./docs/pyrite.png">
    <img width="300" src="./docs/pyrite-admin.png">
</p>
