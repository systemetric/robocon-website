package functions

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"io/ioutil"
	"net/http"
)

type Handlers map[string]func(events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)

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

func Simulate(handler func(events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		headers, multiValueHeaders := splitMultiValues(map[string][]string(r.Header))
		queryString, multiValueQueryString := splitMultiValues(map[string][]string(r.URL.Query()))

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = fmt.Fprintf(w, "error: %v", err)
			return
		}

		res, err := handler(events.APIGatewayProxyRequest{
			Path:                            r.URL.Path,
			HTTPMethod:                      r.Method,
			Headers:                         headers,
			MultiValueHeaders:               multiValueHeaders,
			QueryStringParameters:           queryString,
			MultiValueQueryStringParameters: multiValueQueryString,
			PathParameters:                  map[string]string{},
			StageVariables:                  map[string]string{},
			RequestContext: events.APIGatewayProxyRequestContext{
				AccountID:  "",
				ResourceID: "",
				Stage:      "",
				RequestID:  "",
				Identity: events.APIGatewayRequestIdentity{
					CognitoIdentityPoolID:         "",
					AccountID:                     "",
					CognitoIdentityID:             "",
					Caller:                        "",
					APIKey:                        "",
					AccessKey:                     "",
					SourceIP:                      "",
					CognitoAuthenticationType:     "",
					CognitoAuthenticationProvider: "",
					UserArn:                       "",
					UserAgent:                     "",
					User:                          "",
				},
				ResourcePath: "",
				Authorizer:   make(map[string]interface{}),
				HTTPMethod:   r.Method,
				APIID:        "",
			},
			Body:            string(body),
			IsBase64Encoded: false,
		})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = fmt.Fprintf(w, "error: %v", err)
			return
		}

		for k, v := range res.Headers {
			w.Header()[k] = []string{v}
		}
		for k, v := range res.MultiValueHeaders {
			w.Header()[k] = v
		}
		w.WriteHeader(res.StatusCode)
		_, _ = fmt.Fprintf(w, res.Body)
	}
}
