import { Editor } from 'grapesjs';

export const colorOptions = [
    { id: '#2196F3', name: 'Blue' },
    { id: '#4CAF50', name: 'Green' },
    { id: '#FFC107', name: 'Amber' },
    { id: '#F44336', name: 'Red' },
    { id: '#9C27B0', name: 'Purple' },
    { id: '#FF9800', name: 'Orange' },
    { id: '#607D8B', name: 'Blue Grey' },
    { id: '#795548', name: 'Brown' },
    { id: '#009688', name: 'Teal' },
]

export function hexToFlutterColor(hexColor: string): string {
    const colorMap = {
        '#2196F3': 'Colors.blue',
        '#4CAF50': 'Colors.green',
        '#FFC107': 'Colors.amber',
        '#F44336': 'Colors.red',
        '#9C27B0': 'Colors.purple',
        '#FF9800': 'Colors.orange',
        '#607D8B': 'Colors.blueGrey',
        '#795548': 'Colors.brown',
        '#009688': 'Colors.teal',
    }

    return colorMap[hexColor] || `Color(0xFF${hexColor.substring(1)})`;
}

export function getPagesAsOptions(editor: Editor){
    const pages = editor.Pages.getAll();
    return [
        {id: '', name: 'None'},
        ...pages.map(page => ({
            id: `gjs-page://${page.get('id')}`,
            name: page.get('name')
        }))
    ]
}

export function generateFlutterMetadata(metadata: Record<string, any>): string {
    return `
    <!-- flutter-metadata: 
        ${JSON.stringify(metadata, null, 2)}
    -->
    `;
}

export function createPageLinkTraits(editor:Editor, count: number){
    const traits = [];

    for (let i = 1; i <= count; i++) {
        traits.push({
            type: 'select',
            name: `page${i}`,
            label: `Page ${i} Link`,
            options: () => getPagesAsOptions(editor)
        });
        
        traits.push({
            type: 'text',
            name: `item${i}Label`,
            label: `Item ${i} Label`,
            default: `Item ${i}`
        });
    }
    
    return traits;
}