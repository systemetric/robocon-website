package cats

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const (
	requiredHour      = 18
	minRequiredMinute = 25
	maxRequiredMinute = 35
)

var (
	discordCatWebhookUrl = os.Getenv("DISCORD_CAT_WEBHOOK_URL")
	loc                  *time.Location
)

func Register(f *gin.RouterGroup) {
	var err error
	loc, err = time.LoadLocation("Europe/London")
	if err != nil {
		panic(err)
	}

	g := f.Group("/cats")
	{
		g.POST("", sendCat)
	}
}

func sendCat(c *gin.Context) {
	// Check time is appropriate to send cat
	now := time.Now().In(loc)
	if now.Hour() != requiredHour || now.Minute() < minRequiredMinute || now.Minute() > maxRequiredMinute {
		c.String(http.StatusBadRequest, fmt.Sprintf("inappropriate time to send a cat: %v", now))
		return
	}

	// Get image url of random cat
	res, err := http.Get("http://aws.random.cat/meow")
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err getting cat info: %v", err))
		return
	}
	var file map[string]string
	err = json.NewDecoder(res.Body).Decode(&file)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err reading cat info: %v", err))
		return
	}
	err = res.Body.Close()
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err closing cat info body: %v", err))
		return
	}
	imgUrl := file["file"]

	// Post image to Discord
	res, err = http.Get(imgUrl)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err getting cat image: %v", err))
		return
	}
	//noinspection GoUnhandledErrorResult
	defer res.Body.Close()

	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	fw, err := w.CreateFormFile("cat", filepath.Base(imgUrl))
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err creating form file: %v", err))
		return
	}
	_, err = io.Copy(fw, res.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err copy image to form: %v", err))
		return
	}
	//noinspection GoUnhandledErrorResult
	w.Close()

	req, err := http.NewRequest("POST", discordCatWebhookUrl, &b)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err creating Discord POST request: %v", err))
		return
	}
	req.Header.Set("Content-Type", w.FormDataContentType())

	client := &http.Client{
		Timeout: time.Second * 5,
	}
	discordRes, err := client.Do(req)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err sending Discord POST request: %v", err))
		return
	}
	//noinspection GoUnhandledErrorResult
	defer discordRes.Body.Close()
	body, err := ioutil.ReadAll(discordRes.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("err closing Discord POST request: %v", err))
		return
	}

	c.String(http.StatusOK, string(body))
}
