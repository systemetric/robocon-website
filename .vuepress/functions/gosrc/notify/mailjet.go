package notify

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin/json"
	"github.com/go-http-utils/headers"
	"io/ioutil"
	"net/http"
	"os"
)

const (
	mailjetSendUrl    = "https://api.mailjet.com/v3.1/send"
	mailjetTemplateID = 629876
	mailjetFromEmail  = "noreply@hr-robocon.org"
	mailjetFromName   = "Robocon"
)

var (
	mailjetApiKey    = os.Getenv("MAILJET_API_KEY")
	mailjetSecretKey = os.Getenv("MAILJET_SECRET_KEY")
)

var mailjetAuthorization = "Basic " + base64.StdEncoding.EncodeToString(
	[]byte(fmt.Sprintf("%s:%s", mailjetApiKey, mailjetSecretKey)),
)

type mailjetUser struct {
	Email string `json:"Email"`
	Name  string `json:"Name"`
}

type mailjetMessage struct {
	From             mailjetUser            `json:"From"`
	To               []mailjetUser          `json:"To"`
	TemplateID       int                    `json:"TemplateID"`
	TemplateLanguage bool                   `json:"TemplateLanguage"`
	Subject          string                 `json:"Subject"`
	Variables        map[string]interface{} `json:"Variables"`
}

type mailjetMessages struct {
	Messages []mailjetMessage `json:"Messages"`
}

func (m *mailjetMessages) send(c *http.Client) error {
	body, err := json.Marshal(m)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, mailjetSendUrl, bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set(headers.ContentType, "application/json")
	req.Header.Set(headers.Authorization, mailjetAuthorization)

	res, err := c.Do(req)
	if err != nil {
		return err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return err
		}
		return errors.New(string(body))
	}
	return nil
}
