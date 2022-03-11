/**
 * ===== CHANGELOG =====
 * 1.1.9
 *   Increase compatibility with other mods that may use the Wires+ unmixing system
 *   Fix bug where Uncolored mixed with a tertiary color would result in White
 * 1.1.8
 *   Fixed forgotten research shape (see 1.1.6)
 * 1.1.7
 *   Fixed bug where SI levels wouldn't appear and instead repeat past levels
 * 1.1.6
 *   Removed modified research shapez from levels: no way to change research shapez requirements
 * 1.1.5
 *   Fixed bug where logo upgrade was wrong colors
 *   Add support for Skrip update checker
 *   Add support for Wires+ color subtractor
 * 1.1.4
 *   Fixed bug where vanilla freeplay shapez used old generation
 * 1.1.3
 *   Added backwards compatibility for old LoC+SI saves
 *   Fixed bug where displays would crash the game when trying to show new colors
 *   Fixed bug where Green + Cyan did not result in Mint
 * 1.1.2
 *   Shape definition patches are made based on if SI is installed or not
 *   Patch some SI levels and upgrades to use new colors
 *   Black and Ghost only appear if SI is not installed
 *   Fixed certain mixing recipes not having a reverse lookup
 *   Added new freeplay generation if SI is not installed
 * 1.1.1
 *   Adjusted new colors to mesh with vanilla colors
 *   Adjusted new color icons to mesh with vanilla colors
 *   Added friendly names
 * 1.1.0: Shapez Industries compatibility
 *   Major refactoring
 *   Added new colors to displays
 *   Modified mixing rules
 */

const $ = shapez;

const METADATA = {
    website: "https://shapez.mod.io/lots-of-colors",
    author: "83ben38 + SkimnerPhi",
    name: "Lots of Colors",
    version: "v1.1.9",
    id: "colors",
    description: "Adds tertiary colors including orange and pink, as well as black and an invisible color. Fully compatible with Shapez Industries.",
    minimumGameVersion: ">=1.5.0",
    modId: "1839449",
};

const tertiaryColors = {
    orange: "orange",
    light_green: "light_green",
    mint: "mint",
    light_blue: "light_blue",
    dark_purple: "dark_purple",
    pink: "pink",
};
const specialColors = {
    black: "black",
    ghost: "ghost",
}

const $c = $.enumColors;

Object.assign($c, tertiaryColors);
Object.assign($c, specialColors);
Object.assign($.enumColorToShortcode, {
    [$c.orange]: "o",
    [$c.light_green]: "l",
    [$c.mint]: "m",
    [$c.light_blue]: "h",
    [$c.dark_purple]: "z",
    [$c.pink]: "i",
    [$c.black]: "k",
    [$c.ghost]: "s",
});
Object.assign($.enumColorsToHexCode, {
    [$c.orange]: "#fdad4a",
    [$c.light_green]: "#bafa48",
    [$c.mint]: "#3cfdb2",
    [$c.light_blue]: "#33d1ff",
    [$c.dark_purple]: "#a186ff",
    [$c.pink]: "#ee66b4",
    [$c.black]: "#202020",
    [$c.ghost]: "rgba(0, 0, 0, 0)",
});
Object.assign($.T.ingame.colors, {
    [$c.orange]: "Orange",
    [$c.light_green]: "Light Green",
    [$c.mint]: "Mint",
    [$c.light_blue]: "Light Blue",
    [$c.dark_purple]: "Dark Purple",
    [$c.pink]: "Pink",
    [$c.black]: "Black",
    [$c.ghost]: "Ghost",
});
// This is read by Wires+ color subtractors for results that cannot otherwise be inferred
const enumSpecialColorUnmixingResults = {
    [$c.orange]: {
        [$c.green]: $c.red,
    },
    [$c.light_green]: {
        [$c.red]: $c.green,
    },
    [$c.mint]: {
        [$c.blue]: $c.green,
    },
    [$c.light_blue]: {
        [$c.green]: $c.blue,
    },
    [$c.dark_purple]: {
        [$c.red]: $c.blue,
    },
    [$c.pink]: {
        [$c.blue]: $c.red,
    },
};
if (!$.enumSpecialColorUnmixingResults) {
    $.enumSpecialColorUnmixingResults = {};
}
Object.assign($.enumSpecialColorUnmixingResults, enumSpecialColorUnmixingResults);

for (const key in $.enumColorToShortcode) {
    $.enumShortcodeToColor[$.enumColorToShortcode[key]] = key;
}
for (const color in $c) {
    $.COLOR_ITEM_SINGLETONS[color] = new $.ColorItem(color);
}

