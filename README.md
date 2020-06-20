## Game Time

App for scheduling video game sessions.

## Dev Environment

To setup and run the firebase emulator

```bash
curl -sL firebase.tools | bash   # Install firebase CLI
tools/reset-db.sh                # Optional: delete all data in the DB.
firebase emulators:start
```

To run the server

```bash
cd client
yarn
yarn start
```