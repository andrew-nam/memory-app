FROM node:22.15-bookworm-slim

WORKDIR /vue-frontend

EXPOSE 5173

CMD [ "npm", "run", "dev"]