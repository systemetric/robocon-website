package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-http-utils/headers"
	"gosrc/fire"
	"gosrc/functions/post"
	"gosrc/functions/verify"
	"gosrc/lambdaify"
	"log"
	"os"
)

func headerLogger(c *gin.Context) {
	fmt.Printf("> %s %s\n", c.Request.Method, c.Request.URL.Path)

	for k, v := range c.Request.Header {
		if len(v) == 1 {
			c.Request.Header.Set(k, v[0])
			fmt.Printf("> %s: %s\n", k, v[0])
		} else {
			fmt.Printf("> %s: %s\n", k, v)
		}
	}
}

func main() {
	dev := os.Getenv("GO_ENV") == "development"

	if !dev {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx := context.Background()
	ctx = fire.WithFirebase(ctx)

	r := gin.Default()

	if dev {
		config := cors.DefaultConfig()
		config.AllowAllOrigins = true
		config.AllowHeaders = append(config.AllowHeaders, headers.Authorization)
		r.Use(cors.New(config))
	}

	f := r.Group(
		"/.netlify/functions",
		headerLogger,
		func(c *gin.Context) {
			c.Set("ctx", ctx)
		},
		fire.RequiresAuth,
	)
	{
		post.Register(f)
		verify.Register(f)
	}

	if dev {
		log.Fatal(r.Run(":9000"))
	} else {
		lambda.Start(lambdaify.Lambdaify(r))
	}

}
