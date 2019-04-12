package post

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"gosrc/fire"
	"gosrc/models"
	"gosrc/notify"
	"net/http"
	"time"
)

type createThreadRequest struct {
	Author          models.Author `json:"author" binding:"required"`
	ThreadTitle     string        `json:"title" binding:"required"`
	Content         string        `json:"content" binding:"required"`
	RenderedContent string        `json:"renderedContent" binding:"required"`
}

func createThread(c *gin.Context) {
	req := createThreadRequest{}
	err := c.BindJSON(&req)
	if err != nil {
		fmt.Print("err parsing request body\n")
		return
	}
	if req.Author.Uid != fire.User(c) {
		fmt.Printf("err unauthorized: required user %s\n", req.Author.Uid)
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	threads := fire.Threads(c)

	now := time.Now()

	newThread := &models.Thread{
		Title:        req.ThreadTitle,
		LastModified: now,
		Author:       req.Author,
		Answers:      0,
		Resolved:     false,
	}

	doc, _, err := threads.Add(c, newThread)
	if err != nil {
		fmt.Printf("err adding new thread: %v\n", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	newMessage := &models.Message{
		Content:         req.Content,
		RenderedContent: req.RenderedContent,
		LastModified:    now,
		Author:          req.Author,
	}

	_, _, err = doc.Collection(messagesCollection).Add(c, newMessage)
	if err != nil {
		fmt.Printf("err adding new message: %v\n", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	notification := &notify.Notification{
		Created:         true,
		ThreadID:        doc.ID,
		ThreadTitle:     newThread.Title,
		Author:          newThread.Author,
		Content:         newMessage.Content,
		RenderedContent: newMessage.RenderedContent,
		OtherUsers:      nil,
	}
	notification.Send()
}
