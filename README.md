# MyCoin

A simple cryptocurrency implementation for a university project.

## Project Overview

This project builds a functional Proof-of-Work blockchain system named MyCoin. It includes:
- A multi-node, peer-to-peer backend.
- Persistent storage using Redis.
- A REST API for interacting with the blockchain.
- A faucet for distributing initial coins.
- Docker-based environment for easy setup and deployment.
- A React-based web client for a user-friendly wallet experience.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Setup and Running the Application

The setup process has been fully automated.

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd MyCoin
    ```

2.  **Install Root Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Application with Docker**

    Use the `docker:up` script to handle everything from environment setup to starting the containers.
    ```bash
    npm run docker:up
    ```
    This command will:
    - **On first run:** Automatically execute a setup script to generate a `.env` file with unique private keys.
    - Install dependencies for both the backend and the frontend client.
    - Build the React client for production.
    - Build the Docker image for the Node.js application.
    - Start a Redis container and two blockchain nodes.
        - `node1` (Faucet Node) serves the backend API and the frontend client at `http://localhost:3001`
        - `node2` (Miner Node) is available at `http://localhost:3002`

    To stop the application, press `Ctrl+C` and then run:
    ```bash
    npm run docker:down
    ```

## Frontend Client (Development)

For a better development experience with hot-reloading, you can run the client separately.

1.  Start the backend nodes first (in the root directory):
    ```bash
    npm run docker:up
    ```
2.  In a new terminal, navigate to the `client` directory:
    ```bash
    cd client
    ```
3.  Install client-specific dependencies:
    ```bash
    npm install
    ```
4.  Run the Vite development server:
    ```bash
    npm run dev
    ```
    The client will be available at `http://localhost:5173` and will automatically proxy API requests to the backend.

### Client Features

- **Create Wallet:** Generate a new MyCoin wallet using either a 12-word mnemonic phrase or an encrypted keystore file.
- **Access Wallet:** Securely access your wallet using your private key, mnemonic phrase, or keystore file.
- **(Coming Soon)** Wallet dashboard to view balance and send coins.
- **(Coming Soon)** Blockchain explorer to view transactions and blocks.

## API Usage

Once running, you can interact with the API endpoints for either node. For example, using `curl` or Postman:

- **Get public node info (faucet address, etc.):** `GET http://localhost:3001/api/info`
- **Create a new wallet:** `GET http://localhost:3001/api/wallet/create`
- **Get all blocks:** `GET http://localhost:3001/api/blocks`
- **Get transaction pool:** `GET http://localhost:3001/api/transactions`
- **Mine new transactions:** `GET http://localhost:3001/api/mine-transactions`
- **Get miner info for Node 1 (Faucet):** `GET http://localhost:3001/api/miner-info`
- **Get miner info for Node 2:** `GET http://localhost:3002/api/miner-info`
- **Get info for a specific address:** `GET http://localhost:3001/api/address/<wallet-public-key>`
- **Use the faucet (on any node):** `POST http://localhost:3002/api/faucet-transact` with JSON body:
  ```json
  {
    "recipient": "some-other-wallet-public-key"
  }
  ```
- **Submit a transaction (client-signed):** `POST http://localhost:3001/api/transact` with a full transaction object in the JSON body.