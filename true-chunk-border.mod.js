/**
 * ==== CHANGELOG ====
 * 1.0.0: Initial release
 */

const $ = shapez;

const METADATA = {
    website: "https://shapez.mod.io/true-chunk-borders",
    author: "SkimnerPhi",
    name: "True Chunk Borders",
    version: "1.0.0",
    id: "true-chunk-border",
    description: "Changes the Show Chunk Borders setting so it uses distinct borders instead of filling tiles.",
    minimumGameVersion: ">=1.5.0",
    modId: "1885731",
    doesNotAffectSavegame: true,
};

class Mod extends $.Mod {
    init() {
        this.signals.gameInitialized.add(root => {
            // Background canvas
            const dims = $.globalConfig.tileSize;
            const dpi = root.map.backgroundCacheDPI;
            const [canvas, context] = $.makeOffscreenBuffer(16 * dims * dpi, 16 * dims * dpi, {
                smooth: false,
                label: "map-cached-bg",
            });
            context.scale(dpi, dpi);

            context.fillStyle = $.THEME.map.background;
            context.fillRect(0, 0, 16 * dims, 16 * dims);

            const borderWidth = $.THEME.map.gridLineWidth;
            context.fillStyle = $.THEME.map.grid;
            for (let i = 0; i < 17; ++i) {
                context.fillRect(i * dims - borderWidth, 0, borderWidth * 2, 16 * dims);
                
                for (let j = 0; j < 17; ++j) {
                    context.fillRect(j * dims + borderWidth, i * dims - borderWidth, dims - 2 * borderWidth, borderWidth * 2);
                }
            }
            
            context.fillRect(0, 0, borderWidth * 2, 16 * dims);
            context.fillRect(0, 0, 16 * dims, borderWidth * 2);
            
            context.fillRect(16 * dims - borderWidth * 2, 0, borderWidth * 2, 16 * dims);
            context.fillRect(0, 16 * dims - borderWidth * 2, 16 * dims, borderWidth * 2);
            
            root.map.cachedBackgroundCanvasShowBorders = canvas;
            root.map.cachedBackgroundContextShowBorders = context;
        });
        
        this.modInterface.replaceMethod($.MapResourcesSystem, "generateChunkBackground", 
            function ($old, [chunk, canvas, context, w, h, dpi]) {
                if (this.root.app.settings.getAllSettings().disableTileGrid) {
                    // The map doesn't draw a background, so we have to
                    context.fillStyle = THEME.map.background;
                    context.fillRect(0, 0, w, h);
                } else {
                    context.clearRect(0, 0, w, h);
                }

                context.globalAlpha = 0.5;
                const layer = chunk.lowerLayer;
                for (let x = 0; x < $.globalConfig.mapChunkSize; ++x) {
                    const row = layer[x];
                    for (let y = 0; y < $.globalConfig.mapChunkSize; ++y) {
                        const item = row[y];
                        if (item) {
                            context.fillStyle = item.getBackgroundColorAsResource();
                            context.fillRect(x, y, 1, 1);
                        }
                    }
                }
            }
        );
        
        this.modInterface.replaceMethod($.MapView, "drawBackground",
            function ($old, [parameters]) {
                // Render tile grid
                if (!this.root.app.settings.getAllSettings().disableTileGrid || !this.root.gameMode.hasResources()) {
                    const dpi = this.backgroundCacheDPI;
                    parameters.context.scale(1 / dpi, 1 / dpi);
                    
                    if (this.root.app.settings.getAllSettings().displayChunkBorders) {
                        parameters.context.fillStyle = parameters.context.createPattern(
                          this.cachedBackgroundCanvasShowBorders,
                          "repeat"
                      );
                      parameters.context.fillRect(
                          parameters.visibleRect.x * dpi,
                          parameters.visibleRect.y * dpi,
                          parameters.visibleRect.w * dpi,
                          parameters.visibleRect.h * dpi
                      );
                    } else {
                      parameters.context.fillStyle = parameters.context.createPattern(
                          this.cachedBackgroundCanvas,
                          "repeat"
                      );
                      parameters.context.fillRect(
                          parameters.visibleRect.x * dpi,
                          parameters.visibleRect.y * dpi,
                          parameters.visibleRect.w * dpi,
                          parameters.visibleRect.h * dpi
                      );
                    }
                    
                    parameters.context.scale(dpi, dpi);
                }

                this.drawVisibleChunks(parameters, $.MapChunkView.prototype.drawBackgroundLayer);
            }
        );
    }
}