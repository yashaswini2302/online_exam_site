FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY scripts ./scripts

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s CMD node -e "fetch('http://127.0.0.1:4000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "start"]