build:
	go env
	whoami
	ls -al
	ls -al /opt/build/cache/.gimme_cache/.gimme_cache/gopath/pkg/mod/github.com/aws/aws-lambda-go*/
	go build -o ./function ./main.go
	mkdir -p ../dist
	cp ./function ../dist/post
	cp ./function ../dist/verify
