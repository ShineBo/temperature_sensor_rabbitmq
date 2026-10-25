# Temperature Sensor Notifications

A simple Node.js application that uses RabbitMQ to send temperature readings to two subscribers.

## How it works

The publisher sends a sensor reading to a **fanout** exchange named `notifications` every **3 seconds** using `setInterval`.

Each reading contains:

- `sensor_id`: `s01`.
- `temperature`: a random number from 0 to 50, rounded to one decimal place.
- `timestamp`: the current UTC timestamp generated with `new Date().toISOString()`.

Example message:

```json
{
  "sensor_id": "s01",
  "temperature": 37.5,
  "timestamp": "2025-11-11T02:59:00.000Z"
}
```

RabbitMQ sends a copy of each message to both subscribers through their separate queues:

- **DisplayService** prints the temperature, sensor ID, and timestamp to the terminal.
- **LogService** appends the complete message to `temperature_log.txt`, with one JSON message per line.

Both subscribers use temporary, exclusive queues. A queue is removed when its subscriber disconnects, so subscribers receive readings only while they are running.

## Project files

| File | Purpose |
| --- | --- |
| `publisher.js` | Generates and publishes sensor readings. |
| `display_service.js` | Receives and displays readings. |
| `log_service.js` | Receives and saves readings to a text file. |
| `docker-compose.yml` | Runs RabbitMQ with its management console. |
| `package.json` | Defines the `amqplib` dependency and npm commands. |

Built with Node.js, RabbitMQ, and `amqplib`.
