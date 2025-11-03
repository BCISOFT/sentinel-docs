.PHONY: help install start stop build clean serve dev

# Default locale
LOCALE ?= en

# Default target
help:
	@echo "Sentinel Documentation - Available commands:"
	@echo ""
	@echo "  make install       - Install dependencies"
	@echo "  make start         - Start development server (default locale)"
	@echo "  make start LOCALE=fr - Start with French locale"
	@echo "  make stop          - Stop development server"
	@echo "  make build         - Build for production"
	@echo "  make serve         - Preview production build"
	@echo "  make clean         - Clean cache and node_modules"
	@echo "  make dev           - Install + start (default: English)"
	@echo "  make dev LOCALE=fr - Install + start in French"
	@echo ""
	@echo "Server will be available at:"
	@echo "  - English (default): http://localhost:3000"
	@echo "  - French:            http://localhost:3000/fr"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@npm install

# Start development server
start:
	@echo "🚀 Starting Docusaurus development server (locale: $(LOCALE))..."
	@npm start -- --locale $(LOCALE)

# Stop development server (if running)
stop:
	@echo "🛑 Stopping development server..."
	@pkill -f "docusaurus start" || true
	@echo "✅ Server stopped"

# Build for production
build:
	@echo "🔨 Building documentation for production..."
	@npm run build

# Serve production build
serve:
	@echo "🌐 Serving production build..."
	@npm run serve

# Clean cache and dependencies
clean:
	@echo "🧹 Cleaning cache and dependencies..."
	@npm run clear
	@rm -rf node_modules
	@rm -rf build
	@echo "✅ Clean complete"

# Development workflow: install + start
dev: install
	@echo "✨ Starting development environment (locale: $(LOCALE))..."
	@npm start -- --locale $(LOCALE)
