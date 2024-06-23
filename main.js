import PanelPlugin from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import { AssetAPI } from './assetApi.js';
import { AssetTagger } from './assetTagger.js';
import { CustomAssetView } from './customAssetView.js';

export class AdvancedAssetLibraryPlugin extends PanelPlugin {
    static descriptor() {
        return {
            id: 'com.example.advancedassetlibrary',
            interfaces: PanelPlugin.descriptor().interfaces,
            name: 'Advanced Asset Library',
            icon: Editor.Icon.fromFile(import.meta.resolve('./icon.svg')),
            description: 'Enhanced asset management with external API integration and custom tagging',
            dependencies: [Ui.IGui, Editor.Model.IModel, 'LensStudio:AssetLibrary.IAssetLibraryProvider']
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        this.gui = pluginSystem.findInterface(Ui.IGui);
        this.model = pluginSystem.findInterface(Editor.Model.IModel);
        this.assetLibraryProvider = pluginSystem.findInterface('LensStudio:AssetLibrary.IAssetLibraryProvider');
        this.assetApi = new AssetAPI();
        this.assetTagger = new AssetTagger(this.model);
        this.customAssetView = new CustomAssetView(this.model, this.assetLibraryProvider);
    }

    createWidget(parentWidget) {
        const widget = Ui.Widget.create(parentWidget);
        const layout = Ui.Layout.create(widget);
        layout.setOrientation(Ui.Layout.Orientation.Vertical);
        layout.setSpacing(10);

        // Search bar for external API
        const searchBar = Ui.LineEdit.create(layout);
        searchBar.setPlaceholderText("Search external assets...");
        searchBar.setOnTextChanged(async (text) => {
            const results = await this.assetApi.searchAssets(text);
            this.updateSearchResults(results);
        });

        // Search results container
        this.searchResultsContainer = Ui.Widget.create(layout);

        // Asset tagging section
        const tagButton = Ui.Button.create(layout);
        tagButton.setText("Tag Selected Asset");
        tagButton.setOnClicked(() => {
            const selectedAsset = this.model.project.assetManager.getSelectedAsset();
            if (selectedAsset) {
                this.showTagDialog(selectedAsset);
            } else {
                this.gui.showMessageBox("No asset selected", "Please select an asset to tag.");
            }
        });

        // Custom asset view
        const customViewButton = Ui.Button.create(layout);
        customViewButton.setText("Open Custom Asset View");
        customViewButton.setOnClicked(() => {
            this.customAssetView.show();
        });

        return widget;
    }

    updateSearchResults(results) {
        this.searchResultsContainer.clear();
        results.forEach(asset => {
            const assetWidget = Ui.Widget.create(this.searchResultsContainer);
            const assetLayout = Ui.Layout.create(assetWidget);
            assetLayout.setOrientation(Ui.Layout.Orientation.Horizontal);

            const thumbnail = Ui.Image.create(assetLayout);
            thumbnail.setImage(asset.thumbnailUrl);

            const nameLabel = Ui.Label.create(assetLayout);
            nameLabel.setText(asset.name);

            const importButton = Ui.Button.create(assetLayout);
            importButton.setText("Import");
            importButton.setOnClicked(async () => {
                await this.assetApi.importAsset(asset, this.model.project.assetManager);
                this.gui.showMessageBox("Asset Imported", `${asset.name} has been imported successfully.`);
            });
        });
    }

    showTagDialog(asset) {
        const dialog = this.gui.createDialog("Tag Asset");
        const layout = Ui.Layout.create(dialog);
        layout.setOrientation(Ui.Layout.Orientation.Vertical);

        const tagInput = Ui.LineEdit.create(layout);
        tagInput.setPlaceholderText("Enter tags (comma-separated)");

        const confirmButton = Ui.Button.create(layout);
        confirmButton.setText("Apply Tags");
        confirmButton.setOnClicked(() => {
            const tags = tagInput.text().split(',').map(tag => tag.trim());
            this.assetTagger.tagAsset(asset, tags);
            dialog.close();
            this.gui.showMessageBox("Tags Applied", `Tags applied to ${asset.name}`);
        });

        dialog.show();
    }
}