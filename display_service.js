const amqp = require('amqplib/callback_api');

const URI = 'amqp://client:1234@localhost:5672/demo01';
const EXCHANGE = 'notifications';

amqp.connect(URI, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertExchange(EXCHANGE, 'fanout', { durable: true });

    // A separate queue lets this service receive its own copy of every message.
    channel.assertQueue('', { exclusive: true }, (error2, q) => {
      if (error2) throw error2;

      channel.bindQueue(q.queue, EXCHANGE, '');
      console.log(`DisplayService waiting on ${q.queue}. Press Ctrl+C to stop.`);

      channel.consume(q.queue, (msg) => {
        if (!msg) return;

        const message = JSON.parse(msg.content.toString());
        console.log(`${message.timestamp} | ${message.sensor_id} | Temperature: ${message.temperature} C`);
      }, { noAck: true });
    });
  });
});
