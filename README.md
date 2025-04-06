# VA To-Do

A simple to-do list Chrome extension designed for Virtual Assistants to stay organized and productive.

## Features

- Add, remove, and mark tasks as completed
- Data persistence using Chrome storage
- Dark/light mode toggle
- Clean, simple interface

## Project Structure

```
app/
├── assets/               # Static assets
│   ├── delete.png        # Delete icon
│   └── valogo.png        # App logo
├── components/           # UI Components
│   ├── Todo.js           # Individual todo item
│   ├── TodoList.js       # Todo list manager
│   └── ThemeToggler.js   # Dark/light mode toggler
├── services/             # Services
│   └── StorageService.js # Local storage service
├── styles/               # Stylesheets
│   └── styles.css        # Main stylesheet
├── app.js                # Main application
├── index.html            # Main HTML
└── manifest.json         # Extension manifest
```

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `app` folder from this repository
5. The extension should now be installed and ready to use

## Development

To modify the extension:

1. Make changes to the code
2. If Chrome is open, click the refresh icon on the extension card to reload
3. Test your changes by clicking on the extension icon

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Chrome Extension API 