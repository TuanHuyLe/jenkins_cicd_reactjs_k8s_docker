# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /usr/src/app

# install app dependencies
COPY package.json ./
RUN npm install

# add app
COPY . ./

# start app
EXPOSE 3000
CMD ["npm", "start"]

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