function applyColors({ includeBlack = false, includeGhost = false}) {
    // References cannot be fully deleted for Black and Ghost for backwards compat reasons, so redirect them towards Uncolored to cleanse existing entities.
    if (!includeBlack) {
        $.enumShortcodeToColor[$.enumColorToShortcode[$c.black]] = $[$c.uncolored];
        // Kind of a hack, but the color needs to be able to be explicitly referenced while not being enumerable
        delete $.COLOR_ITEM_SINGLETONS[$c.black];
        Object.defineProperty($.COLOR_ITEM_SINGLETONS, $c.black, {
            configurable: true,
            get: () => $.COLOR_ITEM_SINGLETONS[$c.uncolored],
        });
        delete $.T.ingame.colors[$c.black];
        delete $.enumColorsToHexCode[$c.black];
        delete $.enumColorToShortcode[$c.black];
        delete $c[$c.black];
    }
    if (!includeGhost) {
        $.enumShortcodeToColor[$.enumColorToShortcode[$c.ghost]] = $[$c.uncolored];
        delete $.COLOR_ITEM_SINGLETONS[$c.ghost];
        Object.defineProperty($.COLOR_ITEM_SINGLETONS, $c.ghost, {
            configurable: true,
            get: () => $.COLOR_ITEM_SINGLETONS[$c.uncolored]
        });
        delete $.T.ingame.colors[$c.ghost];
        delete $.enumColorsToHexCode[$c.ghost];
        delete $.enumColorToShortcode[$c.ghost];
        delete $c[$c.ghost];
    }

    const $m = $.enumColorMixingResults;
    Object.assign($m, {
        [$c.orange]: {
            [$c.light_green]: $c.yellow,
        },
        [$c.light_green]: {
            // autofill
        },
        [$c.mint]: {
            [$c.light_blue]: $c.light_blue,
        },
        [$c.light_blue]: {
            // autofill
        },
        [$c.dark_purple]: {
            [$c.pink]: $c.pink,
        },
        [$c.pink]: {
            // autofill
        },
    });
    if (includeBlack) {
        $m[$c.black] = {};
    }
    if (includeGhost) {
        $m[$c.ghost] = {};
    }
    const mixingPatches = {
        [$c.red]: {
            [$c.yellow]: $c.orange,
            [$c.purple]: $c.pink,

            [$c.orange]: $c.orange,
            [$c.light_green]: $c.yellow,
            [$c.dark_purple]: $c.purple,
            [$c.pink]: $c.pink,
        },
        [$c.green]: {
            [$c.yellow]: $c.light_green,
            [$c.cyan]: $c.mint,

            [$c.orange]: $c.yellow,
            [$c.light_green]: $c.light_green,
            [$c.mint]: $c.mint,
            [$c.light_blue]: $c.cyan,
        },
        [$c.blue]: {
            [$c.purple]: $c.dark_purple,
            [$c.cyan]: $c.light_blue,

            [$c.mint]: $c.cyan,
            [$c.light_blue]: $c.light_blue,
            [$c.dark_purple]: $c.dark_purple,
            [$c.pink]: $c.purple,
        },

        [$c.yellow]: {
            [$c.orange]: $c.orange,
            [$c.light_green]: $c.light_green,
        },
        [$c.cyan]: {
            [$c.mint]: $c.mint,
            [$c.light_blue]: $c.light_blue,
        },
        [$c.purple]: {
            [$c.dark_purple]: $c.dark_purple,
            [$c.pink]: $c.pink,
        },
    }
    // Apply patches & reverses of patches
    // The reverse lookup generator may not copy the right recipe later,
    //   so we just assign both right now
    for(const inA in $c) {
        for(const inB in mixingPatches[inA]) {
            $m[inA][inB] = mixingPatches[inA][inB];
            $m[inB][inA] = mixingPatches[inA][inB];
        }
    }

    for(const color in $m) {
        // Any mixture involving tertiary colors not already defined is white
        for(const tertiary in tertiaryColors) {
            if(!$m[color][tertiary]) {
                $m[color][tertiary] = $c.white;
            }
        }
        // Any color with white is white
        $m[color][$c.white] = $c.white;
        // Any color with uncolored is itself
        $m[color][$c.uncolored] = color;
        $m[$c.uncolored][color] = color;
        
        if (includeBlack) {
            // Any color with itself is black
            $m[color][color] = $c.black;
            // Any color with black is black
            $m[color][$c.black] = $c.black;
        } else {
            // Any color with itself is itself
            $m[color][color] = color;
        }
        if (includeGhost) {
            // Any color with ghost is ghost
            $m[color][$c.ghost] = $c.ghost;
        }
    }
    // Define black + white mixtures last because otherwise it would be overwritten
    // The reverse lookup generator may not copy the right recipe later,
    //   so we just assign both right now
    if (includeGhost) {
        $m[$c.white][$c.black] = $c.ghost;
        $m[$c.black][$c.white] = $c.ghost;
    }
    // Regenerate reverse lookups
    for (const colorA in $m) {
        for (const colorB in $m[colorA]) {
            $m[colorB][colorA] = $m[colorA][colorB];
        }
    }
}

