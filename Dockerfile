FROM node:12
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY ./ ./
CMD ["/bin/bash", "-c", "sleep infinity"]
