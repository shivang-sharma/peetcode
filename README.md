## Peetcode

It's an online algorithmic problem solving platform. Built as a joke during the full stack assignments by Harkirat Singh.
No intention of building this into a business.

If you would like to win an Airpods though, feel free to go through the third part and build the bounty described in the video

Demo: <https://peetcode.com>

To build java_sandbox image
docker build -t java_sandbox .

To Start the mysql container on local machine
docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=peetcode_password -e MYSQL_DATABASE=peetcode -p 3306:3306 -d mysql:latest

To start the rabbitmq container on local machine
docker run -d --hostname rabbit --name rabbit-server -p 8008:15672 -p 5672:5672 rabbitmq:3-management
