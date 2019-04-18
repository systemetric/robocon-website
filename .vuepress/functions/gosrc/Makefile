build:
	go env
	whoami
	chmod -R 777 /opt/build/cache/.gimme_cache/.gimme_cache/gopath/pkg/mod/
	ls -al
	ls -al /opt/build/cache/.gimme_cache/.gimme_cache/gopath/pkg/mod/github.com/aws/aws-lambda-go*/
	go build -o ./function ./main.go
	chmod -R 777 /opt/build/cache/.gimme_cache/.gimme_cache/gopath/pkg/mod/
	mkdir -p ../dist
	cp ./function ../dist/post
	cp ./function ../dist/verify
