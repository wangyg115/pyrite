FROM alpine

RUN apk update
RUN apk add --update nodejs npm

WORKDIR /usr/app
COPY *.tgz .
RUN tar xfz *.tgz
WORKDIR /usr/app/package
RUN npm i
CMD node admin/app.js --sfuPath=/usr/app/galene/ --sfuUrl=http://galene:8443 --config=/usr/app/config/.pyriterc
