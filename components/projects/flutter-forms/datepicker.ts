import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter DatePicker component
 * @param editor - The GrapesJS editor instance
 */
export function registerDatePicker(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the DatePicker component
  domComponents.addType('flutter-datepicker', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-datepicker',
          'data-flutter-widget': 'DatePicker',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 300px; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "initialDate": "2023-06-01",
                 "firstDate": "2020-01-01",
                 "lastDate": "2025-12-31"
               }'>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;" data-flutter-prop="label">Select Date</div>
            <div style="border: 1px solid #ccc; border-radius: 4px; padding: 12px; position: relative; background-color: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-flutter-prop="input">
              <div data-flutter-prop="value">June 1, 2023</div>
              <svg viewBox="0 0 24 24" fill="#666" width="18" height="18">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
            </div>
          </div>
          ${generateFlutterMetadata({
            widget: "Column",
            properties: {
              children: "[Text('Select Date'), InkWell(onTap: () {}, child: InputDecorator(decoration: InputDecoration(border: OutlineInputBorder()), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('June 1, 2023'), Icon(Icons.calendar_today)])))]"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label Text',
            default: 'Select Date'
          },
          {
            type: 'date',
            name: 'initialDate',
            label: 'Initial Date',
            default: '2023-06-01'
          },
          {
            type: 'date',
            name: 'firstDate',
            label: 'First Date',
            default: '2020-01-01'
          },
          {
            type: 'date',
            name: 'lastDate',
            label: 'Last Date',
            default: '2025-12-31'
          },
          {
            type: 'text',
            name: 'format',
            label: 'Display Format',
            default: 'MMMM d, yyyy'
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateDatePickerStyle);
      },

      updateDatePickerStyle() {
        const label = this.getTrait('label')?.get('value') || 'Select Date';
        const initialDate = this.getTrait('initialDate')?.get('value') || '2023-06-01';
        const firstDate = this.getTrait('firstDate')?.get('value') || '2020-01-01';
        const lastDate = this.getTrait('lastDate')?.get('value') || '2025-12-31';
        const format = this.getTrait('format')?.get('value') || 'MMMM d, yyyy';

        const container = this.components().first();
        
        if (container) {
          const labelEl = container.find('[data-flutter-prop="label"]')[0];
          const valueEl = container.find('[data-flutter-prop="value"]')[0];

          if (labelEl) {
            labelEl.components().reset(label);
          }

          // Format the date according to the specified format
          // This is a simple implementation and would need a date formatting library for full support
          if (valueEl && initialDate) {
            try {
              const date = new Date(initialDate);
              const options: Intl.DateTimeFormatOptions = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              };
              const formattedDate = date.toLocaleDateString('en-US', options);
              valueEl.components().reset(formattedDate);
            } catch (e) {
              valueEl.components().reset(initialDate);
            }
          }

          // Update Flutter props
          const flutterProps = {
            initialDate,
            firstDate,
            lastDate,
            format
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the DatePicker block
  blockManager.add('flutter-datepicker', {
    label: 'Date Picker',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-datepicker'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>`
  });
}
