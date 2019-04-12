package verify

import (
	"cloud.google.com/go/firestore"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/context"
	"gosrc/fire"
	"net/http"
)

type verifyRequest struct {
	Code string `json:"code" binding:"required"`
}

func verifyCode(c *gin.Context) {
	req := verifyRequest{}
	err := c.BindJSON(&req)
	if err != nil {
		fmt.Print("err parsing request body\n")
		return
	}

	uid := fire.User(c)

	validCodesRef := fire.ValidCodes(c)
	userCodesRef := fire.UserCodes(c)

	err = fire.Store(c).RunTransaction(c, func(ctx context.Context, tx *firestore.Transaction) error {
		fmt.Printf("verifying code: %s\n", req.Code)

		doc, err := tx.Get(validCodesRef)
		if err != nil {
			return err
		}
		validCodes := doc.Data()

		remainingUses, _ := validCodes[req.Code].(int64)
		if remainingUses == -10 {
			fmt.Println("code never expires so valid")
			err = tx.Set(
				userCodesRef,
				map[string]interface{}{
					uid: req.Code,
				},
				firestore.MergeAll,
			)
			return err
		} else if remainingUses <= 0 {
			fmt.Println("code expired or never existed")
			return errors.New("code expired")
		}

		fmt.Println("code valid")

		err = tx.Set(
			validCodesRef,
			map[string]interface{}{
				req.Code: remainingUses - 1,
			},
			firestore.MergeAll,
		)
		if err != nil {
			return err
		}

		return tx.Set(
			userCodesRef,
			map[string]interface{}{
				uid: req.Code,
			},
			firestore.MergeAll,
		)
	})
	if err != nil {
		fmt.Printf("err running transaction: %v\n", err)
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
}
