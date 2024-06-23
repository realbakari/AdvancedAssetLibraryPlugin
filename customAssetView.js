import * as Ui from 'LensStudio:Ui';

export class CustomAssetView {
    constructor(model, assetLibraryProvider) {
        this.model = model;
        this.assetLibraryProvider = assetLibraryProvider;
    }

    show() {
        const dialog = this.gui.createDialog("Custom Asset View");
        const layout = Ui.Layout.create(dialog);
        layout.setOrientation(Ui.Layout.Orientation.Vertical);

        const assetList = Ui.ListView.create(layout);
        this.populateAssetList(assetList);

        dialog.show();
    }

    populateAssetList(listView) {
        const assets = this.model.project.assetManager.assets;
        assets.forEach(asset => {
            const item = Ui.ListViewItem.create();
            const itemLayout = Ui.Layout.create(item);
            itemLayout.setOrientation(Ui.Layout.Orientation.Horizontal);

            const nameLabel = Ui.Label.create(itemLayout);
            nameLabel.setText(asset.name);

            const typeLabel = Ui.Label.create(itemLayout);
            typeLabel.setText(asset.type);

            const tagsLabel = Ui.Label.create(itemLayout);
            const tags = asset.customMetadata?.tags || [];
            tagsLabel.setText(`Tags: ${tags.join(', ')}`);

            listView.addItem(item);
        });
    }
}