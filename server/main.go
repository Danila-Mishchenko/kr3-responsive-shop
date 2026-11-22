package main

import (
	"flag"
	"log"
	"net/http"
	"strings"
	"time"
)

func main() {
	address := flag.String("addr", "127.0.0.1:8080", "локальный адрес сервера")
	flag.Parse()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		http.ServeFile(w, r, "data/products.json")
	})

	files := http.FileServer(http.Dir("."))
	for _, folder := range []string{"/css/", "/images/", "/js/"} {
		mux.Handle("GET "+folder, files)
	}
	mux.Handle("GET /{$}", files)
	mux.HandleFunc("GET /{page}", func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.PathValue("page"), ".html") {
			http.NotFound(w, r)
			return
		}
		files.ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:              *address,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("Каталог: http://%s/catalog.html?source=go", *address)
	log.Fatal(server.ListenAndServe())
}
