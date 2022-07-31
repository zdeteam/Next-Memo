package api

type SystemStatus struct {
	Host     bool   `json:"host"`
	Version  string `json:"version"`
	Mode     string `json:"mode"`
	HostUser string `json:"host_user"`
}
