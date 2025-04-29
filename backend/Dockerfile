# Use an official Python runtime as the base image
FROM python:3.9

RUN apt-get update && apt-get install -y netcat-openbsd

# Set the working directory in the container

WORKDIR /app

COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port on which the server will listen
EXPOSE 8000

CMD ["uvicorn", "server:app","--reload", "--host", "0.0.0.0"]