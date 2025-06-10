import { Editor } from "@grapesjs/studio-sdk-plugins/dist/types.js";
import { FLUTTER_CATEGORY } from "../utils/constants";
import { colorOptions } from "../utils/helpers";


export function registerContainer(editor: Editor): void {
    const domComponents = editor.DomComponents;
    const blockManager = editor.Blocks;

    // Define the Container component
    domComponents.addType('flutter-container', {
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 
                    class: 'flutter-container',
                    'data-flutter-widget': 'Container',
                    'data-flutter-package': 'material',
                },
                components: `
                    <div style="width: 300px; height: 200px; background-color: #2196F3; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; margin: 15px;"
                        data-flutter-props='{
                            "width": 300,
                            "height": 200,
                            "color": "#2196F3",
                            "borderRadius": 8,
                            "margin": 15
                        }'>
                        <div style="color: white; font-family: 'Roboto', sans-serif; font-size: 18px; font-weight: 500;">Container</div>
                    </div>
                `,
                traits: [
                    {
                        type: 'select',
                        name: 'color',
                        label: 'Color',
                        options: colorOptions
                    },
                    {
                        type: 'number',
                        name: 'width',
                        label: 'Width',
                        default: 300
                    },
                    {
                        type: 'number',
                        name: 'height',
                        label: 'Height',
                        default: 200
                    },
                    {
                        type: 'number',
                        name: 'borderRadius',
                        label: 'Border Radius',
                        default: 8
                    },
                    {
                        type: 'select',
                        name: 'responsiveWidth',
                        label: 'Responsive Width',
                        options: [
                            { id: 'fixed', name: 'Fixed Width' },
                            { id: 'full', name: 'Full Width' },
                            { id: 'auto', name: 'Auto Width' },
                        ]
                    }
                ]
            },
            init(){
                this.on('change:traits', this.updateContainerStyle);
            },

            updateContainerStyle(){
                const color = this.getTrait('color')?.get('value') || '#2196F3';
                const width = this.getTrait('width')?.get('value') || 300;
                const height = this.getTrait('height')?.get('value') || 200;
                const borderRadius = this.getTrait('borderRadius')?.get('value') || 8;
                const responsiveWidth = this.getTrait('responsiveWidth')?.get('value') || 'fixed';

                const containerEl = this.components().first();

                if (containerEl) {
                    const styles = {
                        'background-color': color,
                        'border-radius': `${borderRadius}px`,
                    };

                    if(responsiveWidth === 'fixed') {
                        styles['width'] = `${width}px`;
                    }else if(responsiveWidth === 'full') {
                        styles['width'] = '100%';
                    } else {
                        styles['width'] = 'auto';
                    }

                    styles['height'] = `${height}px`;

                    containerEl.setStyle(styles);

                    const flutterProps = {
                        width: responsiveWidth === 'fixed' ? width : responsiveWidth === 'full' ? 'double.infinity' : 'null',
                        height,
                        color,
                        borderRadius,
                    };

                    containerEl.set('attributes', {
                        ...containerEl.get('attributes'),
                        'data-flutter-props': JSON.stringify(flutterProps)
                    });
                }
            }
        }   
    });

    blockManager.add('flutter-container', {
        label: 'Container',
        category: FLUTTER_CATEGORY,
        content: {
            type: 'flutter-container'
        },
        media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
                </svg>`
    });
}