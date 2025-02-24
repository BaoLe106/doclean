package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/BaoLe106/doclean/doclean-backend/services/latex"
	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string) *APIServer {
	return &APIServer{
		addr: addr,
		// db:   db,
	}
}

func (server *APIServer) Run() error {
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3006"},
		// AllowCredentials: true,
	})
	router := mux.NewRouter()
	subrouter := router.PathPrefix("/api/v1").Subrouter()

	// userStore := users.NewStore(server.db)
	// userHandler := users.NewHandler(userStore)
	// userHandler.RegisterRoutes(subrouter)
	
	latexHandler := latex.NewHandler()
	latexHandler.RegisterRoutes(subrouter)
	
	logger.LogHandler(logger.LogInput{
		Message: fmt.Sprintf("Listening on %s!", server.addr),
	})
	return http.ListenAndServe(server.addr, c.Handler(router))
}