class Mod extends $.Mod {
    init() {
        for (const color in tertiaryColors) {
            this.modInterface.registerSprite(`sprites/colors/${color}.png`, RESOURCES[`${color}.png`]);
            this.modInterface.registerSprite(`sprites/wires/display/${color}.png`, RESOURCES[`display-${color}.png`]);
        }
        for (const color in specialColors) {
            this.modInterface.registerSprite(`sprites/colors/${color}.png`, RESOURCES[`${color}.png`]);
            this.modInterface.registerSprite(`sprites/wires/display/${color}.png`, RESOURCES[`display-${color}.png`]);
        }
        
        this.patchLevels();
        this.patchUpgrades();
        
        this.signals.gameInitialized.add(root => {
            const isIndustries = $.MODS.mods.some(m => m.metadata.id === "shapez-industries");
            if (isIndustries) {
                applyColors({});
            } else {
                this.patchVanillaFreeplay();
                applyColors({ includeBlack: true, includeGhost: true });
            }
        });
        // Return colors back to a point that allows the game to load. Doesn't need to have everything, just enough to get backwards compat again.
        this.signals.stateEntered.add(state => {
            const isIndustries = $.MODS.mods.some(m => m.metadata.id === "shapez-industries");
            if (isIndustries && state.key === "MainMenuState") {
                Object.assign($c, specialColors);
                Object.assign($.enumColorToShortcode, {
                    [$c.black]: "k",
                    [$c.ghost]: "s",
                })
                Object.assign($.enumShortcodeToColor, {
                    "k": $c.black,
                    "s": $c.ghost,
                })
                delete $.COLOR_ITEM_SINGLETONS[$c.black];
                delete $.COLOR_ITEM_SINGLETONS[$c.ghost];
                Object.assign($.COLOR_ITEM_SINGLETONS, {
                    [$c.black]: new $.ColorItem($c.black),
                    [$c.ghost]: new $.ColorItem($c.ghost),
                })
            }
        });
    }  
  
