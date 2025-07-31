FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", ".", "-l", "3000"]
FROM ubuntu:22.04

# Install SSH and Nginx
RUN apt update && \
    apt install -y openssh-server nginx sudo && \
    mkdir /var/run/sshd && \
    useradd -m ubuntu && echo "ubuntu:pass123" | chpasswd && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config