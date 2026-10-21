# NetSpectre

**VS Code-Inspired Desktop Security & Networking Diagnostics Suite**

NetSpectre is a Windows desktop toolkit for common network diagnostics. It combines a React interface with Electron and runs diagnostic tools inside a Docker container, keeping those utilities separate from the Windows host environment.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Docker](https://img.shields.io/badge/Docker-containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-runtime-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

## Contents

- [Highlights](#highlights)
- [Supported tools](#supported-tools)
- [Requirements](#requirements)
- [Install and run](#install-and-run)
- [Using NetSpectre](#using-netspectre)
- [Architecture](#architecture)
- [Security notes](#security-notes)
- [Project scripts](#project-scripts)
- [License](#license)

## Highlights

- **Containerized diagnostics:** supported network tools run inside a Docker container instead of being launched as Windows host utilities.
- **Argument-based execution:** the renderer supplies a tool name and argument array. The Electron main process checks the executable against an allowlist and passes arguments to Docker without constructing a shell command string.
- **Secure renderer boundary:** Electron context isolation is enabled and renderer Node integration is disabled. A limited preload bridge exposes the required application APIs.
- **Live terminal output:** command output streams into a VS Code-inspired terminal view as it arrives.
- **Find output quickly:** filter terminal entries by text or entry type while a command is running.
- **Save and share results:** copy all terminal output or export it as a timestamped plain-text report.
- **Interactive configuration:** tool controls and a live command preview make selected options visible before execution.
- **Container status:** the title bar reports Docker/container readiness and supports a manual status refresh.

## Supported tools

| Tool | Available functionality |
| --- | --- |
| **Nmap** | Host and port scanning options, service/version detection, timing templates, and host-discovery controls |
| **NSLookup** | DNS lookups for common record types with an optional DNS resolver |
| **Dig** | DNS record queries with short, trace, and answer-only output options |
| **Curl** | HTTP requests with method selection, custom headers, optional body, redirect, response-header, and TLS options |
| **Whois** | Domain registration lookup |
| **Traceroute** | Network path tracing to a host |
| **Netcat (`nc`)** | TCP connectivity check to a specified host and port |

Tool behavior depends on the installed versions inside the Docker image and on network access available to Docker Desktop.

## Requirements

- Windows 10 or Windows 11
- Docker Desktop installed, started, and configured to use Linux containers
- Node.js and npm (for development and packaging)
- Internet access for the initial dependency installation and first Docker image build

The first run may take longer than later commands: NetSpectre checks the Docker daemon and builds the tools image from the project Dockerfile if the image is not already present.

## Install and run

### Get the project

Open PowerShell in the project directory. If the source is hosted in a Git repository, clone it using the repository URL supplied by your project owner, then change into the cloned directory.

### Install dependencies

```powershell
npm install
```

### Start Docker Desktop

Launch Docker Desktop and wait until its engine is running. NetSpectre's title bar displays the current Docker/container state. If Docker is unavailable, start Docker Desktop and refresh the status indicator before running a tool.

### Run in development mode

```powershell
npm run dev
```

This starts the Vite development server and launches the Electron desktop application.

### Build the Windows installer

```powershell
npm run build
```

The production renderer is generated first, then Electron Builder packages the Windows application and installer under `dist-electron/`. The Dockerfile is bundled as an application resource so the installed application can build its tools image on first use.

## Using NetSpectre

1. Select **Nmap**, **NSLookup**, **Dig**, **Curl**, or **Extra Tools** from the left activity bar.
2. Enter the target in the target field. Tool-specific options appear below it. Extra Tools includes Ping, Whois, Traceroute, Netcat, and network-interface utilities.
3. Review the live command preview. It updates as you change the target or options.
4. Select **Run** to start the command. Output streams into the terminal; select **Stop** to stop an active command.
5. Enter a term in the terminal filter to narrow the visible output. **Copy** copies the full output; **Export TXT** downloads the full output as a text report; **Clear** clears the terminal.

For Netcat, choose **Netcat**, enter the remote host in the target field, and enter a TCP port between 1 and 65535.

## Architecture

### React renderer

The React renderer maintains tool selection and options, creates a preview, and displays output in the terminal. It cannot directly access Node.js or Electron APIs.

### Preload and IPC

The preload script uses Electron's `contextBridge` to expose a small set of application operations. The renderer invokes named IPC channels to request Docker status, run or stop commands, and subscribe to terminal output.

### Electron main process

The main process validates command requests against an executable allowlist. Docker management calls use argument-based process execution; tool runs use `spawn` with a Docker argument array and the default `shell: false` behavior. The process streams stdout/stderr back to the renderer. User-provided targets and options are passed as individual arguments rather than concatenated into a shell command.

### Docker tools image

The Alpine-based image defined in `Dockerfile` installs the supported diagnostic utilities. The app checks Docker availability, builds the image when needed, starts a background container, and executes each requested tool in that container.

## Security notes

- Use NetSpectre only on systems and networks you own or are explicitly authorized to assess.
- Docker isolation separates tool execution from the host, but does not make network activity anonymous or risk-free. Targets and intermediate network devices may log requests.
- Review the command preview and selected options before running a diagnostic.
- The application accepts only executables included in its main-process allowlist; renderer input is not treated as a shell script.
- The Curl `-k` option disables TLS certificate verification. Use it only when appropriate for your test.
- Network scans and probing may be subject to organizational policy and local law.

## Project scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and Electron in development mode |
| `npm run dev:vite` | Start only the Vite development server |
| `npm run dev:electron` | Wait for Vite, then launch Electron |
| `npm run build` | Build the renderer and package the Windows application |
| `npm run preview` | Serve the built renderer for preview |
| `node scripts/verify.js` | Check that required project files are present |

## License

NetSpectre is distributed under the license declared in [`package.json`](./package.json).
