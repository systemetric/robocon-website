package post

import (
	"github.com/gin-gonic/gin"
)

const messagesCollection = "messages"

var moderators = map[string]bool{
	// Brendan
	"52x2JtYXJJWqfsWMRzDXHN478wl1": true,
	// Edwin
	"W3jjq7ZZDbPV38TZUoWRd5zPypV2": true,
}

func Register(f *gin.RouterGroup) {
	g := f.Group("/post")
	{
		g.POST("", createThread)
		g.PUT("", sendReply)
		g.PATCH("", updateMessage)
		g.DELETE("", deleteMessage)
	}
}
