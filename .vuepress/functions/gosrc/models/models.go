package models

import (
	"strings"
	"time"
)

type Author struct {
	Uid         string `json:"uid" binding:"required" firestore:"uid"`
	Email       string `json:"email" binding:"required" firestore:"email"`
	DisplayName string `json:"name" binding:"required" firestore:"name"`
	PhotoURL    string `json:"photo" binding:"required" firestore:"photo"`
}

type Thread struct {
	Title        string    `firestore:"title"`
	LastModified time.Time `firestore:"lastModified"`
	Author       Author    `firestore:"author"`
	Answers      int       `firestore:"answers"`
	Resolved     bool      `firestore:"resolved"`
}

type Message struct {
	Content         string    `firestore:"content"`
	RenderedContent string    `firestore:"renderedContent"`
	LastModified    time.Time `firestore:"lastModified"`
	Author          Author    `firestore:"author"`
}

func (a *Author) FirstName() string {
	return strings.Split(a.DisplayName, " ")[0]
}
