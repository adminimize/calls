declare module 'trix' {
    interface TrixEditor extends HTMLElement {
        editor: {
            loadHTML(html: string): void;
            getDocument(): {
                toString(): string;
            };
            activateAttribute(attribute: string): void;
            deactivateAttribute(attribute: string): void;
            attributeIsActive(attribute: string): boolean;
            undo(): void;
            redo(): void;
        };
    }
}

declare global {
    interface Window {
        Trix: {
            Editor: {
                prototype: {
                    initialize(): void;
                };
            };
        };
    }
} 