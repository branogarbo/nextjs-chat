FROM node:14
WORKDIR /nextjs-chat
COPY . .
RUN npm i
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]