FROM golang:1.15
WORKDIR /go/src/galene
RUN go mod init

RUN go get -d -v github.com/jech/galene@d78a750
RUN go install -v github.com/jech/galene
CMD ["galene", "--insecure"]
