FROM alpine

RUN apk update
RUN apk add --update nodejs npm

WORKDIR /usr/app
RUN npm i @garage44/pyrite@latest

CMD npx @garage44/pyrite --sfuPath=/usr/app/galene/ --config=/usr/app/config/.pyriterc

