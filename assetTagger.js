export class AssetTagger {
    constructor(model) {
        this.model = model;
    }

    tagAsset(asset, tags) {
        // Assuming there's a custom metadata field for tags
        if (!asset.customMetadata) {
            asset.customMetadata = {};
        }
        asset.customMetadata.tags = tags;
        this.model.project.assetManager.updateAsset(asset);
    }

    getAssetTags(asset) {
        return asset.customMetadata?.tags || [];
    }
}