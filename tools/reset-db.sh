#!/bin/bash

# Delete all documents in the ac-dev-project database.
curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/ac-dev-project/databases/(default)/documents"
