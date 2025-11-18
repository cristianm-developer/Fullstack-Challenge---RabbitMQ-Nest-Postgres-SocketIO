#!/bin/sh
set -e
echo "Running migrations..."
npm run migration:run
echo "Migrations ran successfully"
echo "Starting the application..."
exec "$@"