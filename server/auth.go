package server

import (
	"encoding/json"
	"fmt"
	"github.com/patrickmn/go-cache"
	"gopkg.in/gomail.v2"
	"math/rand"
	"mime"
	"net/http"
	"strings"
	"time"

	"github.com/usememos/memos/api"
	"github.com/usememos/memos/common"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) registerAuthRoutes(g *echo.Group) {
	g.POST("/auth/signin", func(c echo.Context) error {
		signin := &api.Signin{}
		if err := json.NewDecoder(c.Request().Body).Decode(signin); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}

		userFind := &api.UserFind{
			Email: &signin.Email,
		}
		user, err := s.Store.FindUser(userFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user by email %s", signin.Email)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("User not found with email %s", signin.Email))
		} else if user.RowStatus == api.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("User has been archived with email %s", signin.Email))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			// If the two passwords don't match, return a 401 status.
			return echo.NewHTTPError(http.StatusUnauthorized, "Incorrect password").SetInternal(err)
		}

		if err = setUserSession(c, user); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set signin session").SetInternal(err)
		}

		c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSONCharsetUTF8)
		if err := json.NewEncoder(c.Response().Writer).Encode(composeResponse(user)); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to encode user response").SetInternal(err)
		}
		return nil
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		err := removeUserSession(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set logout session").SetInternal(err)
		}

		c.Response().WriteHeader(http.StatusOK)
		return nil
	})

	g.POST("/auth/signup", func(c echo.Context) error {

		signup := &api.Signup{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signup request").SetInternal(err)
		}

		// Don't allow to signup by this api if site host existed.
		hostUserType := api.Host
		hostUserFind := api.UserFind{
			Role: &hostUserType,
		}
		hostUser, err := s.Store.FindUser(&hostUserFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find host user").SetInternal(err)
		}
		if hostUser != nil && signup.Role == api.Host {
			return echo.NewHTTPError(http.StatusBadRequest, "Site Host existed, please contact the site host to signin account firstly.").SetInternal(err)
		}

		// Validate signup form.
		// We can do stricter checks later.
		if len(signup.Email) < 6 {
			return echo.NewHTTPError(http.StatusBadRequest, "Email is too short, minimum length is 6.")
		}
		if len(signup.Password) < 6 {
			return echo.NewHTTPError(http.StatusBadRequest, "Password is too short, minimum length is 6.")
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
		}

		userCreate := &api.UserCreate{
			Email:        signup.Email,
			Role:         api.Role(signup.Role),
			Name:         signup.Name,
			PasswordHash: string(passwordHash),
			OpenID:       common.GenUUID(),
		}
		user, err := s.Store.CreateUser(userCreate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user").SetInternal(err)
		}

		err = setUserSession(c, user)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set signup session").SetInternal(err)
		}

		c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSONCharsetUTF8)
		if err := json.NewEncoder(c.Response().Writer).Encode(composeResponse(user)); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to encode created user response").SetInternal(err)
		}
		return nil
	})

	g.POST("/auth/invite", func(c echo.Context) error {
		invite := &api.Invite{}
		if err := json.NewDecoder(c.Request().Body).Decode(invite); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}
		userFind := &api.UserFind{
			Email: &invite.Email,
		}
		user, _ := s.Store.FindUser(userFind)
		if user != nil {
			return c.JSON(http.StatusOK, false)
		}
		m := gomail.NewMessage()
		from := fmt.Sprintf("%v<%v>", mime.QEncoding.Encode("utf-8", "Memoz"), s.Profile.EmailUserName)
		m.SetHeader("From", from)
		m.SetHeader("To", invite.Email)
		m.SetHeader("Subject", "Welcome to Memoz")
		m.SetBody("text/html", "<div class=\"msg-R7gEt7Au5t8TnQO\"><style>@media only screen and (max-width: 620px) {.msg-R7gEt7Au5t8TnQO table[class=body] h1{font-size:28px !important;margin-bottom:10px !important}.msg-R7gEt7Au5t8TnQO table[class=body] p,.msg-R7gEt7Au5t8TnQO table[class=body] ul,.msg-R7gEt7Au5t8TnQO table[class=body] ol,.msg-R7gEt7Au5t8TnQO table[class=body] td,.msg-R7gEt7Au5t8TnQO table[class=body] span,.msg-R7gEt7Au5t8TnQO table[class=body] a{font-size:16px !important}.msg-R7gEt7Au5t8TnQO table[class=body] .title{font-size:22px !important}.msg-R7gEt7Au5t8TnQO table[class=body] .wrapper,.msg-R7gEt7Au5t8TnQO table[class=body] .article{padding:10px !important}.msg-R7gEt7Au5t8TnQO table[class=body] .content{padding:0 !important}.msg-R7gEt7Au5t8TnQO table[class=body] .container{padding:0 !important;width:100% !important}.msg-R7gEt7Au5t8TnQO table[class=body] .main{border-left-width:0 !important;border-radius:0 !important;border-right-width:0 !important}.msg-R7gEt7Au5t8TnQO table[class=body] .btn table{width:100% !important}.msg-R7gEt7Au5t8TnQO table[class=body] .btn a{width:100% !important}.msg-R7gEt7Au5t8TnQO table[class=body] .img-responsive{height:auto !important;max-width:100% !important;width:auto !important}.msg-R7gEt7Au5t8TnQO table[class=body] p[class=small],.msg-R7gEt7Au5t8TnQO table[class=body] a[class=small]{font-size:12x !important}}@media all {.msg-R7gEt7Au5t8TnQO .ExternalClass{width:100%}.msg-R7gEt7Au5t8TnQO .ExternalClass,.msg-R7gEt7Au5t8TnQO .ExternalClass p,.msg-R7gEt7Au5t8TnQO .ExternalClass span,.msg-R7gEt7Au5t8TnQO .ExternalClass font,.msg-R7gEt7Au5t8TnQO .ExternalClass td,.msg-R7gEt7Au5t8TnQO .ExternalClass div{line-height:100%}.msg-R7gEt7Au5t8TnQO .recipient-link a{color:inherit !important;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;text-decoration:none !important}.msg-R7gEt7Au5t8TnQO #MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}}.msg-R7gEt7Au5t8TnQO hr{border-width:0;height:0;margin-top:34px;margin-bottom:34px;border-bottom-width:1px;border-bottom-color:#EEF5F8}.msg-R7gEt7Au5t8TnQO a{color:#3A464C}</style><div style=\"background-color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;line-height:1.5em;margin:0;padding:0\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"body\" style=\"border-collapse:separate;width:100%;margin:0 auto;\"><tbody><tr><td class=\"container\" style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;display:block;Margin:0 auto;max-width:540px;padding:10px;width:540px\"><div class=\"content\" style=\"box-sizing:border-box;display:block;Margin:0 auto;max-width:600px;padding:30px 20px\"><table class=\"main\" style=\"border-collapse:separate;width:100%;background:#ffffff;border-radius:8px\"><tbody><tr><td class=\"wrapper\" style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;box-sizing:border-box\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:separate;width:100%\"><tbody><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;vertical-align:top\"><p class=\"title\" style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:21px;color:#3A464C;font-weight:normal;line-height:25px;margin-top:0px;font-weight:600;color:#15212A\">Welcome to Memoz,</p></td></tr><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;padding-top:24px;padding-bottom:10px\"><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\">Thank you for registering</p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\"></p><div style=\"border:0;margin:0;padding:0;background-color:#666ee8;border-radius:5px;text-align:center\" valign=\"middle\" height=\"38\" class=\"st-Button-area\" align=\"center\"><a rel=\"nofollow noopener noreferrer\" href=\""+invite.Host+"\"\" style=\"border:0;margin:0;padding:0;color:#ffffff;display:block;height:38px;text-align:center;text-decoration:none\" class=\"st-Button-link\"><span style=\"border:0;margin:0;padding:0;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:16px;font-weight:bold;height:38px;line-height:38px;text-decoration:none;vertical-align:middle;white-space:nowrap;width:100%\" class=\"st-Button-internal\">Click to create account</span></a></div><p></p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\">If you have any questions or need help, please feel free to email us</p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-top:60px;\">ZDE TEAM</p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></div>")
		d := gomail.NewDialer(s.Profile.EmailHost, s.Profile.EmailPort, s.Profile.EmailUserName, s.Profile.EmailPassword)
		if err := d.DialAndSend(m); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "send email fail").SetInternal(err)
		}
		return c.JSON(http.StatusOK, true)
	})

	g.POST("/auth/resetPassword", func(c echo.Context) error {
		params := &api.ResetPassword{}
		if err := json.NewDecoder(c.Request().Body).Decode(params); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}
		userFind := &api.UserFind{
			Email: &params.Email,
		}
		user, _ := s.Store.FindUser(userFind)
		if user == nil {
			return c.JSON(http.StatusOK, false)
		}
		m := gomail.NewMessage()
		from := fmt.Sprintf("%v<%v>", mime.QEncoding.Encode("utf-8", "Memoz"), s.Profile.EmailUserName)
		m.SetHeader("From", from)
		m.SetHeader("To", params.Email)
		m.SetHeader("Subject", "[Memoz] Please reset your password")
		m.SetBody("text/html", "<div class=\"msg-kcHqlswKV6siVeX\"><style>@media only screen and (max-width: 620px) {.msg-kcHqlswKV6siVeX table[class=body] h1{font-size:28px !important;margin-bottom:10px !important}.msg-kcHqlswKV6siVeX table[class=body] p,.msg-kcHqlswKV6siVeX table[class=body] ul,.msg-kcHqlswKV6siVeX table[class=body] ol,.msg-kcHqlswKV6siVeX table[class=body] td,.msg-kcHqlswKV6siVeX table[class=body] span,.msg-kcHqlswKV6siVeX table[class=body] a{font-size:16px !important}.msg-kcHqlswKV6siVeX table[class=body] .title{font-size:22px !important}.msg-kcHqlswKV6siVeX table[class=body] .wrapper,.msg-kcHqlswKV6siVeX table[class=body] .article{padding:10px !important}.msg-kcHqlswKV6siVeX table[class=body] .content{padding:0 !important}.msg-kcHqlswKV6siVeX table[class=body] .container{padding:0 !important;width:100% !important}.msg-kcHqlswKV6siVeX table[class=body] .main{border-left-width:0 !important;border-radius:0 !important;border-right-width:0 !important}.msg-kcHqlswKV6siVeX table[class=body] .btn table{width:100% !important}.msg-kcHqlswKV6siVeX table[class=body] .btn a{width:100% !important}.msg-kcHqlswKV6siVeX table[class=body] .img-responsive{height:auto !important;max-width:100% !important;width:auto !important}.msg-kcHqlswKV6siVeX table[class=body] p[class=small],.msg-kcHqlswKV6siVeX table[class=body] a[class=small]{font-size:12x !important}}@media all {.msg-kcHqlswKV6siVeX .ExternalClass{width:100%}.msg-kcHqlswKV6siVeX .ExternalClass,.msg-kcHqlswKV6siVeX .ExternalClass p,.msg-kcHqlswKV6siVeX .ExternalClass span,.msg-kcHqlswKV6siVeX .ExternalClass font,.msg-kcHqlswKV6siVeX .ExternalClass td,.msg-kcHqlswKV6siVeX .ExternalClass div{line-height:100%}.msg-kcHqlswKV6siVeX .recipient-link a{color:inherit !important;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;text-decoration:none !important}.msg-kcHqlswKV6siVeX #MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}}.msg-kcHqlswKV6siVeX hr{border-width:0;height:0;margin-top:34px;margin-bottom:34px;border-bottom-width:1px;border-bottom-color:#EEF5F8}.msg-kcHqlswKV6siVeX a{color:#3A464C}</style><div style=\"background-color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;line-height:1.5em;margin:0;padding:0\"><table style=\"border-collapse:separate;width:100%;margin:0 auto\" class=\"body\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;display:block;Margin:0 auto;max-width:540px;padding:10px;width:540px\" class=\"container\"><div style=\"box-sizing:border-box;display:block;Margin:0 auto;max-width:600px;padding:30px 20px\" class=\"content\"><table style=\"border-collapse:separate;width:100%;background:#ffffff;border-radius:8px\" class=\"main\"><tbody><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;box-sizing:border-box\" class=\"wrapper\"><table style=\"border-collapse:separate;width:100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;vertical-align:top\"><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:21px;color:#3A464C;font-weight:normal;line-height:25px;margin-top:0px;font-weight:600;color:#15212A\" class=\"title\">Memoz password reset ,</p></td></tr><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;padding-top:24px;padding-bottom:10px\"><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:8px\">We heard that you lost your Memoz password. Sorry about that!</p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\">But don’t worry! You can use the following button to reset your password:</p><div align=\"center\" class=\"st-Button-area\" style=\"border:0;margin:0;padding:0;background-color:#666ee8;border-radius:5px;text-align:center\"><a rel=\"nofollow noopener noreferrer\" class=\"st-Button-link\" style=\"border:0;margin:0;padding:0;color:#ffffff;display:block;height:38px;text-align:center;text-decoration:none\" href=\""+params.Host+"\"><span class=\"st-Button-internal\" style=\"border:0;margin:0;padding:0;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:16px;font-weight:bold;height:38px;line-height:38px;text-decoration:none;vertical-align:middle;white-space:nowrap;width:100%\">Reset your password</span></a></div><p></p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\">If you have any questions or need help, please feel free to email us</p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-top:60px;\">ZDE TEAM</p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></div> ")
		d := gomail.NewDialer(s.Profile.EmailHost, s.Profile.EmailPort, s.Profile.EmailUserName, s.Profile.EmailPassword)
		if err := d.DialAndSend(m); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "send email fail").SetInternal(err)
		}
		s.Cache.Set(params.Email, "resetPassword", cache.DefaultExpiration)
		return c.JSON(http.StatusOK, true)
	})

	g.POST("/auth/changePassword", func(c echo.Context) error {
		params := &api.ChangePassword{}
		if err := json.NewDecoder(c.Request().Body).Decode(params); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}
		userFind := &api.UserFind{
			Email: &params.Email,
		}
		user, _ := s.Store.FindUser(userFind)
		if user == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user")
		}
		action, found := s.Cache.Get(params.Email)
		if found && action == "resetPassword" {
			user, _ := s.Store.FindUser(userFind)

			numeric := [10]byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
			r := len(numeric)
			rand.Seed(time.Now().UnixNano())

			var sb strings.Builder
			for i := 0; i < 6; i++ {
				fmt.Fprintf(&sb, "%d", numeric[rand.Intn(r)])
			}
			password := sb.String()
			userPatch := &api.UserPatch{
				ID:       user.ID,
				Password: &password,
			}
			passwordHash, err := bcrypt.GenerateFromPassword([]byte(*userPatch.Password), bcrypt.DefaultCost)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
			}
			passwordHashStr := string(passwordHash)
			userPatch.PasswordHash = &passwordHashStr

			res, err := s.Store.PatchUser(userPatch)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch user").SetInternal(err)
			}
			m := gomail.NewMessage()
			from := fmt.Sprintf("%v<%v>", mime.QEncoding.Encode("utf-8", "Memoz"), s.Profile.EmailUserName)
			m.SetHeader("From", from)
			m.SetHeader("To", params.Email)
			m.SetHeader("Subject", "[Memoz] Your new password")
			m.SetBody("text/html", "<div class=\"msg-9r0RljjlbDdAMNP\"><style>@media only screen and(max-width:620px){.msg-9r0RljjlbDdAMNP table[class=body]h1{font-size:28px!important;margin-bottom:10px!important}.msg-9r0RljjlbDdAMNP table[class=body]p,.msg-9r0RljjlbDdAMNP table[class=body]ul,.msg-9r0RljjlbDdAMNP table[class=body]ol,.msg-9r0RljjlbDdAMNP table[class=body]td,.msg-9r0RljjlbDdAMNP table[class=body]span,.msg-9r0RljjlbDdAMNP table[class=body]a{font-size:16px!important}.msg-9r0RljjlbDdAMNP table[class=body].title{font-size:22px!important}.msg-9r0RljjlbDdAMNP table[class=body].wrapper,.msg-9r0RljjlbDdAMNP table[class=body].article{padding:10px!important}.msg-9r0RljjlbDdAMNP table[class=body].content{padding:0!important}.msg-9r0RljjlbDdAMNP table[class=body].container{padding:0!important;width:100%!important}.msg-9r0RljjlbDdAMNP table[class=body].main{border-left-width:0!important;border-radius:0!important;border-right-width:0!important}.msg-9r0RljjlbDdAMNP table[class=body].btn table{width:100%!important}.msg-9r0RljjlbDdAMNP table[class=body].btn a{width:100%!important}.msg-9r0RljjlbDdAMNP table[class=body].img-responsive{height:auto!important;max-width:100%!important;width:auto!important}.msg-9r0RljjlbDdAMNP table[class=body]p[class=small],.msg-9r0RljjlbDdAMNP table[class=body]a[class=small]{font-size:12x!important}}@media all{.msg-9r0RljjlbDdAMNP.ExternalClass{width:100%}.msg-9r0RljjlbDdAMNP.ExternalClass,.msg-9r0RljjlbDdAMNP.ExternalClass p,.msg-9r0RljjlbDdAMNP.ExternalClass span,.msg-9r0RljjlbDdAMNP.ExternalClass font,.msg-9r0RljjlbDdAMNP.ExternalClass td,.msg-9r0RljjlbDdAMNP.ExternalClass div{line-height:100%}.msg-9r0RljjlbDdAMNP.recipient-link a{color:inherit!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}.msg-9r0RljjlbDdAMNP#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}}.msg-9r0RljjlbDdAMNP hr{border-width:0;height:0;margin-top:34px;margin-bottom:34px;border-bottom-width:1px;border-bottom-color:#EEF5F8}.msg-9r0RljjlbDdAMNP a{color:#3A464C}</style><div style=\"background-color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;line-height:1.5em;margin:0;padding:0\"><table border=\"0\"cellpadding=\"0\"cellspacing=\"0\"class=\"body\"style=\"border-collapse:separate;width:100%;margin:0 auto\"><tbody><tr><td class=\"container\"style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;display:block;Margin:0 auto;max-width:540px;padding:10px;width:540px\"><div class=\"content\"style=\"box-sizing:border-box;display:block;Margin:0 auto;max-width:600px;padding:30px 20px\"><table class=\"main\"style=\"border-collapse:separate;width:100%;background:#ffffff;border-radius:8px\"><tbody><tr><td class=\"wrapper\"style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;box-sizing:border-box\"><table border=\"0\"cellpadding=\"0\"cellspacing=\"0\"style=\"border-collapse:separate;width:100%\"><tbody><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;vertical-align:top\"><p class=\"title\"style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:21px;color:#3A464C;font-weight:normal;line-height:25px;margin-top:0px;font-weight:600;color:#15212A\">Your new password</p></td></tr><tr><td style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;vertical-align:top;padding-top:24px;padding-bottom:10px\"><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-bottom:20px\">The following is your new password,please change it in time after login.</p><div style=\"border:0;margin:0;padding:0;color:#666ee8;border-radius:5px;text-align:center\"class=\"st-Button-area\"align=\"center\"><span style=\"border:0;margin:0;padding:0;color:#666ee8;display:block;height:38px;text-align:center;text-decoration:none\"class=\"st-Button-link\"><span style=\"border:0;margin:0;padding:0;color:#666ee8;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:22px;font-weight:bold;height:38px;line-height:38px;text-decoration:none;vertical-align:middle;white-space:nowrap;width:100%\"class=\"st-Button-internal\">"+password+"</span></span></div><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-top:28px;margin-bottom:20px\">If you have any questions or need help,please feel free to email us</p><p style=\"font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:14px;color:#3A464C;font-weight:normal;margin:0;line-height:25px;margin-top:60px\">ZDE TEAM</p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></div>")
			d := gomail.NewDialer(s.Profile.EmailHost, s.Profile.EmailPort, s.Profile.EmailUserName, s.Profile.EmailPassword)
			if err := d.DialAndSend(m); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "send email fail").SetInternal(err)
			}
			c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSONCharsetUTF8)
			if err := json.NewEncoder(c.Response().Writer).Encode(composeResponse(res)); err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to encode user response").SetInternal(err)
			}
			s.Cache.Delete(params.Email)
			return nil
		} else {
			return echo.NewHTTPError(http.StatusInternalServerError, "Link expired")
		}
	})
}
