# How to View Docker Logs in VS Code Terminal

## Method 1: Using VS Code Integrated Terminal

### Open Terminal in VS Code

1. Press `` Ctrl + ` `` (backtick) or
2. Go to **Terminal → New Terminal** from the menu

### View Logs for Specific Container

#### View Recent Logs

```bash
docker logs <container_name>
```

#### View Last N Lines

```bash
docker logs <container_name> --tail 50
```

#### Follow Logs in Real-Time (like tail -f)

```bash
docker logs -f <container_name>
```

#### View Logs with Timestamps

```bash
docker logs -t <container_name>
```

#### View Logs Since a Specific Time

```bash
docker logs <container_name> --since 5m  # Last 5 minutes
docker logs <container_name> --since 1h  # Last hour
```

---

## Your Container Names

Based on your current setup:

```bash
# API Gateway
docker logs ecommerce-api-gateway-1
docker logs -f ecommerce-api-gateway-1

# Auth Service
docker logs ecommerce-auth-service-1
docker logs -f ecommerce-auth-service-1

# Product Service
docker logs ecommerce-product-service-1
docker logs -f ecommerce-product-service-1

# Notifications Service
docker logs ecommerce-notifications-service-1
docker logs -f ecommerce-notifications-service-1

# RabbitMQ
docker logs ecommerce-rabbitmq-1
docker logs -f ecommerce-rabbitmq-1

# Databases
docker logs ecommerce-auth-db-1
docker logs ecommerce-product-db-1
```

---

## Method 2: View All Container Logs

### View Logs for All Services

```bash
docker-compose logs
```

### Follow All Logs

```bash
docker-compose logs -f
```

### View Logs for Specific Service

```bash
docker-compose logs -f product-service
docker-compose logs -f api-gateway
```

### View Last N Lines for All Services

```bash
docker-compose logs --tail=50
```

---

## Method 3: Use Docker Extension in VS Code

### Install Docker Extension

1. Open Extensions panel (Cmd+Shift+X on Mac)
2. Search for "Docker" by Microsoft
3. Click Install

### View Logs Using Docker Extension

1. Click Docker icon in the sidebar
2. Expand "Containers" section
3. Right-click on a container
4. Select "View Logs"

---

## Common Log Commands

### View Multiple Container Logs Simultaneously

```bash
# Open multiple terminal tabs and run:
docker logs -f ecommerce-api-gateway-1      # Terminal 1
docker logs -f ecommerce-product-service-1  # Terminal 2
docker logs -f ecommerce-rabbitmq-1         # Terminal 3
```

### Save Logs to File

```bash
docker logs ecommerce-api-gateway-1 > api-gateway-logs.txt
```

### Search Logs for Specific Text

```bash
docker logs ecommerce-api-gateway-1 | grep "ERROR"
docker logs ecommerce-api-gateway-1 | grep -i "product"
```

### View Container Status

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## Troubleshooting Errors

### Error: "No such container"

This means you're using the wrong container name. Check the actual name:

```bash
docker ps
```

Example: Use `ecommerce-product-service-1` not `product-service`

### Error: Container not running

```bash
# Check if container is running
docker ps

# Check all containers (including stopped)
docker ps -a

# Start a stopped container
docker start ecommerce-product-service-1
```

---

## Real-Time Monitoring

### Watch Logs Continuously

```bash
# In VS Code terminal, run:
docker logs -f ecommerce-api-gateway-1

# Press Ctrl+C to stop following
```

### Monitor Multiple Services

```bash
# Option 1: Split terminals in VS Code
# Click the split terminal icon (⌘\) and run different logs in each

# Option 2: Use docker-compose
docker-compose logs -f api-gateway product-service
```

---

## Tips for VS Code Terminal

1. **Split Terminal:** Click the split icon or press `Cmd+\` to view multiple logs side-by-side
2. **Clear Terminal:** Type `clear` or press `Cmd+K`
3. **Search in Terminal:** Press `Cmd+F` to search through terminal output
4. **Copy from Terminal:** Select text and press `Cmd+C`
5. **New Terminal:** Press `Ctrl+Shift+` ` or click the "+" icon

---

## Keyboard Shortcuts (macOS)

- **Toggle Terminal:** `` Ctrl + ` ``
- **New Terminal:** `` Ctrl + Shift + ` ``
- **Split Terminal:** `Cmd + \`
- **Kill Terminal:** Click trash icon
- **Cycle Between Terminals:** Use dropdown or `Cmd + ↑/↓`

---

## Example Workflow

```bash
# 1. Open VS Code terminal
# Press Ctrl + `

# 2. Check running containers
docker ps

# 3. View product service logs
docker logs ecommerce-product-service-1 --tail 50

# 4. If you need to follow logs (real-time)
docker logs -f ecommerce-product-service-1

# 5. In another terminal tab, monitor API gateway
# Press Ctrl+Shift+` to open new terminal
docker logs -f ecommerce-api-gateway-1

# 6. To stop following logs, press Ctrl+C
```

---

## Viewing Specific Error Types

### RabbitMQ Connection Errors

```bash
docker logs ecommerce-api-gateway-1 | grep -i "rabbitmq\|amqp"
```

### Database Connection Errors

```bash
docker logs ecommerce-product-service-1 | grep -i "mongodb\|database"
```

### HTTP Errors

```bash
docker logs ecommerce-api-gateway-1 | grep -i "error\|exception"
```

### Startup Issues

```bash
docker logs ecommerce-product-service-1 --tail 100
```

---

## Quick Reference

| Command                         | Description              |
| ------------------------------- | ------------------------ |
| `docker logs <name>`            | View all logs            |
| `docker logs -f <name>`         | Follow logs in real-time |
| `docker logs --tail N <name>`   | View last N lines        |
| `docker logs -t <name>`         | Show timestamps          |
| `docker logs --since 5m <name>` | Logs from last 5 minutes |
| `docker-compose logs -f`        | Follow all service logs  |
| `docker ps`                     | List running containers  |
| `Ctrl+C`                        | Stop following logs      |

---

## Your Current Services

Run these commands in VS Code terminal to monitor your services:

```bash
# Check all services are running
docker-compose ps

# View API Gateway logs (main entry point)
docker logs -f ecommerce-api-gateway-1

# View Product Service logs (your new service)
docker logs -f ecommerce-product-service-1

# View RabbitMQ logs (message broker)
docker logs -f ecommerce-rabbitmq-1
```
