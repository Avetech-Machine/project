# Service Receipt Management System

A React-based web application for creating and managing service receipts with real-time currency conversion and profit analysis. Features a clean black and white design matching the provided specifications.

## Features

### ✅ Completed Features

- **🏠 Navigation Sidebar**: Clean white sidebar with black text, exactly matching the uploaded design
- **📝 Service Receipt Form**: Complete "Create New Service Receipt" form with:
  - Machine information (name, year, hours, serial number)
  - Operating system selection with tabbed interface
  - Measurement probe settings (radio button selections)
  - Accessory data input
  
- **💰 Cost Management**: 
  - Dynamic cost details with add/delete functionality
  - Multi-currency support (EUR, TRY, USD)
  - Real-time EUR conversion display
  - Professional cost table with delete icons

- **📊 Sales & Profit Analysis**:
  - Live profit calculation
  - Visual profit margin indicator
  - Real-time EUR-TRY conversion
  - Summary cards for cost, sales, and profit

- **🌐 Currency Conversion**:
  - Live exchange rates from external API
  - Automatic rate refresh every 10 minutes
  - Fallback rates for offline scenarios
  - Professional currency formatting

- **📱 Responsive Design**:
  - Mobile-optimized layout
  - Responsive grid system
  - Touch-friendly interface
  - Collapsible navigation on mobile

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── MainLayout.js
│   │   └── MainLayout.css
│   ├── Sidebar/
│   │   ├── Sidebar.js
│   │   └── Sidebar.css
│   ├── ServiceReceipt/
│   │   ├── CreateServiceReceipt.js
│   │   ├── CreateServiceReceipt.css
│   │   ├── CostDetails.js
│   │   ├── CostDetails.css
│   │   ├── SalesAnalysis.js
│   │   └── SalesAnalysis.css
│   └── common/
├── services/
│   └── currencyService.js
├── App.js
├── App.css
└── index.css
```

## Design System

- **Color Scheme**: Clean black and white design matching uploaded specifications
- **Layout**: Professional form layout with proper field alignment
- **Typography**: Clean, modern typography with proper hierarchy
- **Responsive**: Mobile-first responsive design

## Technology Stack

- **React 19.1.1**: Modern React with hooks
- **CSS3**: Custom responsive styling with black/white theme
- **Exchange Rate API**: Live currency conversion
- **Create React App**: Development environment

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd testmach
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Creating a Service Receipt

1. **Machine Information**: Fill in machine details including name, year, hours, and serial number
2. **Operating System**: Select from available options (Heidenhain, Siemens, Fanuc, Other)
3. **Measurement Settings**: Configure probe settings using radio buttons
4. **Cost Details**: 
   - Click "Maliyet Ekle" to add new cost items
   - Select currency (EUR, TRY, USD)
   - Enter description and amount
   - View real-time EUR conversion
   - Delete items using trash icon
5. **Sales Analysis**: 
   - Enter sales price
   - View automatic profit calculations
   - Monitor profit margin with visual indicator
   - See live TRY conversion

### Navigation

- Use the left sidebar to navigate between sections
- Click menu items to switch views
- Sidebar collapses automatically on mobile devices

## Currency Features

- **Live Rates**: Fetches current EUR exchange rates every 10 minutes
- **Offline Support**: Falls back to cached rates when API is unavailable
- **Multi-Currency**: Supports EUR, TRY, and USD with automatic conversion
- **Real-time Display**: Shows converted amounts as you type

## Responsive Design

The application is fully responsive with:
- **Desktop**: Full sidebar and multi-column layouts
- **Tablet**: Adapted grid layouts with maintained functionality
- **Mobile**: Collapsible navigation and single-column forms

## Future Enhancements

Ready for additional screens and features:
- User management interface
- Service history and reporting
- Advanced filtering and search
- Data persistence and API integration
- Multi-language support

## Performance

- Optimized React components with proper state management
- Efficient re-rendering with React hooks
- Lazy loading ready for future code splitting
- Minimal bundle size with tree shaking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

**Note**: This is the initial implementation matching the provided design specifications. The application is ready for additional features and screens as needed.