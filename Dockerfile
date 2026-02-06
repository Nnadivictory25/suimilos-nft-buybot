FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build app with minification
RUN bun build index.ts --minify --outdir=dist

FROM oven/bun:1 as runner
WORKDIR /app

# Copy only built output and necessary files
COPY --from=build /app/package.json /app/bun.lockb ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/indexed-data ./indexed-data

# Expose the port
EXPOSE 4444

# Run the app from the built minified output
CMD ["bun", "run", "dist/index.js"]