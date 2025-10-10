FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose the port
EXPOSE 4444

# Run the app
CMD ["bun", "run", "index.ts"]

