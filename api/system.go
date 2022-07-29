package api

type SystemStatus struct {
	Host    bool   `json:"host"`
	Version string `json:"version"`
}
