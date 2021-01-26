FROM golang:1.15
WORKDIR /go/src/galene
RUN go get -d -v github.com/jech/galene
RUN go install -v github.com/jech/galene
CMD ["galene", "--insecure"]
