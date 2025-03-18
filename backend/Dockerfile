# Use a specific Python version (avoid Python 3.13)
FROM python:3.11-slim  

# Set working directory inside the container
WORKDIR /app  

# Copy only requirements.txt first (for caching)
COPY requirements.txt .

# Use a faster PyPI mirror (Tsinghua, best for Asia)
RUN python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# Install dependencies without cache
RUN python -m pip install --no-cache-dir -r requirements.txt  

# Copy the rest of the app files
COPY . .

# Expose Flask port
EXPOSE 5002  

# Start the app with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "main:app"]
