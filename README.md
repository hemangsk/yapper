# Yapper - Yet Another Planning Poker

A real-time, peer-to-peer planning poker application built with WebRTC for agile teams.

## 🚀 Features

- **Peer-to-peer**: No central server needed
- **Real-time collaboration**: Instant updates across all participants
- **Anonymous voting**: Numbers remain hidden until reveal
- **Easy sharing**: One-click room sharing via links
- **Simple interface**: Clean, cyberpunk-inspired design

## 🛠️ Technology Stack

- TypeScript
- PeerJS (WebRTC)
- Webpack
- CSS3

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/hemangsk/yapper.git
cd yapper
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:9000`

### Building for Production

```bash
npm run build
```

## 🎮 Usage

1. Create a room by clicking "Create Room"
2. Share the room link with your team
3. Enter your nickname
4. Submit your estimate when ready
5. Host can reveal all numbers when everyone has submitted
6. Start next round to continue

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Structure

```
yapper/
├── js/
│   ├── app.js        # Main application logic
│   └── main.ts       # Entry point
├── css/
│   └── styles.css    # Styling
└── index.html        # Main HTML file
```

## 🔑 Key Components

### Room Management
```typescript:js/app.js
startLine: 63
endLine: 131
```

### Participant Handling
```typescript:js/app.js
startLine: 191
endLine: 209
```

### Vote Management
```typescript:js/app.js
startLine: 139
endLine: 155
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- PeerJS for the excellent WebRTC implementation
- The open-source community for inspiration
