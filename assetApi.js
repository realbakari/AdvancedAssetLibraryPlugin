import Network from 'LensStudio:Network';

export class AssetAPI {
    constructor() {
        this.apiUrl = 'https://api.example.com/assets'; // Replace with actual API URL
    }

    async searchAssets(query) {
        const response = await Network.fetch(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
        return await response.json();
    }

    async importAsset(asset, assetManager) {
        const response = await Network.fetch(asset.downloadUrl);
        const blob = await response.blob();
        const file = new File([blob], asset.name);
        await assetManager.importExternalFileAsync(file, '', Editor.Model.ResultType.Packed);
    }
}