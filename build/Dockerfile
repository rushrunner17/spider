FROM node:8

ENV appdir /usr/src/app
RUN mkdir -p $appdir
WORKDIR $appdir

RUN npm config set registry https://registry.npm.taobao.org && npm install pm2 -g && \
    wget -O /etc/apt/sources.list http://mirrors.163.com/.help/sources.list.jessie && \
    apt-get update && apt-get install -y graphicsmagick && apt-get clean
