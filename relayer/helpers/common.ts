import { Metadata } from './types';

async function extractMetadata(token_uri: string): Promise<Metadata> {
    let metadata: Metadata;

    // Check if token_uri is a valid URL
    const isUrl = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };

    if (isUrl(token_uri)) {
        // Fetch the JSON data from the URL
        const response = await fetch(token_uri);
        if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        metadata = await response.json();
    } else {
        // Assume token_uri is a JSON string and parse it
        metadata = JSON.parse(token_uri);
    }

    return metadata;
}

export {
    extractMetadata
};