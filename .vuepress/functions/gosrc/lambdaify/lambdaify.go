package lambdaify

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/go-http-utils/headers"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
)

func splitMultiValues(m map[string][]string) (map[string]string, map[string][]string) {
	values := make(map[string]string)
	multiValues := make(map[string][]string)

	for k, v := range m {
		if len(v) == 1 {
			values[k] = v[0]
		} else {
			multiValues[k] = v
		}
	}

	return values, multiValues
}

func joinMultiValues(s map[string]string, m map[string][]string) map[string][]string {
	values := make(map[string][]string)

	for k, v := range s {
		values[k] = []string{v}
	}
	for k, v := range m {
		values[k] = v
	}

	return values
}

func joinMultiHeaders(s map[string]string, m map[string][]string) map[string][]string {
	values := make(map[string][]string)

	for k, v := range s {
		values[headers.Normalize(k)] = []string{v}
	}
	for k, v := range m {
		values[headers.Normalize(k)] = v
	}

	return values
}

func Lambdaify(handler http.Handler) func(events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return func(r events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		query := url.Values(joinMultiValues(r.QueryStringParameters, r.MultiValueQueryStringParameters))
		path := r.Path + "?" + query.Encode()

		req := httptest.NewRequest(r.HTTPMethod, path, strings.NewReader(r.Body))
		req.Header = joinMultiHeaders(r.Headers, r.MultiValueHeaders)
		req.URL.Query()
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		res := rec.Result()
		singleValueHeaders, multiValueHeaders := splitMultiValues(res.Header)
		body, err := ioutil.ReadAll(res.Body)

		return events.APIGatewayProxyResponse{
			StatusCode:        res.StatusCode,
			Headers:           singleValueHeaders,
			MultiValueHeaders: multiValueHeaders,
			Body:              string(body),
		}, err
	}
}
