# MyCoin

A simple cryptocurrency implementation for a university project, featuring a peer-to-peer backend, a proof-of-work blockchain, and a full-featured React web client for wallet management.

## Project Overview

This project builds a functional Proof-of-Work blockchain system named MyCoin. It includes a complete ecosystem for users to create wallets, send and receive currency, and explore the blockchain.

-   **Backend:** A multi-node, peer-to-peer backend built with Node.js and WebSockets.
-   **Persistence:** Blockchain and transaction pool data are persisted using Redis.
-   **API:** A REST API for interacting with the blockchain.
-   **Frontend:** A modern React client providing a user-friendly wallet experience.
-   **Deployment:** A fully containerized setup using Docker and Docker Compose for easy, one-command setup and deployment.

## Core Features

### Wallet Management

-   **Create Wallet:** Securely generate a new MyCoin wallet using two industry-standard methods:
    -   **Mnemonic Phrase:** A 12-word phrase that serves as a master key.
    -   **Keystore File:** An encrypted JSON file protected by a user-defined password.
-   **Access Wallet:** Log in to your wallet using either your Mnemonic Phrase or your Keystore File and password. Private keys are handled securely and are not required for login.

### Interactive Dashboard

Once logged in, the user has access to a full-featured dashboard:
-   **View Balance & History:** See your current MyCoin balance and a complete list of all incoming and outgoing transactions.
-   **Send MyCoin:** Send funds to any other MyCoin address. Transactions are created and signed securely on the client-side before being broadcast to the network.
-   **Wallet Tools:**
    -   **Faucet:** Request an initial amount of MyCoin to get started.
    -   **Mine:** Trigger the mining process on the connected node to help confirm transactions (including your own) and earn mining rewards.

### Blockchain Explorer

Accessible to anyone without logging in, the explorer provides full transparency into the blockchain:
-   **Latest Blocks:** View a paginated list of all blocks on the chain.
-   **Block Details:** Expand any block to see its hash, timestamp, nonce, and all transactions it contains.
-   **Address History:** Search for any wallet address to view its current balance and complete transaction history.
-   **Known Addresses:** See a list of addresses that have participated in the network.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Running the Application

The entire setup process is automated with a single command.

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

    Use the `docker:up` script to start all services in the background.
    ```bash
    npm run docker:up
    ```
    This command will:
    -   **On first run:** Automatically execute a setup script to generate a `.env` file with unique private keys for the network's faucet and a secondary miner.
    -   **Build the Docker Image:** A multi-stage build process compiles the React client and sets up the Node.js server in a self-contained, optimized image.
    -   **Start Services:** It launches all necessary containers:
        -   `redis`: The database for the blockchain.
        -   `node1`: The primary node, which also serves the web client.
        -   `node2`: A secondary peer node for mining and network decentralization.

4.  **Access the Application**
    Open your web browser and navigate to:
    
    **`http://localhost:3001`**

    or for secondary node:

    **`http://localhost:3002`**

    You can now create a wallet, use the faucet, and explore the blockchain.

5.  **Stopping the Application**
    To stop all running containers, use the `docker:down` script:
    ```bash
    npm run docker:down
    ```
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