FROM public.ecr.aws/docker/library/node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Command to run the application with host flag
CMD ["npm", "run", "dev", "--", "--host"]
