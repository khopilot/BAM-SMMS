# BAM APP

A powerful Social Media Management Tool built with Tauri, React, and TypeScript. BAM APP provides comprehensive tools for managing your social media presence across multiple platforms.

## What is BAM APP?

BAM APP is a cross-platform desktop application that offers:

- **Social Media Management**: Multi-platform content scheduling and management
- **Video Optimization**: Support for 9:16 (TikTok/Reels) and 16:9 (YouTube/Facebook) formats
- **Brand Identity Management**: Consistent branding with custom color palette (#FA1F15, #1F31C7, #FEC802)
- **Analytics Dashboard**: Comprehensive metrics and performance tracking
- **Content Assistant**: AI-powered content suggestions and optimization
- **Asset Library**: Centralized brand assets and templates

## Key Features

- 🎨 **Brand Identity Manager** - Maintain consistent visual branding
- 📱 **Video Management** - Upload, edit, and optimize videos for different platforms
- 📊 **Analytics Dashboard** - Track performance across all your social channels
- 🤖 **AI Content Assistant** - Get smart suggestions for titles, descriptions, and hashtags
- 📚 **Asset Library** - Access brand-approved logos, templates, and resources
- 🎯 **Multi-Platform Support** - Optimize content for TikTok, Instagram, YouTube, Facebook

## Technology Stack

BAM APP is built with Tauri, providing:
- Cross-platform compatibility (Windows, macOS, Linux)
- Small bundle sizes (~30MB)
- Native performance
- Enhanced security
- Modern web technologies (React, TypeScript, Tailwind CSS)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific dependencies:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Various packages (see [Tauri setup docs](https://tauri.app/v1/guides/getting-started/prerequisites))

## Quick Start

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/enoreyes/starter-app
cd starter-app
```

Install dependencies:

```bash
npm install
```

Run the desktop application:

```bash
npm run tauri:dev
```

This will launch a native desktop window application, not just a browser tab. The first build may take a few minutes as Rust dependencies are compiled.

## Available Commands

- `npm run tauri:dev` - Start the desktop application in development mode
- `npm run tauri:build` - Build the desktop application for production
- `npm test` - Run tests
- `npm run lint` - Run linting

## Project Structure

```
starter-app/
├── src/               # Frontend source code (React)
│   ├── App.tsx        # Main application component
│   └── backend.ts     # Interface to Rust backend
├── src-tauri/         # Rust backend code
│   ├── src/main.rs    # Main Rust entry point
│   └── tauri.conf.json # Tauri configuration
└── README.md          # This file
```

## Next Steps

After getting the app running, try adding new features or modifying the existing code to see how Tauri works with React and TypeScript.

## Learn More

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
