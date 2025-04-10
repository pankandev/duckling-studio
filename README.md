# Duckling Studio 🦆

Duckling Studio is my playground to try some experiments with LLMs, automate random stuff and
things like that.

For now, this is just a ChatGPT clone, but there are plans to add more features later.

## Overview

Currently, Duckling Studio functions as a conversational AI interface similar to ChatGPT. The application is built using
Next.js and PostgresSQL (I love PostgresSQL so much).

## Features

- Conversational AI interface with Claude.
- Streaming messages.
- Previous chats list.

## Planned Features

- Chat management.
- Message edition (even the assistant ones!)
- Custom AI model configuration (Ollama, LM Studio, OpenAI, etc.).
- Conversation agent management (different "personalities").
- File attachments.
- Some tools (search, reasoning, uhm.... weather?).
- Whatever experiments I come up with.

## Tech Stack

- Next.js - React framework
- PostgreSQL - Database
- Docker - Containerization

## Prerequisites

- Node.js
- pnpm package manager
- Docker and Docker Compose
- Anthropic API key for Claude AI integration

## Getting Started

1. Clone the repository
    ```bash
    git clone https://github.com/pankandev/duckling-studio.git
    cd duckling-studio
    ```
2. Install dependencies
    ```bash
    pnpm install
    ```
3. Set up environment variables

   Create a .env file in the root directory with the following content:
   ```dotenv
   ANTHROPIC_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual Anthropic API key.
4. Set up the database
   The application requires a PostgreSQL database. A Docker Compose configuration is provided for easy setup:
    ```bash
    docker-compose up -d
    ```
   This will start a PostgreSQL instance as defined in the docker-compose.yml file.
5. Run the development server
    ```bash
    pnpm run dev
    ```

The application should now be running at http://localhost:3000.

## Contributing

This project is currently a personal development exercise, but suggestions and feedback are welcome.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) - see the [LICENSE](LICENSE) file for details.
