const amqp = require('amqplib/callback_api');

const URI = 'amqp://client:1234@localhost:5672/demo01';
const EXCHANGE = 'notifications';

amqp.connect(URI, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertExchange(EXCHANGE, 'fanout', { durable: true }, (error2) => {
      if (error2) throw error2;

      console.log('Publisher started. Sending every 3 seconds. Press Ctrl+C to stop.');

      setInterval(() => {
        const message = {
          sensor_id: 's01',
          temperature: Number((Math.random() * 50).toFixed(1)),
          timestamp: new Date().toISOString()
        };

        channel.publish(EXCHANGE, '', Buffer.from(JSON.stringify(message)));
        console.log('Sent:', message);
      }, 3000);
    });
  });
});
