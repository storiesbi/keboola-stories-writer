FROM radektomasek/keboola-base-node
MAINTAINER Michael Kuty <michael.kuty@stories.bi>

WORKDIR /home

COPY . /home
RUN npm install

ENTRYPOINT node_modules/.bin/babel-node --presets es2015,stage-0 ./src/index.js --data=/data
