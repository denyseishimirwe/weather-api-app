FROM node:18-alpine

# App
WORKDIR /app
COPY . .
RUN npm install -g serve

# Install SSH
RUN apk add openssh && \
    adduser -D ubuntu && \
    echo "ubuntu:pass123" | chpasswd && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && \
    mkdir /var/run/sshd

EXPOSE 22
EXPOSE 3000

CMD /usr/sbin/sshd && serve -s . -l 3000