import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Slider component
 * @param editor - The GrapesJS editor instance
 */
export function registerSlider(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Slider component
  domComponents.addType('flutter-slider', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-slider',
          'data-flutter-widget': 'Slider',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 300px; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "value": 0.5,
                 "min": 0,
                 "max": 100,
                 "divisions": 10,
                 "activeColor": "#2196F3",
                 "inactiveColor": "#E0E0E0"
               }'>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <div style="font-size: 12px; color: #666;" data-flutter-prop="label">Slider Value: 50</div>
              <div style="font-size: 12px; color: #666;" data-flutter-prop="valueLabel">50</div>
            </div>
            <div style="position: relative; height: 20px;" data-flutter-prop="sliderContainer">
              <div style="position: absolute; left: 0; top: 9px; right: 0; height: 2px; background-color: #E0E0E0;" data-flutter-prop="track"></div>
              <div style="position: absolute; left: 0; top: 9px; width: 50%; height: 2px; background-color: #2196F3;" data-flutter-prop="trackActive"></div>
              <div style="position: absolute; left: calc(50% - 10px); top: 0; width: 20px; height: 20px; border-radius: 50%; background-color: #2196F3; cursor: pointer;" data-flutter-prop="thumb"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
              <div style="font-size: 10px; color: #999;" data-flutter-prop="minLabel">0</div>
              <div style="font-size: 10px; color: #999;" data-flutter-prop="maxLabel">100</div>
            </div>
          </div>
          ${generateFlutterMetadata({
            widget: "Column",
            properties: {
              children: "[Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Slider Value:'), Text('50')]), Slider(value: 0.5, min: 0, max: 100, divisions: 10, onChanged: (value) {})]"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label',
            default: 'Slider Value:'
          },
          {
            type: 'number',
            name: 'value',
            label: 'Current Value',
            default: 50
          },
          {
            type: 'number',
            name: 'min',
            label: 'Min Value',
            default: 0
          },
          {
            type: 'number',
            name: 'max',
            label: 'Max Value',
            default: 100
          },
          {
            type: 'number',
            name: 'divisions',
            label: 'Divisions',
            default: 10
          },
          {
            type: 'select',
            name: 'activeColor',
            label: 'Active Color',
            options: colorOptions
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateSliderStyle);
      },

      updateSliderStyle() {
        const label = this.getTrait('label')?.get('value') || 'Slider Value:';
        const value = this.getTrait('value')?.get('value') || 50;
        const min = this.getTrait('min')?.get('value') || 0;
        const max = this.getTrait('max')?.get('value') || 100;
        const divisions = this.getTrait('divisions')?.get('value') || 10;
        const activeColor = this.getTrait('activeColor')?.get('value') || '#2196F3';

        const container = this.components().first();
        
        if (container) {
          // Calculate percentage for slider position
          const range = max - min;
          const percentage = ((value - min) / range) * 100;

          // Update elements
          const labelEl = container.find('[data-flutter-prop="label"]')[0];
          const valueLabelEl = container.find('[data-flutter-prop="valueLabel"]')[0];
          const trackActiveEl = container.find('[data-flutter-prop="trackActive"]')[0];
          const thumbEl = container.find('[data-flutter-prop="thumb"]')[0];
          const minLabelEl = container.find('[data-flutter-prop="minLabel"]')[0];
          const maxLabelEl = container.find('[data-flutter-prop="maxLabel"]')[0];

          if (labelEl) {
            labelEl.components().reset(`${label}`);
          }

          if (valueLabelEl) {
            valueLabelEl.components().reset(`${value}`);
          }

          if (trackActiveEl) {
            trackActiveEl.setStyle({
              width: `${percentage}%`,
              'background-color': activeColor
            });
          }

          if (thumbEl) {
            thumbEl.setStyle({
              left: `calc(${percentage}% - 10px)`,
              'background-color': activeColor
            });
          }

          if (minLabelEl) {
            minLabelEl.components().reset(`${min}`);
          }

          if (maxLabelEl) {
            maxLabelEl.components().reset(`${max}`);
          }

          // Update Flutter props
          const normalizedValue = (value - min) / (max - min); // Value between 0-1 for Flutter
          const flutterProps = {
            value: normalizedValue,
            min,
            max,
            divisions,
            activeColor
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the Slider block
  blockManager.add('flutter-slider', {
    label: 'Slider',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-slider'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M18 4H6C4.9 4 4 4.9 4 6v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/>
              <path d="M8 12h8v2H8z"/>
              <circle cx="12" cy="13" r="2"/>
            </svg>`
  });
}
