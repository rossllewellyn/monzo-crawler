# Monzo Crawler

A configurable web crawler that maps a website's structure by following links.

## Requirements

- Node.js
- npm

## Usage

### Installation

```bash
npm install
```

### Running with Default Settings

```bash
npm run start
```

This will crawl https://books.toscrape.com with a task limit of 50 and no delay between requests.

### Running with Custom Arguments

```bash
npm run start -- <seedUrl> <taskLimit> <intervalMs>
```

For example:

```bash
npm run start -- https://example.com 100 200
```

### Arguments

- `seedUrl`: The starting URL for the crawler (e.g., https://example.com)
- `taskLimit`: Maximum number of concurrent crawling tasks (e.g., 50)
- `intervalMs`: Millisecond delay between requests to avoid rate limiting (e.g., 200)

## Running Tests

```bash
npm test
```

## Class Responsibilities

### Crawler

- Orchestrates the crawling process
- Manages task execution
- Extracts links from HTML

### DomainHandler

Manages domain-specific data:

- Target hostname
- URL history
- Resultant site map

### TaskHandler

- Controls task execution
- Enforces concurrency limits
- Handles intervals between requests

### QueueHandler

Provides a queue implementation for managing URLs to be processed
