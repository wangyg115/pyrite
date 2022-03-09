FROM alpine

RUN apk update
RUN apk add --update nodejs npm

WORKDIR /usr/app
RUN npm i @garage44/pyrite

CMD npx @garage44/pyrite --sfuPath=~/galene

