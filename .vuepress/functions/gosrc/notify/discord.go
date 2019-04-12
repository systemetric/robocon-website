package notify

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/go-http-utils/headers"
	"io/ioutil"
	"net/http"
	"os"
)

const discordEmbedColour = "38143"

var (
	discordWebhookUrl     = os.Getenv("DISCORD_WEBHOOK_URL")
	discordSupportMention = os.Getenv("DISCORD_SUPPORT_MENTION")
)

type discordEmbed struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Url         string `json:"url"`
	Color       string `json:"color"`
}

type discordMessage struct {
	Content string         `json:"content"`
	Embeds  []discordEmbed `json:"embeds"`
}

func (m *discordMessage) send(c *http.Client) error {
	for _, e := range m.Embeds {
		e.Color = discordEmbedColour
	}

	body, err := json.Marshal(m)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, discordWebhookUrl, bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set(headers.ContentType, "application/json")

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
