# NetSpectre

> **A Professional VS Code-Inspired Desktop Security & Diagnostic Workstation**

## 📸 Application Screenshots

<p align="center">
  <img src="App%20Screenshots/extra%20tools.png" alt="NetSpectre Extra Tools & Side Notes" width="48%" />
  <img src="App%20Screenshots/nslookup.png" alt="NetSpectre Terminal Diagnostics" width="48%" />
</p>

NetSpectre is a Windows desktop application for network diagnostics, security auditing, and authorized CTF workflows. Built with **Electron** and **React**, it runs supported tools inside an Alpine Linux Docker container named `netspectre-runner`, keeping their dependencies separate from the Windows host.

---

## 🌟 What's New in NetSpectre

- **⚡ Multi-Tab Workspace:** Keep separate tools, targets, options, and terminal buffers in individual workspace tabs. Switch tabs without losing their state or output.
- **📝 Dark Notebook Side Notes:** Record target details and findings in a lined, dark-mode notepad built into the workspace.
- **📁 Multi-Project & Target Records:** Create, title, switch between, and manage multiple notes. Notes save automatically to local storage and are restored when the app restarts.
- **🎨 Custom NetSpectre Branding:** The custom logo appears in the app title bar; the configured Windows icon is used for the window and packaged installer.
- **📋 Selectable Terminal Output:** Highlight and copy IPs, command output, and error details directly from the terminal.

---

## 🛠️ Highlights

- **Containerized execution:** Diagnostic utilities and their dependencies run in the `netspectre-runner` Docker container rather than being installed on the host.
- **Secure IPC boundary:** Electron context isolation is enabled and renderer Node integration is disabled. The main process validates allowed executables and passes arguments without invoking a shell.
- **Live terminal:** View streamed output, filter it, copy all output, or export a timestamped `.txt` report.
- **Command preview:** Review the generated Docker command before running a tool.
- **Docker lifecycle automation:** At startup, the app checks Docker availability, builds the image from the project Dockerfile if needed, and starts the background container.
- **Persistent notes:** Note records are automatically saved in browser local storage.

---

## 🧰 Supported Tools

| Category | Tool | Capabilities |
| :--- | :--- | :--- |
| Scanning | **Nmap** | Host and port scanning, scan types (`-sS`, `-sT`, `-sV`, `-A`), timing templates, custom ports, host discovery, and OS detection |
| DNS diagnostics | **NSLookup** | Query common DNS record types with optional resolver selection |
| DNS diagnostics | **Dig** | DNS queries with record type, `+short`, `+trace`, and answer-only options |
| Web & HTTP | **Curl** | HTTP methods, custom headers and request bodies, redirects, response headers, TLS verification option, and verbose output |
| Network tools | **Ping** | ICMP echo requests with count and TTL options |
| Network tools | **Traceroute** | Hop-by-hop network path analysis |
| Network tools | **Whois** | Domain registration lookup |
| Network tools | **Netcat (`nc`)** | TCP connectivity checks to a specified port |
| Network tools | **Netstat** | Display network statistics |
| Network tools | **Ifconfig** | Display network interface information |

Tool availability and behavior depend on the installed versions in the Docker image and network access available to Docker Desktop.

---

## ⚙️ Requirements

- **Operating system:** Windows 10 or Windows 11, 64-bit
- **Container engine:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running with Linux containers enabled
- **Development environment:** Node.js 18 or later and npm
- **Initial image build:** Internet access for downloading Alpine packages during the first Docker image build

Docker initialization runs asynchronously as the app starts. The title bar reports Docker status. If Docker Desktop is unavailable, start it and refresh the status indicator.

---

## 🚀 Installation & Running

### 1. Get the project

Clone the repository using the URL supplied by your project owner, then open a terminal in the project directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Start Docker Desktop

Launch Docker Desktop and wait for its engine to become ready. NetSpectre checks the Docker daemon and initializes the `netspectre-runner` image and container on app startup.

### 4. Run in development mode

```bash
npm run dev
```

This starts the Vite development server and launches Electron.

### 5. Build the Windows installer

```bash
npm run build
```

Vite builds the renderer, then electron-builder packages the Windows application and NSIS installer under `dist-electron/`. The Dockerfile is included as an application resource so the installed app can build the image when needed.

---

## 🧭 Using NetSpectre

1. Select a tool from the left sidebar.
2. Enter a target and configure its options.
3. Review the live command preview, then select **Run**.
4. View or filter output in the terminal. Use **Copy** to copy all output, **Export TXT** to download it, or **Clear** to empty the current tab's terminal.
5. Select **+** in the workspace tab bar to create a separate workspace. Each tab keeps its own selected tool, target, options, running state, and terminal output. Close a tab with **×** when it is not running.
6. Use the right-side **Side Notes** panel to create and switch between named target/project records. Notes save automatically.

For Netcat, select it under **Extra Tools**, enter the host in the target field, and specify a TCP port from 1 to 65535.

### Workspace and execution behavior

Workspace state is held in memory for the current app session; it is not restored after the app restarts. Note records are persisted separately in local storage. The current Electron Docker bridge runs one command at a time, so a command in another tab cannot start until the active command finishes or is stopped. Output from a running command remains associated with its originating tab when you switch away.

---

## 🏗️ Architecture

### React renderer

The React interface manages workspace tabs, tool settings, command previews, notes, and terminal display. Each workspace has its own tool, target, options, running state, and output buffer.

### Preload and IPC

The preload script exposes a limited API through Electron's `contextBridge`. The renderer uses named IPC channels to request Docker status, start or stop commands, and receive streamed terminal events associated with their workspace.

### Electron main process

The main process validates tool requests against an executable allowlist. It uses argument-based process execution for Docker operations and streams command output back to the renderer. User-provided targets and options are passed as individual arguments, not concatenated into a shell command.

### Docker tools image

The project `Dockerfile` defines an Alpine-based image containing the supported utilities. At startup, NetSpectre checks the Docker daemon, builds the `netspectre-runner` image if it is missing, and starts the named background container when needed.

---

## 🔐 Security & Responsible Use

- Use NetSpectre only on systems and networks you own or are explicitly authorized to assess.
- Docker provides a separate environment for tool dependencies, but it is not a guarantee of complete isolation or a security boundary against all threats.
- Review the target, selected options, and command preview before running a diagnostic.
- Network scans and probes may be logged and may be subject to organizational policies and local law.
- Curl's `-k` option disables TLS certificate verification. Use it only when appropriate for your test.
- Notes are stored in local storage and are not encrypted. Do not use the notes panel to store passwords, tokens, or other sensitive credentials.

---

## 📜 Project Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and Electron in development mode |
| `npm run dev:vite` | Start only the Vite development server |
| `npm run dev:electron` | Wait for Vite, then launch Electron |
| `npm run build` | Build the renderer and package the Windows application |
| `npm run preview` | Preview the production renderer build |
| `node scripts/verify.js` | Check that required project files are present |

## License

NetSpectre is distributed under the license declared in [`package.json`](./package.json).
