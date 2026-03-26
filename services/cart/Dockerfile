FROM node:20-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
# Install all dependencies including dev for building
RUN npm install

COPY . .

FROM node:20-alpine AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
# In a real app we might only copy prod dependencies, but this suffices for the demo
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/*.js ./

USER node

EXPOSE 3002
CMD ["node", "index.js"]
