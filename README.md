![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

[Pyrite](https://pyrite.video) is a WebRTC client ([Vue](https://v3.vuejs.org/)/[Express.js](http://expressjs.com/))
for the [Galène](https://github.com/jech/galene) video conferencing server. Its purpose is to accomodate
the need for a simple & efficient [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software)
video-conferencing stack.

# Getting Started

> HTTPS is a requirement in a networked situation. Checkout the deployment section
> for information about how to setup the stack.

## Install Galène

> Requires Golang

```bash
cd ~/code
git clone https://github.com/jech/galene
cd galene
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
./galene --insecure
```

## Install Pyrite

> Requires Node.js

```bash
npx @garage44/pyrite
```

You should see a similar startup sequence:

```bash
[INFO] verifying configuration
[INFO] no settings file found; generate one...
? Path to Galène SFU: ~/code/galene
[INFO] config file written to: /home/you/.pyriterc
[INFO] writing initial users.json
[DEBUG] save new user b6676bd5-7d9a-4b91-b0e6-a8f0673d113c
[INFO] creating sfu config: /home/you/code/galene/data/config.json
[INFO] pyrite listening: 127.0.0.1:3030
```

Open a browser to <http://localhost:3030> and click on the logo
to switch to operator mode. You can find the users passwords
in the users.json file:

```bash
cat ~/code/galene/data/users.json
```

Next, create some groups & users. For a quick test, you can fire up a
second Chromium browser with a fake WebRTC device:

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3030
```

# Deployment

Running Pyrite & Galène over a network requires additional configuration.
Checkout the [docs](./docs/index.md) for more information about setting up
a proxy and configuring all services.

## Developers

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i  # Install dependencies
  npm run galene  # Run dockerized galene
  # Uses Nodemon autoreload. Use PYRITE_NO_SECURITY=1 to bypass session security
  npm run pyrite
  # Vite development server with proxy
  npm run dev
  ```
