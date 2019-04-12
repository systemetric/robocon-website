package notify

import (
	"fmt"
	"gosrc/models"
	"log"
	"net/http"
	"time"
)

const (
	forumName       = "Robocon Forum"
	threadUrlFormat = "https://hr-robocon.org/forum/%s.html"
)

type Notification struct {
	Created         bool
	ThreadID        string
	ThreadTitle     string
	Author          models.Author
	Content         string
	RenderedContent string
	OtherUsers      []models.Author
}

func (n *Notification) Send() {
	c := &http.Client{
		Timeout: time.Second * 5,
	}

	threadUrl := fmt.Sprintf(threadUrlFormat, n.ThreadID)

	var discordAction string
	if n.Created {
		discordAction = "created a new thread"
	} else {
		discordAction = fmt.Sprintf("posted a new message in \"%s\"", n.ThreadTitle)
	}
	discordMsg := discordMessage{
		Content: fmt.Sprintf("%s, %s %s!", discordSupportMention, n.Author.FirstName(), discordAction),
		Embeds: []discordEmbed{
			{
				Title:       n.ThreadTitle,
				Description: n.Content,
				Url:         threadUrl,
				Color:       discordEmbedColour,
			},
		},
	}
	err := discordMsg.send(c)
	if err != nil {
		log.Printf("error sending discord message: %v", err)
	}

	emailFrom := mailjetUser{
		Email: mailjetFromEmail,
		Name:  mailjetFromName,
	}
	emailSubject := fmt.Sprintf("%s Notification: %s", forumName, n.ThreadTitle)
	emailVariables := map[string]interface{}{
		"replyName":  n.Author.FirstName(),
		"threadName": n.ThreadTitle,
		"reply":      n.RenderedContent,
		"replyText":  n.Content,
		"threadUrl":  threadUrl,
	}

	var emails []mailjetMessage
	for _, otherUser := range n.OtherUsers {
		email := mailjetMessage{
			From: emailFrom,
			To: []mailjetUser{
				{
					Email: otherUser.Email,
					Name:  otherUser.DisplayName,
				},
			},
			TemplateID:       mailjetTemplateID,
			TemplateLanguage: true,
			Subject:          emailSubject,
			Variables:        emailVariables,
		}
		emails = append(emails, email)
	}

	mailjetEmails := mailjetMessages{
		Messages: emails,
	}
	err = mailjetEmails.send(c)
	if err != nil {
		log.Printf("error sending mailjet messages: %v", err)
	}
}
