# MyCoin

A simple cryptocurrency implementation for a university project.

## Project Overview

This project builds a functional Proof-of-Work blockchain system named MyCoin. It includes:
- A multi-node, peer-to-peer backend.
- Persistent storage using Redis.
- A REST API for interacting with the blockchain.
- A faucet for distributing initial coins.
- Docker-based environment for easy setup and deployment.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Setup Instructions

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd MyCoin
    ```

2.  **Generate Faucet Wallet Keys**

    The system requires a static keypair for the faucet/miner wallet. A script is provided to generate this.
    
    First, install dependencies to run the script:
    ```bash
    npm install
    ```
    
    Now, run the key generation script:
    ```bash
    node scripts/generate-keypair.js
    ```
    This will output a private key and a public key. **Save these securely.**

3.  **Configure Environment Variables**

    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open the new `.env` file.
    - Paste the `FAUCET_PRIVATE_KEY` value you generated in the previous step.

4.  **Update Genesis Block Configuration**

    - Open `config.js`.
    - Find the `FAUCET_PUBLIC_KEY` constant.
    - Replace the placeholder value with the public key you generated.

5.  **Run the Application with Docker**

    The easiest way to run the entire system (including the Redis database and a two-node P2P network) is with Docker Compose.
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Docker image for the Node.js application.
    - Start a Redis container for data persistence.
    - Start two blockchain nodes:
        - `node1` accessible at `http://localhost:3001`
        - `node2` accessible at `http://localhost:3002`

    To stop the application, press `Ctrl+C` and then run:
    ```bash
    docker-compose down
    ```

## API Usage

Once running, you can interact with the API endpoints. For example, using `curl` or Postman:

- **Get all blocks:** `GET http://localhost:3001/api/blocks`
- **Get transaction pool:** `GET http://localhost:3001/api/transactions`
- **Mine new transactions:** `GET http://localhost:3001/api/mine-transactions`
- **Get faucet/miner info:** `GET http://localhost:3001/api/miner-info`
- **Use the faucet:** `POST http://localhost:3001/api/faucet-transact` with JSON body:
  ```json
  {
    "recipient": "some-other-wallet-public-key"
  }
  ```