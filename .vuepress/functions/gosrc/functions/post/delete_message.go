package post

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"gosrc/fire"
	"net/http"
)

type deleteMessageRequest struct {
	ThreadID  string `json:"threadId" binding:"required"`
	MessageID string `json:"messageId" binding:"required"`
}

func deleteMessage(c *gin.Context) {
	req := deleteMessageRequest{}
	err := c.BindJSON(&req)
	if err != nil {
		fmt.Print("err parsing request body\n")
		return
	}

	doc := fire.Threads(c).Doc(req.ThreadID).Collection(messagesCollection).Doc(req.MessageID)

	snapshot, err := doc.Get(c)
	if err != nil || !snapshot.Exists() {
		fmt.Printf("err cannot find message to delete\n")
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

			_, err := doc.Delete(c)
			if err != nil {
				fmt.Printf("err deleting message: %v\n", err)
				c.AbortWithStatus(http.StatusInternalServerError)
			}

			err = updateAnswerCount(c, req.ThreadID, -1)
			if err != nil {
				fmt.Printf("err updating answer count: %v\n", err)
				c.AbortWithStatus(http.StatusInternalServerError)
				return
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
