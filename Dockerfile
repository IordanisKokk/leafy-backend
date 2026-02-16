# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build \
  && mkdir -p dist/data \
  && cp -r src/data/* dist/data/

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build /usr/src/app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["sh","-c","node dist/scripts/migrate.js && node dist/scripts/seedSpecies.js && node dist/index.js"]
