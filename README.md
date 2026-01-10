<p align="center">
  <img src="https://raw.githubusercontent.com/DevAbdoTolba/theday/main/public/icon-192x192.png" alt="TheDay Logo" width="120">
</p>

<h1 align="center">TheDay</h1>

<p align="center">
  <strong>Your Ultimate Study Companion</strong><br>
  All content and materials in the journey of a computer science student
</p>

<p align="center">
  Made with <img height="20" width="20" src="https://cdn-0.emojis.wiki/emoji-pics-lf/telegram/heart-with-ribbon-telegram.gif" alt="love"> by AASTMT Aswan <strong>CS Students</strong>
</p>

<p align="center">
  <a href="https://theday.vercel.app"><img src="https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge" alt="Live Demo"></a>
  <a href="#features"><img src="https://img.shields.io/badge/Features-Explore-green?style=for-the-badge" alt="Features"></a>
  <a href="https://github.com/DevAbdoTolba/theday/releases/tag/v2"><img src="https://img.shields.io/badge/Release-Notes-orange?style=for-the-badge" alt="Release Notes"></a>
</p>

---

## Quick Tour

<!-- Replace this placeholder with your actual demo GIF/video -->
<p align="center">

https://github.com/user-attachments/assets/e0593720-535e-4a24-ba86-4e541796a969

</p>

---

## Why TheDay?

| Problem | Solution |
|---------|----------|
| Scattered study materials across drives | **Unified dashboard** with all semesters and courses |
| Slow file searching | **Instant search** with keyboard shortcuts (Ctrl+K or /) |
| No offline access | **PWA support** with IndexedDB caching |
| Outdated content tracking | **New item indicators** show what's changed since your last visit |
| Multiple class management | **Multi-class support** with seamless switching |

---

## Features

### Dashboard & Navigation

- **Smart Home Dashboard** - Personalized greeting with quick-access shortcuts
- **Continue Studying** - One-click access to your last visited subject
- **Semester Overview** - All 8 semesters displayed with course cards
- **Custom Semester Pin** - Pin your current semester to the top
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### File Browser

- **Grid & List Views** - Toggle between visual layouts
- **Category Tabs** - Filter by Material, Schedule, Previous Exams
- **File Preview** - Hover-expand on desktop, zoom on mobile
- **YouTube Integration** - Watch video lectures directly in-app
- **New Item Filter** - Instantly see newly added content
- **File Type Indicators** - PDF, YouTube, Link, and more

### Search System

- **Global Search** - Press `Ctrl+K` or `/` to search anywhere
- **Google Drive Search** - Dedicated search with keyboard navigation
- **Real-time Filtering** - Results update as you type
- **Smart Grouping** - Results organized by subject and type
- **Keyboard Navigation** - Arrow keys, Enter, Escape support

### Performance & Caching

- **Progressive Loading** - Fast initial load with background refresh
- **Smart Caching** - IndexedDB storage for instant revisits
- **Change Detection** - See what's new since your last visit
- **Optimized API** - Reduced load time from 10+ to 2-3 seconds

### Multi-Class Support

- **Transcript System** - Join multiple class groups
- **Easy Switching** - Dropdown selector in header
- **Persistent Preferences** - Your class choice is remembered

### Modern UI/UX

- **Dark Mode** - Beautiful dark theme (light mode available)
- **Smooth Animations** - Framer Motion powered transitions
- **Glass Effects** - Modern glassmorphism design
- **Responsive Grids** - Adaptive layouts for all screens
- **Touch Optimized** - Swipe and tap gestures on mobile

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/MUI-5-007FFF?style=flat-square&logo=mui" alt="MUI">
  <img src="https://img.shields.io/badge/Framer_Motion-Latest-FF0080?style=flat-square&logo=framer" alt="Framer Motion">
  <img src="https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Google_Drive_API-v3-4285F4?style=flat-square&logo=googledrive" alt="Google Drive API">
</p>

---

## Getting Started

### Prerequisites

- Node.js 18+ 👀
- npm, yarn, or pnpm
- MongoDB instance (for transcript features)
- Google Drive API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/DevAbdoTolba/theday.git
cd theday

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .example.env .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
theday/
├── public/              # Static assets, PWA icons
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   └── feedback/    # Loading, tap effects
│   ├── context/         # React contexts (Transcript, Search, etc.)
│   ├── hooks/           # Custom hooks (useSearchShortcut, etc.)
│   ├── pages/
│   │   ├── api/         # API routes (Google Drive, MongoDB)
│   │   ├── subjects/    # Subject pages
│   │   └── theday/      # Dashboard pages
│   ├── styles/          # Global and component styles
│   └── utils/           # Helper functions and types
└── ...
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open global search |
| `/` | Quick search focus |
| `Escape` | Close dialogs |
| `Arrow Keys` | Navigate search results |
| `Enter` | Select search result |
| `Shift + Arrow` | Sidebar navigation |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Contributors

<a href="https://github.com/DevAbdoTolba/theday/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DevAbdoTolba/theday" />
</a>

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>TheDay</strong> - Making studying easier, one semester at a time.
</p>
