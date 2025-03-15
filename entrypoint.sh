#!/bin/bash

# Default to port 8000 if PORT not set
PORT="${PORT:-8000}"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
exec gunicorn blaze.wsgi:application --bind 0.0.0.0:$PORT