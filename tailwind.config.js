/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VS Code-inspired palette
        vscode: {
          bg:           '#1e1e1e',   // editor background
          sidebar:      '#252526',   // sidebar background
          panel:        '#1e1e1e',   // panel background
          titlebar:     '#323233',   // title bar / activity bar
          active:       '#007acc',   // active accent (VS Code blue)
          hover:        '#2a2d2e',   // hover state
          border:       '#3c3c3c',   // border color
          text:         '#cccccc',   // default text
          textDim:      '#858585',   // dimmed / muted text
          textActive:   '#ffffff',   // active / bright text
          terminal:     '#0c0c0c',   // terminal background
          green:        '#4ec9b0',   // teal / keyword
          yellow:       '#dcdcaa',   // function color
          orange:       '#ce9178',   // string color
          blue:         '#4fc1ff',   // type / variable
          purple:       '#c678dd',   // keyword purple
          red:          '#f44747',   // error red
          inputBg:      '#3c3c3c',   // input background
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Cascadia Code"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
