const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');

const URI = 'amqp://client:1234@localhost:5672/demo01';
const EXCHANGE = 'notifications';
const LOG_FILE = path.join(__dirname, 'temperature_log.txt');

amqp.connect(URI, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertExchange(EXCHANGE, 'fanout', { durable: true });

    channel.assertQueue('', { exclusive: true }, (error2, q) => {
      if (error2) throw error2;

      channel.bindQueue(q.queue, EXCHANGE, '');
      console.log(`LogService waiting on ${q.queue}. Saving to ${LOG_FILE}. Press Ctrl+C to stop.`);

      channel.consume(q.queue, (msg) => {
        if (!msg) return;

        const message = JSON.parse(msg.content.toString());
        fs.appendFileSync(LOG_FILE, JSON.stringify(message) + '\n');
        console.log(`Saved temperature: ${message.temperature} C`);
      }, { noAck: true });
    });
  });
});
