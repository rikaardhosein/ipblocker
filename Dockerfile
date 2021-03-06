FROM node:6

ENV BLOCKLIST_IPSETS_PATH /usr/src/blocklists
ENV BLOCKLIST_BIND_ADDR 0.0.0.0
ENV BLOCKLIST_BIND_PORT 8080
ENV BLOCKLIST_GIT_REPO https://github.com/rikaardhosein/blocklist-ipsets.git

EXPOSE ${BLOCKLIST_BIND_PORT}

RUN apt-get -y update && \
    apt-get -y install git libstdc++-4.9-dev

RUN git clone --depth 1 -b master --single-branch ${BLOCKLIST_GIT_REPO} ${BLOCKLIST_IPSETS_PATH}

WORKDIR ${BLOCKLIST_IPSETS_PATH}
RUN git checkout master

RUN mkdir -p /usr/src/app
COPY . /usr/src/app

WORKDIR /usr/src/app
RUN npm install
RUN npm install -g gulp

CMD ["npm", "start"]
