import { Editor } from 'grapesjs';
import { FLUTTER_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Bottom Navigation Bar widget
 * @param editor - The GrapesJS editor instance
 */
export function registerBottomNav(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Bottom Navigation Bar component
  domComponents.addType('flutter-bottomnav', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-bottomnav',
          'data-flutter-widget': 'BottomNavigationBar',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 100%; height: 56px; background-color: white; box-shadow: 0 -1px 3px rgba(0,0,0,0.12); display: flex; justify-content: space-around; align-items: center; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "currentIndex": 0,
                 "backgroundColor": "#FFFFFF",
                 "selectedItemColor": "#2196F3",
                 "unselectedItemColor": "#9E9E9E",
                 "showUnselectedLabels": true
               }'>
            <div style="display: flex; flex-direction: column; align-items: center; padding: 6px 12px;" data-flutter-item="0" data-flutter-selected="true">
              <svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24" data-flutter-icon="Icons.home">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <div style="font-size: 12px; margin-top: 4px; color: #2196F3;">Home</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; padding: 6px 12px;" data-flutter-item="1">
              <svg viewBox="0 0 24 24" fill="#9E9E9E" width="24" height="24" data-flutter-icon="Icons.search">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <div style="font-size: 12px; margin-top: 4px; color: #9E9E9E;">Search</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; padding: 6px 12px;" data-flutter-item="2">
              <svg viewBox="0 0 24 24" fill="#9E9E9E" width="24" height="24" data-flutter-icon="Icons.favorite">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <div style="font-size: 12px; margin-top: 4px; color: #9E9E9E;">Favorites</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; padding: 6px 12px;" data-flutter-item="3">
              <svg viewBox="0 0 24 24" fill="#9E9E9E" width="24" height="24" data-flutter-icon="Icons.person">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <div style="font-size: 12px; margin-top: 4px; color: #9E9E9E;">Profile</div>
            </div>
            ${generateFlutterMetadata({
              widget: "BottomNavigationBar",
              properties: {
                currentIndex: 0,
                items: [
                  "BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home')",
                  "BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search')",
                  "BottomNavigationBarItem(icon: Icon(Icons.favorite), label: 'Favorites')",
                  "BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile')"
                ],
                selectedItemColor: "Colors.blue",
                unselectedItemColor: "Colors.grey",
                showUnselectedLabels: true
              }
            })}
          </div>
        `,
        traits: [
          {
            type: 'number',
            name: 'items',
            label: 'Items Count',
            default: 4,
            min: 2,
            max: 5
          },
          {
            type: 'select',
            name: 'activeColor',
            label: 'Active Color',
            options: colorOptions
          },
          {
            type: 'select',
            name: 'currentIndex',
            label: 'Selected Item',
            options: [
              { id: '0', name: 'Item 1' },
              { id: '1', name: 'Item 2' },
              { id: '2', name: 'Item 3' },
              { id: '3', name: 'Item 4' },
              { id: '4', name: 'Item 5' }
            ]
          },
          {
            type: 'checkbox',
            name: 'showLabels',
            label: 'Show Labels',
            default: true
          }
        ]
      },
      
      /**
       * Initialize the component
       */
      init() {
        this.on('change:traits', this.updateNavBarStyle);
      },
      
      /**
       * Update the BottomNavigationBar style based on trait changes
       */
      updateNavBarStyle() {
        const itemsCount = this.getTrait('items')?.get('value') || 4;
        const activeColor = this.getTrait('activeColor')?.get('value') || '#2196F3';
        const currentIndex = parseInt(this.getTrait('currentIndex')?.get('value') || '0');
        const showLabels = this.getTrait('showLabels')?.get('value') || true;
        
        // Get the NavBar element
        const navBarEl = this.components().first();
        
        if (navBarEl) {
          const navItems = navBarEl.find('[data-flutter-item]');
          
          // Update each navigation item
          navItems.forEach((item, index) => {
            // Show/hide based on items count
            if (index < itemsCount) {
              item.setStyle({ display: 'flex' });
              
              // Update selected state
              const isSelected = (index === currentIndex);
              item.set('attributes', {
                ...item.get('attributes'),
                'data-flutter-selected': isSelected
              });
              
              // Update icon color
              const iconEl = item.find('svg')[0];
              if (iconEl) {
                iconEl.setStyle({ fill: isSelected ? activeColor : '#9E9E9E' });
              }
              
              // Update label color and visibility
              const labelEl = item.find('div')[0];
              if (labelEl) {
                labelEl.setStyle({
                  color: isSelected ? activeColor : '#9E9E9E',
                  display: showLabels ? 'block' : (isSelected ? 'block' : 'none')
                });
              }
            } else {
              item.setStyle({ display: 'none' });
            }
          });
          
          // Update Flutter metadata
          const flutterProps = {
            currentIndex,
            backgroundColor: '#FFFFFF',
            selectedItemColor: activeColor,
            unselectedItemColor: '#9E9E9E',
            showUnselectedLabels: showLabels
          };
          
          navBarEl.set('attributes', {
            ...navBarEl.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });
  
  // Register the block
  blockManager.add('flutter-bottomnav-block', {
    label: 'BottomNavigationBar',
    category: FLUTTER_CATEGORY,
    content: { type: 'flutter-bottomnav' },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
      <path d="M20 18H4V6h16v12z" fill="none" stroke="#2196F3" stroke-width="2"/>
      <path d="M4 16h16v2H4z"/>
    </svg>`
  });
}
