package fire

import (
	"cloud.google.com/go/firestore"
	"firebase.google.com/go"
	"firebase.google.com/go/auth"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-http-utils/headers"
	"golang.org/x/net/context"
	"google.golang.org/api/option"
	"net/http"
	"os"
	"strings"
)

type key string

const databaseURL = "https://hr-robocon.firebaseio.com/"

const (
	authKey  = key("auth")
	storeKey = key("store")
	userKey  = "user"
)

func WithFirebase(ctx context.Context) context.Context {
	opt := option.WithCredentialsJSON([]byte(os.Getenv("FIREBASE_KEY")))
	conf := &firebase.Config{
		DatabaseURL: databaseURL,
	}
	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		panic(err)
	}

	appAuth, err := app.Auth(ctx)
	if err != nil {
		panic(err)
	}

	appStore, err := app.Firestore(ctx)
	if err != nil {
		panic(err)
	}

	ctx = context.WithValue(ctx, authKey, appAuth)
	ctx = context.WithValue(ctx, storeKey, appStore)
	return ctx
}

func Auth(c *gin.Context) *auth.Client {
	return ctxRaw(c).Value(authKey).(*auth.Client)
}

func Store(c *gin.Context) *firestore.Client {
	return ctxRaw(c).Value(storeKey).(*firestore.Client)
}

func ctxRaw(c *gin.Context) context.Context {
	return c.MustGet("ctx").(context.Context)
}

func RequiresAuth(c *gin.Context) {
	authHeader := strings.Split(c.GetHeader(headers.Authorization), " ")
	if len(authHeader) != 2 {
		fmt.Printf("err parsing auth header: invalid length: got %d, expected 2\n", len(authHeader))
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	if authHeader[0] == "Bearer" {
		token, err := Auth(c).VerifyIDToken(c, authHeader[1])
		if err != nil {
			fmt.Printf("err verifying id token: %v\n", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set(userKey, token.UID)
	} else if authHeader[0] == "User" && gin.Mode() == gin.DebugMode {
		fmt.Print("warn: using auth string as user uid\n")
		c.Set(userKey, authHeader[1])
	} else {
		fmt.Printf("err parsing auth header: unknown auth type: %s\n", authHeader[0])
		c.AbortWithStatus(http.StatusBadRequest)
	}
}

func User(c *gin.Context) string {
	return c.GetString(userKey)
}

func Threads(c *gin.Context) *firestore.CollectionRef {
	return Store(c).Collection("threads")
}

func ValidCodes(c *gin.Context) *firestore.DocumentRef {
	return Store(c).Doc("meta/codes")
}

func UserCodes(c *gin.Context) *firestore.DocumentRef {
	return Store(c).Doc("meta/usercodes")
}
