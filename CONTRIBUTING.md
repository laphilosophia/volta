# Contributing

Thank you for your interest in contributing! We welcome contributions from everyone. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### 1. Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under [Issues](issues).
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### 2. Suggesting Enhancements

- Open a new issue with a clear title and detailed description of the suggested enhancement.
- Explain why this enhancement would be useful to most users.

### 3. Pull Requests

- Fork the repo and create your branch from `main`.
- If you've added code that should be tested, add tests.
- Ensure the test suite passes.
- Make sure your code lints.
- Issue that pull request!

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/laphilosophia/volta.git
   cd volta
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build and test**

   ```bash
   npm run build  # Build TypeScript
   npm run lint   # Check linting
   npm run test   # Run tests (81 tests)
   ```

4. **Start development**
   ```bash
   npm run dev    # Watch mode (if available)
   ```

## Coding Standards

- **TypeScript**: We use TypeScript for type safety. Please ensure all new code is properly typed.
- **Linting**: Run `npm run lint` to check for linting errors before pushing.
- **Formatting**: We follow standard formatting rules.

## Commit Messages

- Use clear and descriptive commit messages.
- Start the commit message with a present-tense verb (e.g., "Add feature", "Fix bug").

## Questions?

Feel free to open an issue for any questions or discussions!
