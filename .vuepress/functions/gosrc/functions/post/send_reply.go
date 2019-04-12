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

type sendReplyRequest struct {
	Author          models.Author   `json:"author" binding:"required"`
	ThreadID        string          `json:"threadId" binding:"required"`
	ThreadTitle     string          `json:"threadTitle" binding:"required"`
	Content         string          `json:"content" binding:"required"`
	RenderedContent string          `json:"renderedContent" binding:"required"`
	OtherUsers      []models.Author `json:"otherUsers" binding:"required"`
}

func sendReply(c *gin.Context) {
	req := sendReplyRequest{}
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

	doc := fire.Threads(c).Doc(req.ThreadID)

	now := time.Now()

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

	err = updateAnswerCount(c, req.ThreadID, 1)
	if err != nil {
		fmt.Printf("err updating answer count: %v\n", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	notification := &notify.Notification{
		Created:         false,
		ThreadID:        doc.ID,
		ThreadTitle:     req.ThreadTitle,
		Author:          req.Author,
		Content:         newMessage.Content,
		RenderedContent: newMessage.RenderedContent,
		OtherUsers:      req.OtherUsers,
	}
	notification.Send()
}
