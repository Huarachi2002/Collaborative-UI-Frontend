import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Switch component
 * @param editor - The GrapesJS editor instance
 */
export function registerSwitch(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Switch component
  domComponents.addType('flutter-switch', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-switch',
          'data-flutter-widget': 'Switch',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="display: flex; align-items: center; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "value": true,
                 "activeColor": "#2196F3",
                 "inactiveColor": "#D6D6D6"
               }'>
            <div style="width: 50px; height: 30px; border-radius: 15px; background-color: #2196F3; position: relative; margin-right: 10px; cursor: pointer;" data-flutter-prop="switch">
              <div style="width: 26px; height: 26px; border-radius: 13px; background-color: white; position: absolute; top: 2px; left: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>
            </div>
            <div style="font-size: 14px;" data-flutter-prop="label">Enable feature</div>
          </div>
          ${generateFlutterMetadata({
            widget: "Row",
            properties: {
              children: "[Switch(value: true, onChanged: (value) {}), SizedBox(width: 10), Text('Enable feature')]"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label',
            default: 'Enable feature'
          },
          {
            type: 'checkbox',
            name: 'value',
            label: 'Enabled',
            default: true
          },
          {
            type: 'select',
            name: 'activeColor',
            label: 'Active Color',
            options: colorOptions
          },
          {
            type: 'select',
            name: 'inactiveColor',
            label: 'Inactive Color',
            options: [
              { id: '#D6D6D6', name: 'Light Grey' },
              { id: '#BDBDBD', name: 'Grey' },
              { id: '#9E9E9E', name: 'Dark Grey' }
            ]
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateSwitchStyle);
      },

      updateSwitchStyle() {
        const label = this.getTrait('label')?.get('value') || 'Enable feature';
        const value = this.getTrait('value')?.get('value') || false;
        const activeColor = this.getTrait('activeColor')?.get('value') || '#2196F3';
        const inactiveColor = this.getTrait('inactiveColor')?.get('value') || '#D6D6D6';

        const container = this.components().first();

        if (container) {
          const labelEl = container.find('[data-flutter-prop="label"]')[0];
          const switchEl = container.find('[data-flutter-prop="switch"]')[0];

          if (labelEl) {
            labelEl.components().reset(label);
          }

          if (switchEl) {
            // Update switch appearance based on value
            switchEl.setStyle({
              'background-color': value ? activeColor : inactiveColor
            });

            const knob = switchEl.components().first();
            if (knob) {
              knob.setStyle({
                left: value ? '22px' : '2px'
              });
            }
          }

          // Update Flutter props
          const flutterProps = {
            value,
            activeColor,
            inactiveColor,
            label
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the Switch block
  blockManager.add('flutter-switch', {
    label: 'Switch',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-switch'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>`
  });
}
