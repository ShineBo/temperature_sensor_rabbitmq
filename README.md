# Temperature sensor notification

A simple Node.js assignment using the same `amqplib/callback_api` approach as the lab.

- `publisher.js` sends sensor `s01` readings to the `notifications` fanout exchange every 3 seconds using `setInterval`.
- Each message has a random temperature from 0 to 50 (one decimal place) and a current timestamp from `new Date().toISOString()`.
- `display_service.js` (DisplayService) prints the temperature, sensor ID, and timestamp.
- `log_service.js` (LogService) appends each complete reading to `temperature_log.txt`, one JSON message per line.

Each subscriber has its own temporary queue bound to the exchange, so both receive each reading. Start both subscribers before the publisher. A stopped subscriber misses readings sent while it is stopped, as in the lab's publish/subscribe example. See the [RabbitMQ publish/subscribe tutorial](https://www.rabbitmq.com/tutorials/tutorial-three-javascript).

## 1. Prepare and start RabbitMQ

You need Node.js 18 or newer, npm, and Docker Desktop. Open Docker Desktop and wait for it to be running.

Open Terminal and run:

```bash
cd /Users/shine/Desktop/Coding/temperature_sensor
npm install
docker compose up -d
```

Wait until RabbitMQ is ready, then open [the local RabbitMQ console](http://localhost:15672). If it does not load immediately, wait a few seconds and refresh.

Log in with username `admin` and password `1234`, the local demo credentials from the lab.

If your previous lab's RabbitMQ container already uses ports 5672 and 15672, use that running broker and skip `docker compose up -d`, or stop it in Docker Desktop before starting this one. Only one broker can use these ports at a time.

## 2. Set up the client and virtual host in the console

These match the connection URL in all three JavaScript files. If you use your existing lab broker and these already exist, check the permissions and skip creating them again.

1. Go to **Admin > Users** and expand **Add a user**.
2. Enter username `client`, password `1234`, and confirm the password. Leave tags empty and click **Add user**.
3. Go to **Admin > Virtual Hosts** and expand **Add a new virtual host**.
4. Set the name to `demo01` and the default queue type to **Classic**, then click **Add virtual host**.
5. Click the `demo01` virtual host. Under **Permissions / Set permission**, select user `client`.
6. Enter `.*` in all three fields: **Configure**, **Write**, and **Read**. Click **Set permission**.
7. Select `demo01` in the console's virtual host filter when inspecting this assignment.

Stay logged in as `admin` for the console. The Node.js programs connect as `client`. The [RabbitMQ management documentation](https://www.rabbitmq.com/docs/management) describes console access and permissions.

## 3. Create the exchange in the console

1. Go to **Exchanges > Add a new exchange**.
2. Choose virtual host `demo01` and enter name `notifications`.
3. Choose type **fanout**, durability **Durable**, auto-delete **No**, and internal **No**. Leave arguments empty.
4. Click **Add exchange**.

The programs also declare this exchange with `assertExchange`, so running them will create it if it does not exist. The settings must agree with the ones above.

## 4. Run the two subscribers, then the publisher

Open three Terminal tabs or windows. In each one, first run:

```bash
cd /Users/shine/Desktop/Coding/temperature_sensor
```

In terminal 1, start DisplayService:

```bash
npm run display
```

In terminal 2, start LogService:

```bash
npm run log
```

Wait until both print their waiting messages. Then, in terminal 3, start the publisher:

```bash
npm run publisher
```

The first reading arrives after about 3 seconds. The publisher prints each sent message, DisplayService prints its temperature, and LogService prints that it saved the temperature.

## 5. Test it yourself

1. Let the programs run for about 12 seconds. Expect approximately four readings, spaced about 3 seconds apart.
2. Compare the publisher's readings with DisplayService's output. The temperature, sensor ID, and timestamp should match for each message received while both subscribers are running.
3. Open a fourth terminal in the project folder and run:

   ```bash
   cat temperature_log.txt
   ```

   Each line should contain a full message like the assignment's example, with a numeric temperature and a current ISO timestamp ending in `Z` (UTC). Compare these readings with the other terminals. The file is created when the first message arrives and appends new readings on later runs.

4. In the RabbitMQ console, select `demo01`, open **Exchanges**, and click **notifications**. Confirm its type is **fanout**. With both subscribers running, its **Bindings** section should show two different generated queues beginning with `amq.gen-`.
5. Open **Queues and Streams** (or **Queues**). Each of those queues should have one consumer. Message counts can stay at zero because the services consume the messages immediately. Queue names change when you restart the subscribers.
6. To test publishing from the console, stop only the publisher with **Ctrl+C**. Leave both subscribers running. Open **Exchanges > notifications > Publish message**. Leave the routing key empty. Copy a JSON line from `temperature_log.txt` into the payload, change its temperature to `37.5`, and click **Publish message**. Both subscribers should receive it, and a new line should appear in the log. This manual test reuses the copied timestamp; the publisher generates a fresh one for every reading.

## 6. Stop the programs

Press **Ctrl+C** in each of the three program terminals. If you started RabbitMQ using this project's Compose file, stop it from the project folder with:

```bash
docker compose down
```

The temporary subscriber queues disappear when their connections close. The text log and `rabbit_data` folder remain. On later runs, start RabbitMQ and repeat section 4; the user and virtual host setup is normally needed only once.

## 7. Create your GitHub repository

The simplest option is to upload through GitHub's website; GitHub creates the Git repository and commits for you.

1. Sign in to GitHub and open [Create a new repository](https://github.com/new).
2. Name it `temperature_sensor`. Choose **Public** if your course permits it so the instructor can access the link. Leave the README, .gitignore, and license options unselected, then click **Create repository**.
3. On the empty repository page, click **uploading an existing file**. For an existing repository, use **Add file > Upload files**.
4. Upload these eight files directly into the repository root:

   ```text
   .gitignore
   docker-compose.yml
   package.json
   package-lock.json
   publisher.js
   display_service.js
   log_service.js
   README.md
   ```

   In macOS Finder, press **Command+Shift+.** to show `.gitignore`. Select the eight files individually; leave out `node_modules`, `rabbit_data`, and `temperature_log.txt`.

5. Enter commit message `Add temperature sensor assignment` and commit the uploaded files to `main`.
6. Check that all eight files appear, then copy the repository page link: `https://github.com/YOUR_USERNAME/temperature_sensor`. For a public repository, check that it opens in a private browser window.

These steps follow [GitHub's file upload guide](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository). You can now use the repository link for the PDF and Google Drive submission you will prepare yourself.

## Quick troubleshooting

- **Connection refused:** check Docker Desktop is running and RabbitMQ has finished starting.
- **ACCESS_REFUSED or vhost error:** check `client`, password `1234`, virtual host `demo01`, and all three `.*` permissions.
- **Exchange PRECONDITION_FAILED:** check that `notifications` in `demo01` is `fanout` and durable.
- **No output or missing log file:** start both subscribers before the publisher, then wait at least 3 seconds. Readings published before a subscriber starts are not replayed to it.
