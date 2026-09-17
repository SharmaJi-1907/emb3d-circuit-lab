// EMB3D Entry Point
// Styles, in cascade order: later files may override earlier ones (#27b)
import './styles/base/fonts.css';
import './styles/base/tokens.css';
import './styles/base/reset.css';
import './styles/layout/shell.css';
import './styles/layout/sidebar.css';
import './styles/layout/header.css';
import './styles/layout/views.css';
import './styles/components/buttons.css';
import './styles/components/badges.css';
import './styles/components/toggle.css';
import './styles/components/toast.css';
import './styles/components/tooltip.css';
import './styles/views/dashboard.css';
import './styles/views/library.css';
import './styles/views/viewer.css';
import './styles/base/animations.css';
import './styles/components/search-modal.css';
import './styles/components/panels.css';
import './styles/components/notifications.css';
import './styles/views/simulator.css';
import './styles/views/boards.css';
import './styles/views/datasheet.css';
import './styles/views/ai.css';
import './styles/views/projects.css';
import './engines/background/circuit-bg.js';
import './data/index.js';
import './engines/three-viewer/index.js';
import './engines/simulator/index.js';
import './app/app.js';

console.log('EMB3D: All modules successfully loaded.');
