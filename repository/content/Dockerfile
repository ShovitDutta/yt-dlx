# Suggestion: Use multi-stage builds to reduce the final image size. Consider using a non-root user for running the application to improve security.
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
