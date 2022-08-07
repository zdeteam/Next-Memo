package api

type Signin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Signup struct {
	Email    string `json:"email"`
	Role     Role   `json:"role"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Invite struct {
	Email string `json:"email"`
	Host  string `json:"host"`
}

type ResetPassword struct {
	Email string `json:"email"`
	Host  string `json:"host"`
}

type ChangePassword struct {
	Email string `json:"email"`
}