    patchLevels() {
        this.signals.modifyLevelDefinitions.add(definitions => {
            const isIndustries = $.MODS.mods.some(m => m.metadata.id === "shapez-industries");
            if (isIndustries) {
                definitions[7].shape = "RcRc----";
                //  8: n/c
                //  9: n/c
                // 10: n/c
                definitions[11].shape = "RyCoRyCo:SrCrSrCr";
                definitions[12].shape = "1c1c1o1o";
                // 13: n/c
                // 14: n/c
                // 15: n/c
                definitions[16].shape = "3o--3o--:3w3w3w3w:5o5o5o5o";
                // 17: n/c
                definitions[18].shape = "____--Cl:1m____--:5w5w5w5w";
                // 19: n/c
                // 20: n/c
                definitions[21].shape = "--Sb--Sb:--Sc--Sc:Ch--Ch--:--Sw--Sw";
                // 22: n/c
                definitions[23].shape = "2bR_Rb2_:Ch______:4w4w4w4w";
                definitions[24].shape = "4rRm4rRm:1w1r1w1r:Sm______";
                definitions[25].shape = "SoCy--Cl:--Cc--Ch:1z--Sp--:----1i--";
            } else {
                //  7: unlock mixers
                //  8: n/c
                //  9: n/c
                definitions[10].shape = "CmShShCm";
                // 11: n/c
                definitions[12].shape = "RiRiRiRi:CzCzCzCz";
                // 13: n/c
                // 14: n/c
                definitions[15].shape = "SrSrSrSr:CyCyCyCy:SiSiSiSi";
                definitions[16].shape = "CbRbRbCb:CmCmCmCm:WbWbWbWb";
                definitions[17].shape = "SgSg----:CgCgCgCg:----CkCk";
                definitions[18].shape = "--CiRiCi:ShShShSh";
                definitions[19].shape = "RkCw--Cw:----Rk--";
                definitions[20].shape = "CrCyCrCy:ClCrClCr:CrCgCrCg:CmCrCmCr";
                definitions[21].shape = "Cg----Cr:Ck----Ck:Sy------:Cy----Cy";
                definitions[22].shape = "CsSsCsSs:SyCcSyCc:CcSyCcSy";
                // 23: n/c
                definitions[24].shape = "Rg--Rg--:CoRoCoRo:--Rm--Rm";
                definitions[25].shape = "CbCsCbCs:Sr------:--CrSoCr:CwCwCwCw";
            }
        });
    }
    patchVanillaFreeplay() {
        this.modInterface.replaceMethod($.HubGoals, "generateRandomColorSet",
            function($old, [rng, allowUncolored = false, allowGhost = false]) {
                const offsetTypes = [
                    [0, 1, 2],
                    [0, 2, 4],
                    [0, 4, 8],
                ];
                const colorWheel = [
                    $c.red,
                    $c.orange,
                    $c.yellow,
                    $c.light_green,
                    $c.green,
                    $c.mint,
                    $c.cyan,
                    $c.light_blue,
                    $c.blue,
                    $c.dark_purple,
                    $c.purple,
                    $c.pink,
                ];
            
                const universalColors = [$c.white, $c.black];
                if (allowUncolored) {
                    universalColors.push($c.uncolored);
                }
                if (allowGhost) {
                    universalColors.push($c.ghost);
                }
                const type = rng.choice(offsetTypes);
                const index = rng.nextIntRange(0, colorWheel.length);
                const pickedColors = type.map(offset => colorWheel[(index + offset) % colorWheel.length]);
                pickedColors.push(rng.choice(universalColors));
                console.log(pickedColors);
                return pickedColors;
            }
        );
        this.modInterface.replaceMethod($.HubGoals, "computeFreeplayShape", function($old, [level]) {
            console.log(this);
            const layerCount = $.clamp(level / 25, 2, 4);

            let layers = [];

            const rng = new $.RandomNumberGenerator(this.root.map.seed + "/" + level);

            const colors = this.generateRandomColorSet(rng, level > 35, level > 100);

            let pickedSymmetry = null; // pairs of quadrants that must be the same
            let availableShapes = [$.enumSubShape.rect, $.enumSubShape.circle, $.enumSubShape.star];
            if (rng.next() < 0.5) {
                pickedSymmetry = [
                    // radial symmetry
                    [0, 2],
                    [1, 3],
                ];
                availableShapes.push($.enumSubShape.windmill); // windmill looks good only in radial symmetry
            } else {
                const symmetries = [
                    [
                        // horizontal axis
                        [0, 3],
                        [1, 2],
                    ],
                    [
                        // vertical axis
                        [0, 1],
                        [2, 3],
                    ],
                    [
                        // diagonal axis
                        [0, 2],
                        [1],
                        [3],
                    ],
                    [
                        // other diagonal axis
                        [1, 3],
                        [0],
                        [2],
                    ],
                ];
                pickedSymmetry = rng.choice(symmetries);
            }

            const randomColor = () => rng.choice(colors);
            const randomShape = () => rng.choice(availableShapes);

            let anyIsMissingTwo = false;

            for (let i = 0; i < layerCount; ++i) {
                const layer = [null, null, null, null];

                for (let j = 0; j < pickedSymmetry.length; ++j) {
                    const group = pickedSymmetry[j];
                    const shape = randomShape();
                    const color = randomColor();
                    for (let k = 0; k < group.length; ++k) {
                        const quad = group[k];
                        layer[quad] = {
                            subShape: shape,
                            color,
                        };
                    }
                }

                // Sometimes they actually are missing *two* ones!
                // Make sure at max only one layer is missing it though, otherwise we could
                // create an uncreateable shape
                if (level > 75 && rng.next() > 0.95 && !anyIsMissingTwo) {
                    layer[rng.nextIntRange(0, 4)] = null;
                    anyIsMissingTwo = true;
                }

                layers.push(layer);
            }

            const definition = new $.ShapeDefinition({ layers });
            return this.root.shapeDefinitionMgr.registerOrReturnHandle(definition);
        });
    }
    patchUpgrades() {
        const vanillaReplacements = {
            // T5 belt
            "SrSrSrSr:CyCyCyCy:SwSwSwSw": "SrSrSrSr:CyCyCyCy:SiSiSiSi",
            // T4 miner
            "CwCwCwCw:WbWbWbWb": "CmCmCmCm:WbWbWbWb",
            // T5 miner
            "CbRbRbCb:CwCwCwCw:WbWbWbWb": "CbRbRbCb:CmCmCmCm:WbWbWbWb",
            // T3 processors
            "CgScScCg": "CmShShCm",
            // T4 processors
            "CwCrCwCr:SgSgSgSg": "CoCrCoCr:SgSgSgSg",
            // T5 processors
            "WrRgWrRg:CwCrCwCr:SgSgSgSg": "WrRgWrRg:CoCrCoCr:SgSgSgSg",
            // T3 painting
            "RpRpRpRp:CwCwCwCw": "RiRiRiRi:CzCzCzCz",
            // T4 painting
            "WpWpWpWp:CwCwCwCw:WpWpWpWp": "WiWiWiWi:CzCzCzCz:WpWpWpWp",
            // T5 painting
            "WpWpWpWp:CwCwCwCw:WpWpWpWp:CwCwCwCw": "WiWiWiWi:CzCzCzCz:WpWpWpWp:CzCzCzCz",
            // Preparement
            "--CpRpCp:SwSwSwSw": "--CiRiCi:ShShShSh",
            // Logo
            "RuCw--Cw:----Ru--": "RkCw--Cw:----Rk--",
            // Rocket
            "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw": "CbCsCbCs:Sr------:--CrSoCr:CwCwCwCw",
        };
        
        this.signals.modifyUpgrades.add(upgrades => {
            const isIndustries = $.MODS.mods.some(m => m.metadata.id === "shapez-industries");
            if (isIndustries) {
                return;
            }
            for (let lvl = 0; lvl < 999; lvl++) {
                for (const type in upgrades) {
                    for (const idx in upgrades[type][lvl].required) {
                        const from = upgrades[type][lvl].required[idx].shape;
                        if (vanillaReplacements[from]) {
                            upgrades[type][lvl].required[idx].shape = vanillaReplacements[from];
                        }
                    }
                }
            }
        });
    }
}

