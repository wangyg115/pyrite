FROM golang:1.15

WORKDIR /go/src/galene
RUN go mod init
RUN go get -d -v github.com/jech/galene@master
RUN go install -v github.com/jech/galene
CMD ["galene", "--insecure"]
