package verify

import "github.com/gin-gonic/gin"

func Register(f *gin.RouterGroup) {
	g := f.Group("/verify")
	{
		g.PATCH("", verifyCode)
	}
}