const RESOURCES = {
    "orange.png":
        "data:image/png;base64,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",
    "light_green.png":
        "data:image/png;base64,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",
    "mint.png":
        "data:image/png;base64,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",
    "light_blue.png":
        "data:image/png;base64,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",
    "dark_purple.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAADiZJREFUeJztnGlwHMd1x/89s7sA9sC1OHlIgEACBAhAoqzLoZRQtCKWY8kySEGESILiF39x5LgiJ/4gJSnZShyFSaVox4mr6FSJtoiDXJGgCKtoW4zLNiTzEElRIHEQPAAQFxdYLLA3dndmXj6AO5jZC7vYBVlJ4fdp3uvu1z1ve2b6eL3ACiussMIKK6zw/xSWTmPfaGoq48A/BlAliD0AUA4DeIkxPyeRg8AGGahPCmrOdXT8YjoZ2y+++mqBTmRPEFg1A5VLHMvhiDIIEAHmAKPbABsAR58db20dTtc9peygHU1Nj0HimonhRQDlCRaTGNBNhGMSJx0+0d4+FC1TY2NzucQJzQRsB1gdAC5B+7cAOgnw7x8/cvhSgmWislQHsYadu77OGN4E4YlUGgBAAtGHErF/OmFpvQgA23fufhygNwG8lEIbQ5xlRD88drTtlwAo2cJJV96ws7kWEP6LgT0TL1+GNhcaLgMaLgtB0QtB9CAgeuIVIWJk4YgxAl6O1zYdb4CGN0DL6yFIPgiSH/7gbPyGM/yeF9m3LJaW3vgZw4slkXfHzl1/RcB+ALrwxDx9BUqyH0WBsQamrLXQclkRBvyCE7O+QdhcvRh3nIc3MJlQxQZdMUpzH0eBsQZ5WeXQabIj8giiF865UdjcvZhwXsSs91Y0UwIx/F1He+t+JNibEnLQvn37Mp1e//tg7GWlnmMarM17GhWFfwFT5upETMkQEeyefgxMdmLS9UVkwxhQZHoE6wpfgNmwAYwl19ldc2O4MfURRmY+AZEYnnzE55x57dSpU/7F7Cxaa2Njo1HgNJ0MbItSX2SqR/3qfTBkFCfV8GjY3L3oHjsE19yYSv9QwTbUrmpO2jlK3P4JdI8dwpTrqjqB8Fuegi9ZLBZ3vPJ8vMTGxkadyLQfMsa+EtJxnBa1q/agbtVe6DTGJTdciV5XiAfNWyCIc5jx3pD1M96bkCCg0Fi7ZNs6jQlr855BljYPk64rIEjzCQzlBM2jz2z+8tGLFy9KscrHdVBV/cMHGRYeKw2XiSfK38Ca3D9J6VeNBmM8irMfhk6bjUnnwiNn91yDXluAHH1ZSvZz9eUoMGzAuPMCJArerRTrvP5gUV/PlV/GKhfTQdubdjUzYj8IyRouE5sr3oLZsCGlhi5Gnr4Ceq0ZVtfC8GXKfQUl2V9ChjYnJdt6XSEKjTUYnT2jfC89VrOxdqCv5+rVaGWiOqixsbGEGP8RgMx5DcOT5d+F2bi8zgmRoy8DCLB5+gAARCJmfbdQZn4WqQ6LsrT5yNE/gNGZMwtKxp6trdnwXm9vrzc8f9SRqchp9wPIDclVxQ0oMtWn1LBkqSppQKGpTpZnvbcwNP3btNguNm1CZdHXlap8gde8Gy1vhIMaG/dUAdgdkk2Za1BV/I20NCw5GDat/SY0XKasGbCegCQF02K9qmS7amjCiL22Y9eu9eH5Ihwk8OL3lPr61XvBWNx3+bKRpTVjXdELsuwL2jEy80labHNMg9pVe5QqnkR8LyKfUmhubjYwYq+E5HzDehQYN6alQUulomAbtLxeloftv0ub7SJTPfL065SqpubmZoNSoXKQ1y80AJAHN+XmP09bY5aKhtdjbe5mWZ713YQnYE2b/fKC55Si0R0QX1QqVA4ixp4PXfNcBkpzHk9bQ1JhTf7T8jURYcp1JW22S3MeB88tTC0ZsE2ZrgnLvyV0YTZsUBVcLohEeAKTCIguiGIAwPyPk6E1IUtbCI7xyNNXQMsbERTnZwVT7j6UmZ+LZzZhNFwmzPoqTLplp29RpYcuGhsbc0RgbUg2GyrT0oBwJCkIq6sbNtcV2Dx9cPknok0mAcyPrk2Zq2A2VMOoK8KMb95BrrmRtLYp36hyUNlXd+/OPtXS4gQUDgpCW6V83oxJzs4XwxuYws2pUxiZ+VTuCYtBJMLpG4HTp3aIx2+FRCK4NH1djRmrVLJeFCsBXAAUDmIcK1Iukeh15rRU7hdc6L9zBMP2P8TsKckikYAvRn+GjaV70jJhNugKwyrgikKXsoM4kkykmIBqoix4JcvYzB/RPf5zBITIHsMYj7ysCuQbKmHMLEWWziwvsgUlH3yBabjnJmD3XsOs9xakMOfetnfB6ryM+tX7sCr3qZTaqeEzVTJxzCSnLSg5BlroQanM1iUS0D32cwxHmRrkZD2IcvNzWJX7lGp8E4+A6MHYzFkM20/D4bst6/2CC58N/wfK3H0pDmgj7lU2pPiKMbfyERPEuSVVJUp+nB/6UcQqoTGjFLWrd6PI+EjSztfxBpQXfAVl5q2wuj7H1bEWeAJ35PSh6dNw+yfwZNkbEb0hEcLvlQjO0PXCe1ki1T6VLziTdEWiFMCZwf1hzmGoLHoJz1a9i2LTppR6JmMMJdmPYmvVu1hf9KLKls3dg7ND/7akuZovaFcrJEn2hewgngIDyjxu/3iS1RAu3v5PTLv7ZY2Gy8RTD/0tqktfAcfCh1xLh+O0qCltwhNl3wXPZcj6aXcfLo38FETJ7e64/RNqhaCVfSE7yGKxTIEgbzPYPQNIhuuTnZhwXJBlLa/H5oq3UGx6OCk7yVCSvQmbK96ERvEuG5s9h5u2U0nZsXuuKSR2R7nrGzabpz+ErqbdfQl/lme9g+i/84Esc0yLJ8v/Brn6h5Jq6FLI06/DU2VvgOO0sq53ol31Mo+HRAJsnn6Fhn6vTFc7iOF06DIgemCNsh0TCaF77D3VZ7h+9V6YDVUJNTAdmI3VqC3dtdAiEtE9+l5Cj5rVeRmCqFhIZPhYma6erAa0HwAIhOSh6f9ZtILR2TOY8d6U5ZLsR/Ggeeui5dJNecHzKDZtkmW7dwDjjvOLlgtbpfTzYrBDqVA56O6z1xmSJ11fwOEbimmciHDd+qEs85wOdWteW7RRy0X9mr3g2MKjdn3yRNxeNOu9pfriMuCkxWJRfdIiVhQlCftD10SEK+O/iFnJtKcPzrlRWX4wfyv02oKEbmY50OuKUJa/RZYdvtthL+AFiAhXxt5XqUQJ/xKeL8JBJyyt5xkgfwam3dcwbI++WD5i71JIDBVFX13kFpafiqKvQTkyHpmNvkQ7aD8Nu1fxpSbqDEWXKIkeb8PjOwDkfeur44fh8IXHJBGsrs9lqdC08b72nhB6XSEKFNtTVseliCdg1juInrEWpcrHNOyvo9mL6qBjra3XGejtkCxKAZwd/Fd4A1NyHodvBH7BJcslOY8ldSPLSUn2QlvmBAdc/oU9f29gan7ETYoRN7G/P9baGjUcJGbEVl111X4Q+5VcUXAGn974R3mErfxyAUCBoTrZ+1g2Ck01Kjm03++aG8MnN98JjyXqPH605d9j2YrpoLfffluSAtpXAXSHdN6gDV03vg+r8zI8iqkIxzQwZpQmex/LhjFjtWpm756bwB3nJXTd+AF8gYUpJwMu+zRsD+LECsVdH+jvvzy3vm7jSQb2AgMKgPnHbcxxBv6gA8G7EWOGjBJUFG6LZ+qewhiH0ZlPEbi7cjknOjA8fRqiFFDm6oOW29bZ0hI3mHTRoMiT7e3jAkdPA+xcSEdE8Ciiw3QaQ9Sy9xMtv9Amr98a9qJmf6QA/8zxw4cnIkuqSShqtLOtzeZz2v+MEX4cLZ1ny7/7kSxxdmQO+pz2rYmGISe8BnE3XO0725uafgPifgxAnomKFIhd8D4hShHRdTeIo293tLX9Klr+WCQadyxzvL39I14K1gJMHqNHW3O+3wTUOyefZ2fp6pJ1DrAEBwGAxWLxAdKvQ7InMJm2HYt0IJEAX8AmywT260OHDi1pDXlJDgIARpw8ySESVXOy+43TN6JafmGMok/IEmDJDuIIZ5WyzZNUfPayYvP0qGRe5M7EyLooS3aQxdLSBzB5a2HC8dlSTaWd8VllW2jMYjl873sQAAJIXlyyewZUWzH3C7d/ArM+5TSIdcTMnACpOAgkkbygQkS4MRkzmvaecd16UjUoZEw6nIq9lBzUYWk7A0Duz7ftXZFbKPcQ19woRmY/VWjYuWPt7ediFkiAlBwEAIzoh6Hr+aCCxBbL0w+he+yQerjBxHdStZpy/Ehfz9Vr1bV1f4q7h+m8gSlo+AzkL1N8USwGrB/itl2xY0P4+PiRtn9I1W7KPQgAEcS/BCAPxPomjqpWG5ebO85L6LceU6p8xMTX02E7LRFI/T09tpraOjuArwEAgTDhuIB8w3rodUWLlE6NKddVfDZ8ABIJCi19q+NI+8cxCyVB2gKg+3quXKiurSsD8AgwP7oec5yFQVeA7KwH0lWNihF7Fy7c/ol6+RT47+NH2r6frjrSGiFeXGj+KMuQ/SUwVAIAkYQJxwXMCbMwG6vBK/asUkEQvegeO4R+6wcLx5vm6bRbx/cODQ3FPN6ULGl10NDQkFRbs+EDYvx6APIhL4dvECMzXdBpjDBlrgFjS3v1EYkYsXfh/NABTKv20wEAx7KzdK+eOHEirWsvaT9j0NvbK+5s3NFhnZrWgmEz7m5SCdIc7jguYnTmE4jkR5bWrFr1i4c3MIVB28f4fOQgRma6IEiqiblEYO88XF35+oEDB9JzkENBek/FhbHjlV3biOEggKgvIWNGKfINlTBlrkKWtkA+uCJIc/AGbHD7xzHtvhZvCjPECN88drT1dKwMqbKsDgLmz394gsJbIPZtKI45pIgLDD8Keoz/3Nl5MOKMVzpZdgeFaGjYa2Za4XUw7ANQtkQzgwx0iJOEn4QHGSwX98xByjpfbmr6sgTuecyH/deCECso20agq4zY74joNx2WtrNYwr8npML9cFAEDQ17zRqNVBCEZAQALTi3IHC2ZP8AZYUVVvg/x/8Ch0KZ8CFs58kAAAAASUVORK5CYII=",
    "pink.png":
        "data:image/png;base64,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",
    "black.png":
        "data:image/png;base64,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",
    "ghost.png":
        "data:image/png;base64,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",

    "display-orange.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARNJREFUeJzt28FKw0AUhtEziQ9hwa2iD2iLuC4FwecT3bqp79BkupCkUXGpgeb/Vpm7unPIdkgJyvdB3Vq5cKvXzrHQn9boFC9lbT8df0GoO/eKHWcIcKpTbcqD52EwItStlda78wYY6jSuhj+iGceta8sAgFbvZjicEOrkewlN7rusi/9SEAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQcAUoehn3OP/m9z3hNB4QzfHPjN00HkdDiNCWdurNs4f4qBal0cfw+DnW+knl6q7Jb2VTumzI+llKhy0TB0DAAAAAElFTkSuQmCC",
    "display-light_green.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARhJREFUeJzt27FNw0AYhuHH2OxAJFoQzJICMQxkBCpGSUHBLAhamrCDnaNAZ0wQJYkUf2/l+6u7R25/UoJmd7AuFh1XhfYQF/rPGoaOl2VjszP/7qm4Kzw4QoBJQ2F123isgxFhXSxa3h03QG045bz+ESd12nFhHgDQ9lzWw4iwnXzPoel7Z/XwvwqCICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAI+LkMtT3kRfbd9L3TlcA3DAe50f7r8VoPI8KysSmsHD9Ej/ubxkcd/NqVfi7Oeq7ntCud0lefrXgoyhoz4CAAAAAASUVORK5CYII=",
    "display-mint.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARRJREFUeJzt2zFOw0AURdEzDtkDkWhBsDaaNCFLoEKhYW0IWhpYA3FMYRk7wi2yZL/bzZeLmSO3n5Sg/Jk0hw3VLafVBPf556qai1fl/nM4PUdonnd4xAwBfquxV7ZP3aBHaA4byod5A3TVrK+6P6Lq5+XaMgBgxfdNdxggNNXY1/Otf+/CHj5eEAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQcD5NtxpumtMUf/eAcL6Xbs4uYSOeOsOPUK7KLk3f4gjHpTtVzcY2ZV+ueR4t6Rd6ZTafgAWASYJbVj6agAAAABJRU5ErkJggg==",
    "display-light_blue.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARVJREFUeJzt27FKxEAUhtEzWR/CBVtFH1C3EGFBFiufT7S1Wd8hyWwhMZHVUgPZ/+vmkuLOIe2QEpSjya6uta41VjPs87f1OtWLbdlPx98RHuut6okFAox1io2H8jwMRoRdXeu8WzbAUKd3MfwRzde4unQaALBy5mo4TBGaHz9fapP7ntbFfykIgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgYIpQ9DPu8f9N7jsitN7QzbHPDLWK1+EwImzLXrGxfIhWcee+fAyD47fS23quuDmlt9IpfXYAXm4sKrfRNrQAAAAASUVORK5CYII=",
    "display-dark_purple.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARVJREFUeJzt27FNHFEUQNEzsEWA5BQEtRBQDaYEIkpxQOBaLEhJoIddhoCdZYxFiJF27o1mXvT/0U8fVTB8HPwyHq84Gzn8jgN9ZQObFX8uDE8f5u/dGa9wYw8BZm1wfWm4nQY7hO0LeLTfAFObFT+mF3EwTVecWAYAHK45nX52CC+z7yU0v++iLv5ZIQgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBIeDvZaiX7zzI/25+3/lK4IO3xckltMb99LND2C5KXtt/iPXIz0vD8zT4Z1f6t/FozfmSdqWr3noFVtQmysED7/oAAAAASUVORK5CYII=",
    "display-pink.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAARZJREFUeJzt27FNw0AYhuHnbIYAiRYEe1AgMQ9kBCrGQbAJgpYGdrATiuRiB7mFSPb3dvfLhe/RtT8pQfk92Hg9wxXa//+dP6+nfyvuvsbDA4SNl3vKo3kC1HqsitunOtgj7F7Ap3kD1Hr68/oimmFeLiwDAFpOLuthhLBupr6eb8N9F3bx6YIgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCDhCa9fF+4xgN9x0hdB+2i5NLqKN9r4c9wm5RcmX+EB3lobj5roOJXennU9pr81wUndyVTmnbD6KxJcEb+cbxAAAAAElFTkSuQmCC",
    "display-black.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABBCAYAAACO98lFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAATtJREFUeJzt279Nw0AYh+EndpQZIKIFQRsrEzATMAIVG7FBkhpBixQxAHT2hQI5Mv9KiJT83u4+ubh7dC6PlGD0ddA0zTHOSyn1Dvbzp1VV1VVV9bBYLF6G808Is9nsCrfYO4BB3Wg0ulmtVnf9YIvQNM3xZrN5tt8AfV1d1yf9jaj6aSnl1GEAQN227Vm/2CLUdV39/P1+NjzvQR38t4IgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCgoAgIAgIAoKAICAICAKCgCAgCAgCBghd15VdbuS/G553izAej5/Q7WRH/187mUwe+8X2HeR6vX6dTqdvuLTfv0mL6+Vyed8Pvr2Vns/nR6WUi0N6K53SR+/D0EBBBEd6bAAAAABJRU5ErkJggg==",
    "display-ghost.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC",
};
