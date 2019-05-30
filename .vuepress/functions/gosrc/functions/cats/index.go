package cats

import (
	"bytes"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

var discordCatWebhookUrl = os.Getenv("DISCORD_CAT_WEBHOOK_URL")

func Register(f *gin.RouterGroup) {
	g := f.Group("/cats")
	{
		g.GET("", sendCat)
	}
}

func sendCat(c *gin.Context) {
	// Get image url of random cat
	res, err := http.Get("http://aws.random.cat/meow")
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	var file map[string]string
	err = json.NewDecoder(res.Body).Decode(&file)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	err = res.Body.Close()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	imgUrl := file["file"]

	// Post image to Discord
	res, err = http.Get(imgUrl)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	//noinspection GoUnhandledErrorResult
	defer res.Body.Close()

	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	fw, err := w.CreateFormFile("cat", filepath.Base(imgUrl))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	_, err = io.Copy(fw, res.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	//noinspection GoUnhandledErrorResult
	w.Close()

	req, err := http.NewRequest("POST", discordCatWebhookUrl, &b)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	req.Header.Set("Content-Type", w.FormDataContentType())

	client := &http.Client{
		Timeout: time.Second * 5,
	}
	discordRes, err := client.Do(req)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	//noinspection GoUnhandledErrorResult
	defer discordRes.Body.Close()
	body, err := ioutil.ReadAll(discordRes.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, string(body))
}
