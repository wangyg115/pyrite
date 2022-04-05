FROM alpine

RUN apk update
RUN apk add --update nodejs npm

WORKDIR /usr/app
RUN npm i @garage44/pyrite@1.11.5

CMD npx @garage44/pyrite --sfuPath=/usr/app/galene/ --config=/usr/app/config/.pyriterc

