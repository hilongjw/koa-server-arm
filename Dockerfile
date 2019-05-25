FROM arm64v8/node:10.15.3-stretch-slim

ENV PORT 9999

WORKDIR /data/src

COPY package.json package.json

RUN npm install --production

COPY . /data/src

## HEALTHCHECK

# HEALTHCHECK --interval=5s --timeout=3s \
#   CMD curl -fs http://localhost:9999/_docker_healthcheck || exit 1

EXPOSE 9999

CMD npm start