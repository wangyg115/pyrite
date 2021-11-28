![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

# About

[Pyrite](https://pyrite.video) is a [Vue 3](https://v3.vuejs.org/) web(RTC) client and
[Express.js](http://expressjs.com/) operator backend for the [Galène](https://github.com/jech/galene)
SFU. Its purpose is to help establish a [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software)
alternative to proprietary video-conferencing services.

## Getting Started

Requires: Node.js, Golang, Firefox/Chromium

```bash
# Install Galène
cd ~/code
git clone https://github.com/jech/galene
cd galene
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
./galene --insecure

# Start Pyrite from npm
npx @garage44/pyrite
[INFO] verifying configuration
[INFO] no settings file found; generate one...
? Path to Galène SFU: ~/code/galene
[INFO] config file written to: /home/you/.pyriterc
[INFO] writing initial users.json
[DEBUG] save new user b6676bd5-7d9a-4b91-b0e6-a8f0673d113c
[INFO] creating sfu config: /home/you/code/galene/data/config.json
[INFO] pyrite listening: 127.0.0.1:3030
```

* Open a browser to <http://localhost:3030>
* Click on the logo to switch to operator mode

* Find the administrator password:

  ```bash
  cat ~/code/galene/data/users.json
  ```

* Create groups & users

### Deployment

Running Pyrite & Galène over a network requires additional configuration.
Checkout the [docs](./docs/index.md) for more information about setting up
a proxy and configuring all services.

## Developers

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i  # Install dependencies
  npm run galene  # Run dockerized galene

  npm run build
  # Use PYRITE_NO_SECURITY=1 env to bypass session security
  npm run pyrite
  npm run dev
  ```

For a quick test, you can also fire up a second browser with a fake WebRTC
device. This can be done with:

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3030
```
