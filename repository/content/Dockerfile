FROM node:lts
RUN apt-get update && \
  apt-get install -y \
  git \
  tor \
  curl \
  ffmpeg
RUN rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY ./next /app/next
WORKDIR /app/next
RUN yarn install && yarn build
CMD ["yarn", "start"]
