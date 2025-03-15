#!/bin/bash

# Default to port 8000 if PORT not set
PORT="${PORT:-8000}"

# Create static directories if they don't exist
mkdir -p staticfiles media

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn with the correct project name
exec gunicorn blaze_project.wsgi:application --bind 0.0.0.0:$PORT
