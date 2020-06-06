## Game Time

App for scheduling video game sessions.

## Dev Environment

To setup and run the firebase emulator

```bash
curl -sL firebase.tools | bash  # Install firebase CLI
firebase emulators:start
```

Note you'll have to update the firestore.rules to allow all reads/writes by
changing false to true in order to use the client.

To run the server

```bash
cd client
yarn
yarn start
```