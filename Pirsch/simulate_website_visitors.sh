#!/bin/bash

# Target website URL
TARGET_URL="https://www.parrolabs.com"

# Number of requests to simulate
NUM_REQUESTS=10

# Loop to send simulated requests
for ((i=1; i<=NUM_REQUESTS; i++)); do
  echo "Simulating visit $i to $TARGET_URL..."

  # Make a request to the target website
  response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$TARGET_URL" \
    -H "User-Agent: TestAgent$i" \
    -H "Referer: https://example.com/page$i")

  # Check the response
  if [[ "$response" -eq 200 ]]; then
    echo "Visit $i: Success (HTTP $response)"
  else
    echo "Visit $i: Failed (HTTP $response)"
  fi

  # Optional: Wait a second between requests
  sleep 1
done

echo "Finished simulating $NUM_REQUESTS visits."