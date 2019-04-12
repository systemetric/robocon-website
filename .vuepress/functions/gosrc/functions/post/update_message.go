package post

import (
	"cloud.google.com/go/firestore"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gosrc/fire"
	"net/http"
)

type updateMessageRequest struct {
	ThreadID        string `json:"threadId" binding:"required"`
	MessageID       string `json:"messageId" binding:"required"`
	Content         string `json:"content" binding:"required"`
	RenderedContent string `json:"renderedContent" binding:"required"`
}

func updateMessage(c *gin.Context) {
	req := updateMessageRequest{}
	err := c.BindJSON(&req)
	if err != nil {
		fmt.Print("err parsing request body\n")
		return
	}

	doc := fire.Threads(c).Doc(req.ThreadID).Collection(messagesCollection).Doc(req.MessageID)

	snapshot, err := doc.Get(c)
	if err != nil || !snapshot.Exists() {
		fmt.Printf("err cannot find message to update\n")
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	if author, ok := snapshot.Data()["author"].(map[string]interface{}); ok {
		if uid, ok := author["uid"].(string); ok {
			user := fire.User(c)

			if uid != user && !moderators[user] {
				fmt.Printf("err unauthorized: required user %s\n", uid)
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}

			_, err := doc.Update(c, []firestore.Update{
				{
					Path:  "content",
					Value: req.Content,
				},
				{
					Path:  "renderedContent",
					Value: req.RenderedContent,
				},
			})
			if err != nil {
				fmt.Printf("err updating message: %v\n", err)
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		} else {
			fmt.Print("err invalid firestore structure for author\n")
			c.AbortWithStatus(http.StatusInternalServerError)
		}
	} else {
		fmt.Print("err invalid firestore structure for message\n")
		c.AbortWithStatus(http.StatusInternalServerError)
	}
}

func updateAnswerCount(c *gin.Context, threadId string, change int64) error {
	doc := fire.Threads(c).Doc(threadId)

	snapshot, err := doc.Get(c)
	if err != nil {
		return err
	}
	if !snapshot.Exists() {
		return errors.New("thread not found")
	}

	if answerCount, ok := snapshot.Data()["answers"].(int64); ok {
		_, err := doc.Update(c, []firestore.Update{
			{
				Path:  "answers",
				Value: answerCount + change,
			},
		})
		return err
	} else {
		return errors.New("unable to get current answer count")
	}
}
